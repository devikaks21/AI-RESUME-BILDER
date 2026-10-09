/**
 * ResumeAI — Voice Assistant UI & Conversational Orchestrator
 * Integrates natural voice interactions into the existing Resume Builder.
 * Synchronizes with resumeState, appController, livePreviewEngine, and AI Assistant.
 */

class VoiceAssistantController {
  constructor() {
    this.isOpen = false;
    this.currentState = 'IDLE'; // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONSE' | 'ERROR'
    this.conversationContext = {
      activeStep: null,
      stepData: {}
    };
    this.pendingConfirmation = null;

    // DOM Elements
    this.fab = null;
    this.panel = null;
    this.micBtn = null;
    this.stopBtn = null;
    this.transcriptText = null;
    this.msgContainer = null;
    this.textInput = null;
    this.sendBtn = null;
    this.ttsToggle = null;
    this.langSelect = null;
    this.closeBtn = null;
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.updateUIState('IDLE', 'Click the microphone and speak.');

    // Check speech recognition browser capability
    if (!window.speechService || !window.speechService.isRecognitionSupported()) {
      this.addMessage('assistant', '👋 Welcome to ResumeAI Voice Assistant! Note: Live microphone input is not supported in this browser, but you can type any voice command below (or use Chrome/Edge for voice input). Normal builder editing remains 100% functional.', false);
    } else {
      this.addMessage('assistant', '👋 Hi! I am your ResumeAI Voice Assistant. You can speak commands like "Add Python to my skills", "Open education", "My name is Devika KS", or say "Help" to see everything I can do.', false);
    }
  }

  cacheElements() {
    this.fab = document.getElementById('voiceFab');
    this.panel = document.getElementById('voiceAssistantPanel');
    this.micBtn = document.getElementById('voiceMainMicBtn');
    this.stopBtn = document.getElementById('voiceStopBtn');
    this.transcriptText = document.getElementById('voiceLiveText');
    this.msgContainer = document.getElementById('voiceMsgContainer');
    this.textInput = document.getElementById('voiceTextInput');
    this.sendBtn = document.getElementById('voiceTextSendBtn');
    this.ttsToggle = document.getElementById('voiceTtsToggle');
    this.langSelect = document.getElementById('voiceLangSelect');
    this.closeBtn = document.getElementById('voiceCloseBtn');
  }

  bindEvents() {
    // 1. Floating Action Button
    if (this.fab) {
      this.fab.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });
    }

    // 2. Close / Minimize Button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.closePanel();
      });
    }

    // 3. Main Microphone Trigger
    if (this.micBtn) {
      this.micBtn.addEventListener('click', () => {
        if (this.currentState === 'LISTENING') {
          this.stopListening();
        } else {
          this.startListening();
        }
      });
    }

    // 4. Dedicated Stop Button
    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', () => {
        this.stopListening();
      });
    }

    // 5. Fallback Keyboard Input
    if (this.sendBtn && this.textInput) {
      const handleSend = () => {
        const text = this.textInput.value.trim();
        if (text) {
          this.textInput.value = '';
          this.handleUserInput(text);
        }
      };

      this.sendBtn.addEventListener('click', handleSend);
      this.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSend();
        }
      });
    }

    // 6. Voice Response (TTS) Toggle
    if (this.ttsToggle) {
      this.ttsToggle.addEventListener('click', () => {
        const newState = !window.speechService.voiceResponsesEnabled;
        window.speechService.toggleVoiceResponses(newState);
        this.ttsToggle.classList.toggle('active', newState);
        const label = this.ttsToggle.querySelector('.voice-toggle-label');
        if (label) label.textContent = newState ? 'Voice Output: ON' : 'Voice Output: OFF';
        window.showToast(newState ? 'Assistant voice responses enabled' : 'Assistant voice muted', 'info');
      });
    }

    // 7. Language Selector
    if (this.langSelect) {
      this.langSelect.addEventListener('change', () => {
        const res = window.speechService.setLanguage(this.langSelect.value);
        if (!res.success) {
          this.addMessage('assistant', `⚠️ ${res.message}`, true);
          this.langSelect.value = 'en-US';
        } else {
          this.addMessage('assistant', `✓ ${res.message}`, true);
        }
      });
    }

    // 8. Quick Suggestion Chips Click
    document.querySelectorAll('.voice-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.cmd || chip.textContent;
        this.handleUserInput(cmd);
      });
    });

    // 9. Keyboard Escape Key to close panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePanel();
      }
    });
  }

  togglePanel() {
    if (this.isOpen) {
      if (this.currentState === 'LISTENING') {
        this.stopListening();
      } else {
        this.closePanel();
      }
    } else {
      this.openPanel();
      this.startListening();
    }
  }

  openPanel() {
    this.isOpen = true;
    if (this.panel) {
      this.panel.classList.add('open');
      this.panel.setAttribute('aria-hidden', 'false');
    }
    if (this.fab) {
      this.fab.setAttribute('aria-expanded', 'true');
    }
    if (this.textInput) {
      setTimeout(() => this.textInput.focus(), 150);
    }
  }

  closePanel() {
    this.isOpen = false;
    this.stopListening();
    if (window.speechService) window.speechService.stopSpeaking();
    if (this.panel) {
      this.panel.classList.remove('open');
      this.panel.setAttribute('aria-hidden', 'true');
    }
    if (this.fab) {
      this.fab.setAttribute('aria-expanded', 'false');
    }
  }

  /* ==========================================================================
     Voice State Management
     ========================================================================== */
  updateUIState(state, statusText = '') {
    this.currentState = state;

    const statePill = document.getElementById('voicePanelStatePill');
    const fabStatus = document.getElementById('voiceFabStatus');

    if (this.fab) {
      this.fab.className = 'voice-assistant-fab ' + state.toLowerCase();
    }

    if (this.micBtn) {
      this.micBtn.className = 'voice-main-mic-btn ' + state.toLowerCase();
      const label = this.micBtn.querySelector('.voice-btn-label');
      if (label) {
        switch (state) {
          case 'LISTENING':
            label.textContent = 'Listening... (Click to stop)';
            break;
          case 'PROCESSING':
            label.textContent = 'Understanding request...';
            break;
          case 'SPEAKING':
            label.textContent = 'Assistant speaking...';
            break;
          case 'ERROR':
            label.textContent = '⚠️ Try again';
            break;
          case 'IDLE':
          default:
            label.textContent = '🎤 Click to speak';
            break;
        }
      }
    }

    if (statePill) {
      statePill.className = 'voice-panel-state-pill ' + state.toLowerCase();
      statePill.textContent = state;
    }

    if (fabStatus) {
      fabStatus.textContent = statusText || state;
    }

    if (this.stopBtn) {
      this.stopBtn.classList.toggle('visible', state === 'LISTENING' || state === 'SPEAKING');
    }
  }

  /* ==========================================================================
     Start / Stop Listening Pipeline
     ========================================================================== */
  startListening() {
    this.openPanel();
    this.updateUIState('LISTENING', 'Listening...');
    this.setTranscript('Listening for your voice...');

    window.speechService.startListening({
      onStart: () => {
        this.updateUIState('LISTENING', 'Listening...');
      },
      onInterim: (interim) => {
        this.setTranscript(`"${interim}"`);
      },
      onFinal: (final) => {
        this.setTranscript('');
        this.handleUserInput(final);
      },
      onError: (err) => {
        this.updateUIState('ERROR', err.message);
        this.addMessage('error', `⚠️ ${err.message}`, false);
        this.setTranscript('');
        setTimeout(() => this.updateUIState('IDLE', 'Click to speak'), 4000);
      },
      onEnd: () => {
        if (this.currentState === 'LISTENING') {
          this.updateUIState('IDLE', 'Click to speak');
        }
      }
    });
  }

  stopListening() {
    window.speechService.stopListening();
    this.setTranscript('');
    if (this.currentState === 'LISTENING') {
      this.updateUIState('IDLE', 'Click to speak');
    }
  }

  setTranscript(text) {
    if (this.transcriptText) {
      this.transcriptText.textContent = text;
      const strip = document.getElementById('voiceLiveTranscriptStrip');
      if (strip) {
        strip.style.display = text ? 'flex' : 'none';
      }
    }
  }

  /* ==========================================================================
     Message History Stream & Speech Response
     ========================================================================== */
  addMessage(sender, text, shouldSpeak = true) {
    if (!this.msgContainer) return;

    const msgEl = document.createElement('div');
    msgEl.className = `voice-msg ${sender}`;

    const authorText = sender === 'user' ? 'You' : sender === 'error' ? 'System Notice' : 'ResumeAI';
    const authorIcon = sender === 'user' ? '👤' : sender === 'error' ? '⚠️' : '🤖';

    msgEl.innerHTML = `
      <div class="voice-msg-author">${authorIcon} ${authorText}</div>
      <div class="voice-msg-bubble">${this.escapeHtml(text)}</div>
      ${sender === 'assistant' ? `
        <div class="voice-wave-container" style="display:none;">
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
        </div>
      ` : ''}
    `;

    this.msgContainer.appendChild(msgEl);
    this.msgContainer.scrollTop = this.msgContainer.scrollHeight;

    if (sender === 'assistant' && shouldSpeak) {
      const wave = msgEl.querySelector('.voice-wave-container');
      this.updateUIState('SPEAKING', 'Assistant speaking...');
      if (wave) wave.style.display = 'flex';

      window.speechService.speak(text, {
        onStart: () => {
          this.updateUIState('SPEAKING', 'Assistant speaking...');
          if (wave) wave.style.display = 'flex';
        },
        onEnd: () => {
          this.updateUIState('IDLE', 'Click to speak');
          if (wave) wave.style.display = 'none';
        }
      });
    }
  }

  /* ==========================================================================
     Core Command Execution Pipeline
     ========================================================================== */
  handleUserInput(rawText) {
    if (!rawText || !rawText.trim()) return;

    const text = rawText.trim();
    this.addMessage('user', text, false);
    this.updateUIState('PROCESSING', 'Understanding request...');

    // If pending confirmation for a destructive action
    if (this.pendingConfirmation) {
      this.handleConfirmationInput(text);
      return;
    }

    // Parse command
    setTimeout(() => {
      const parsed = window.voiceCommandParser.parse(text, this.conversationContext);
      this.executeIntent(parsed);
    }, 180);
  }

  executeIntent(parsed) {
    const resume = window.resumeState.currentResume;
    if (!resume) {
      this.addMessage('error', 'No active resume found.');
      this.updateUIState('IDLE');
      return;
    }

    switch (parsed.intent) {
      // 1. Personal Information Updates
      case 'UPDATE_PERSONAL_INFO': {
        const entities = parsed.entities || {};
        let updatedFields = [];

        if (entities.fullName) {
          resume.personal.fullName = entities.fullName;
          updatedFields.push(`name to "${entities.fullName}"`);
        }
        if (entities.jobTitle) {
          resume.personal.jobTitle = entities.jobTitle;
          updatedFields.push(`title to "${entities.jobTitle}"`);
        }
        if (entities.email) {
          resume.personal.email = entities.email;
          updatedFields.push(`email to "${entities.email}"`);
        }
        if (entities.phone) {
          let p = entities.phone;
          if (p.length === 10 && !p.startsWith('+')) {
            p = `+91 ${p.slice(0, 5)} ${p.slice(5)}`;
          }
          resume.personal.phone = p;
          updatedFields.push(`phone to "${p}"`);
        }
        if (entities.location) {
          resume.personal.location = entities.location;
          updatedFields.push(`location to "${entities.location}"`);
        }

        this.syncAllChanges();
        this.addMessage('assistant', `Updated your ${updatedFields.join(', ')}.`);
        this.updateUIState('IDLE');
        break;
      }

      // 2. Add Skills
      case 'ADD_SKILL': {
        const skillsToAdd = parsed.entities.skills || [];
        if (skillsToAdd.length === 0) {
          this.addMessage('assistant', 'Please tell me which skills you would like to add.');
          this.updateUIState('IDLE');
          return;
        }

        window.resumeState.ensureSkillCategories(resume);
        let addedCount = 0;

        skillsToAdd.forEach(skillName => {
          // Determine best category or default to first
          const targetCat = this.findOrCreateCategoryForSkill(resume, skillName);
          if (!targetCat.skills) targetCat.skills = [];

          const exists = targetCat.skills.some(s => s.toLowerCase() === skillName.toLowerCase());
          if (!exists) {
            targetCat.skills.push(skillName);
            addedCount++;
          }
        });

        this.syncAllChanges();

        const msg = addedCount === 1
          ? `Added "${skillsToAdd[0]}" to your skills.`
          : `Added ${skillsToAdd.join(', ')} to your skills.`;
        this.addMessage('assistant', msg);
        this.updateUIState('IDLE');
        break;
      }

      // 3. Remove Skill
      case 'REMOVE_SKILL': {
        const toRemove = (parsed.entities.skill || '').toLowerCase();
        window.resumeState.ensureSkillCategories(resume);
        let removed = false;

        resume.skillCategories.forEach(cat => {
          if (cat.skills) {
            const idx = cat.skills.findIndex(s => s.toLowerCase() === toRemove);
            if (idx !== -1) {
              cat.skills.splice(idx, 1);
              removed = true;
            }
          }
        });

        if (removed) {
          this.syncAllChanges();
          this.addMessage('assistant', `Removed "${parsed.entities.skill}" from your skills.`);
        } else {
          this.addMessage('assistant', `Could not find "${parsed.entities.skill}" in your skills list.`);
        }
        this.updateUIState('IDLE');
        break;
      }

      // 4. List Skills
      case 'LIST_SKILLS': {
        const allSkills = window.resumeState.getAllSkills(resume);
        if (allSkills.length === 0) {
          this.addMessage('assistant', 'You have not added any skills yet. Say "Add Python, Java and SQL" to add some.');
        } else {
          this.addMessage('assistant', `You currently have ${allSkills.length} skills: ${allSkills.slice(0, 10).join(', ')}${allSkills.length > 10 ? ' and more.' : '.'}`);
        }
        this.updateUIState('IDLE');
        break;
      }

      // 5. Multi-Step Add Project
      case 'START_ADD_PROJECT': {
        this.conversationContext = {
          activeStep: 'COLLECT_PROJECT_NAME',
          stepData: {}
        };
        this.addMessage('assistant', parsed.question);
        this.updateUIState('IDLE');
        break;
      }

      case 'PROJECT_NAME_PROVIDED': {
        this.conversationContext = {
          activeStep: 'COLLECT_PROJECT_TECH',
          stepData: { title: parsed.entities.title }
        };
        this.addMessage('assistant', parsed.question);
        this.updateUIState('IDLE');
        break;
      }

      case 'UPDATE_PROJECT_TECH': {
        if (!resume.projects) resume.projects = [];
        if (resume.projects.length > 0) {
          resume.projects[0].techStack = parsed.entities.techStack;
          this.syncAllChanges();
          this.addMessage('assistant', `Updated tech stack for "${resume.projects[0].title}" to ${parsed.entities.techStack}.`);
        } else {
          this.addMessage('assistant', 'No projects exist yet. Say "Add a project" to create one.');
        }
        this.updateUIState('IDLE');
        break;
      }

      case 'PROJECT_CONVERSATION_COMPLETE': {
        if (!resume.projects) resume.projects = [];
        const newProj = {
          id: 'proj-' + Date.now(),
          title: parsed.entities.title || 'Featured Project',
          techStack: parsed.entities.techStack || '',
          description: parsed.entities.description || '',
          link: ''
        };
        resume.projects.unshift(newProj);
        this.conversationContext = { activeStep: null, stepData: {} };
        this.syncAllChanges();
        this.addMessage('assistant', `Project "${newProj.title}" has been successfully added to your resume!`);
        this.updateUIState('IDLE');
        break;
      }

      case 'REMOVE_PROJECT': {
        const toRem = (parsed.entities.title || '').toLowerCase();
        if (resume.projects && resume.projects.length > 0) {
          const prevLen = resume.projects.length;
          resume.projects = resume.projects.filter(p => !p.title.toLowerCase().includes(toRem));
          if (resume.projects.length < prevLen) {
            this.syncAllChanges();
            this.addMessage('assistant', `✓ Removed project "${parsed.entities.title}".`);
          } else {
            this.addMessage('assistant', `Could not find project "${parsed.entities.title}".`);
          }
        } else {
          this.addMessage('assistant', 'No projects found in your resume.');
        }
        this.updateUIState('IDLE');
        break;
      }

      // 6. Multi-Step Add Education
      case 'START_ADD_EDUCATION': {
        this.conversationContext = {
          activeStep: 'COLLECT_EDU_DEGREE',
          stepData: {}
        };
        this.addMessage('assistant', parsed.question);
        this.updateUIState('IDLE');
        break;
      }

      case 'EDUCATION_DEGREE_PROVIDED': {
        this.conversationContext = {
          activeStep: 'COLLECT_EDU_COLLEGE',
          stepData: { degree: parsed.entities.degree }
        };
        this.addMessage('assistant', parsed.question);
        this.updateUIState('IDLE');
        break;
      }

      case 'UPDATE_EDUCATION_INSTITUTION': {
        if (!resume.education) resume.education = [];
        if (resume.education.length > 0) {
          resume.education[0].institution = parsed.entities.institution;
          this.syncAllChanges();
          this.addMessage('assistant', `Updated college name to "${parsed.entities.institution}".`);
        } else {
          resume.education.push({
            id: 'edu-' + Date.now(),
            degree: 'Bachelor of Computer Applications',
            institution: parsed.entities.institution,
            startDate: '2024',
            endDate: '2028',
            grade: 'CGPA: In Progress'
          });
          this.syncAllChanges();
          this.addMessage('assistant', `Added education at "${parsed.entities.institution}".`);
        }
        this.updateUIState('IDLE');
        break;
      }

      case 'UPDATE_EDUCATION_GRADE': {
        if (!resume.education) resume.education = [];
        if (resume.education.length > 0) {
          resume.education[0].grade = parsed.entities.grade;
          this.syncAllChanges();
          this.addMessage('assistant', `Updated education grade to "${parsed.entities.grade}".`);
        }
        this.updateUIState('IDLE');
        break;
      }

      case 'UPDATE_EDUCATION_YEAR': {
        if (!resume.education) resume.education = [];
        if (resume.education.length > 0) {
          resume.education[0].endDate = parsed.entities.endDate;
          this.syncAllChanges();
          this.addMessage('assistant', `Updated graduation year to "${parsed.entities.endDate}".`);
        }
        this.updateUIState('IDLE');
        break;
      }

      case 'EDUCATION_CONVERSATION_COMPLETE': {
        if (!resume.education) resume.education = [];
        const newEdu = {
          id: 'edu-' + Date.now(),
          degree: parsed.entities.degree,
          institution: parsed.entities.institution,
          startDate: parsed.entities.startDate,
          endDate: parsed.entities.endDate,
          grade: parsed.entities.grade
        };
        resume.education.unshift(newEdu);
        this.conversationContext = { activeStep: null, stepData: {} };
        this.syncAllChanges();
        this.addMessage('assistant', `Added ${newEdu.degree} at ${newEdu.institution} to your education history.`);
        this.updateUIState('IDLE');
        break;
      }

      // 7. Experience / Internships
      case 'START_ADD_EXPERIENCE': {
        this.addMessage('assistant', parsed.question);
        this.updateUIState('IDLE');
        break;
      }

      case 'EXPERIENCE_DETAILS_PROVIDED': {
        if (!resume.experience) resume.experience = [];
        resume.experience.unshift({
          id: 'exp-' + Date.now(),
          role: parsed.entities.role,
          company: 'Technology Solutions',
          location: 'Remote',
          startDate: '2025',
          endDate: 'Present',
          description: 'Contributed to application development and software features.'
        });
        this.syncAllChanges();
        this.addMessage('assistant', `Added experience "${parsed.entities.role}".`);
        this.updateUIState('IDLE');
        break;
      }

      // 8. Certifications
      case 'ADD_CERTIFICATION': {
        if (!resume.certifications) resume.certifications = [];
        resume.certifications.push({
          id: 'cert-' + Date.now(),
          title: parsed.entities.title,
          issuer: 'Verified Certification',
          date: new Date().getFullYear().toString(),
          credentialUrl: ''
        });
        this.syncAllChanges();
        this.addMessage('assistant', `Added "${parsed.entities.title}" to certifications.`);
        this.updateUIState('IDLE');
        break;
      }

      case 'REMOVE_CERTIFICATION': {
        const toRem = (parsed.entities.title || '').toLowerCase();
        if (resume.certifications) {
          resume.certifications = resume.certifications.filter(c => !c.title.toLowerCase().includes(toRem));
          this.syncAllChanges();
          this.addMessage('assistant', `Removed certification "${parsed.entities.title}".`);
        }
        this.updateUIState('IDLE');
        break;
      }

      // 9. Achievements
      case 'ADD_ACHIEVEMENT': {
        if (!resume.achievements) resume.achievements = [];
        resume.achievements.push({
          id: 'ach-' + Date.now(),
          title: parsed.entities.title,
          description: 'Recognized for outstanding achievement.'
        });
        this.syncAllChanges();
        this.addMessage('assistant', `Added "${parsed.entities.title}" to achievements.`);
        this.updateUIState('IDLE');
        break;
      }

      // 10. Navigation Commands
      case 'OPEN_SECTION': {
        const secKey = parsed.entities.sectionKey;
        this.navigateToSection(secKey);
        this.addMessage('assistant', `Opening your ${parsed.entities.sectionName || secKey} section.`);
        this.updateUIState('IDLE');
        break;
      }

      // 11. Save Resume
      case 'SAVE_RESUME': {
        window.resumeState.saveState();
        window.showToast('✓ Resume saved successfully!', 'success');
        this.addMessage('assistant', 'Your resume has been saved successfully.');
        this.updateUIState('IDLE');
        break;
      }

      // 12. Preview Resume
      case 'PREVIEW_RESUME': {
        const previewCol = document.getElementById('builderPreviewColumn');
        if (previewCol) {
          previewCol.style.display = 'flex';
          previewCol.scrollIntoView({ behavior: 'smooth' });
        }
        window.livePreviewEngine.render();
        this.addMessage('assistant', 'Here is your live A4 resume preview.');
        this.updateUIState('IDLE');
        break;
      }

      // 13. Check Resume / ATS Score
      case 'CHECK_RESUME': {
        this.navigateToSection('checker');
        const audit = window.resumeChecker.calculate();
        const score = audit.score;
        let summary = `Your resume completeness score is ${score}%. `;
        if (audit.suggestions && audit.suggestions.length > 0) {
          summary += `Recommendation: ${audit.suggestions[0]}`;
        }
        this.addMessage('assistant', summary);
        this.updateUIState('IDLE');
        break;
      }

      // 14. Download PDF
      case 'DOWNLOAD_RESUME': {
        this.addMessage('assistant', 'Generating your high-resolution PDF download now.');
        this.updateUIState('IDLE');
        setTimeout(() => {
          if (window.resumeExporter) window.resumeExporter.exportPDF();
        }, 300);
        break;
      }

      // 15. Change Template
      case 'CHANGE_TEMPLATE': {
        const tmpl = parsed.entities.template;
        resume.customization.template = tmpl;
        this.syncAllChanges();
        this.addMessage('assistant', `Switched resume template to ${tmpl.toUpperCase()}.`);
        this.updateUIState('IDLE');
        break;
      }

      // 16. AI Writing Assistant
      case 'IMPROVE_CONTENT': {
        const { targetType, tone } = parsed.entities;
        this.navigateToSection(targetType === 'project' ? 'projects' : targetType === 'experience' ? 'experience' : 'summary');

        if (targetType === 'summary') {
          const original = resume.summary || '';
          const improved = window.aiAssistant.enhanceText(original, 'summary', tone);
          resume.summary = improved;
          this.syncAllChanges();
          this.addMessage('assistant', `Polished your summary with an ${tone.toUpperCase()} tone without inventing false credentials.`);
        } else if (targetType === 'project' && resume.projects && resume.projects[0]) {
          const original = resume.projects[0].description || '';
          const improved = window.aiAssistant.enhanceText(original, 'project', tone);
          resume.projects[0].description = improved;
          this.syncAllChanges();
          this.addMessage('assistant', `Improved project description for "${resume.projects[0].title}".`);
        } else {
          this.addMessage('assistant', 'Opening AI writing assistant modal.');
          window.aiAssistant.open(targetType, '');
        }
        this.updateUIState('IDLE');
        break;
      }

      // 17. Read Info Aloud
      case 'READ_RESUME_INFO': {
        const target = parsed.entities.target;
        let readText = '';
        if (target === 'summary') {
          readText = resume.summary || 'No professional summary written yet.';
        } else if (target === 'skills') {
          const skills = window.resumeState.getAllSkills(resume);
          readText = skills.length > 0 ? `Your skills are: ${skills.join(', ')}` : 'No skills listed yet.';
        } else if (target === 'personal') {
          const p = resume.personal || {};
          readText = `Name: ${p.fullName || 'Not set'}. Title: ${p.jobTitle || 'Not set'}. Email: ${p.email || 'Not set'}. Phone: ${p.phone || 'Not set'}.`;
        }
        this.addMessage('assistant', readText, true);
        this.updateUIState('IDLE');
        break;
      }

      // 18. Create New Resume
      case 'CREATE_NEW_RESUME': {
        window.resumeState.createNewResume('Voice Created Resume');
        this.syncAllChanges();
        this.addMessage('assistant', 'Created a fresh new resume for you.');
        this.updateUIState('IDLE');
        break;
      }

      // 19. Destructive Actions (Confirmation Required)
      case 'CLEAR_RESUME': {
        this.pendingConfirmation = {
          action: 'CLEAR_RESUME',
          target: parsed.originalText.includes('skill') ? 'skills' : 'all'
        };
        this.showConfirmationPrompt(parsed.confirmQuestion);
        this.updateUIState('IDLE');
        break;
      }

      // 20. Conversational Continue
      case 'CONVERSATION_CONTINUE': {
        this.conversationContext = {
          activeStep: parsed.nextStep,
          stepData: parsed.stepData
        };
        this.addMessage('assistant', parsed.question);
        this.updateUIState('IDLE');
        break;
      }

      case 'CONVERSATION_CANCELLED': {
        this.conversationContext = { activeStep: null, stepData: {} };
        this.addMessage('assistant', 'Action cancelled. How else can I help?');
        this.updateUIState('IDLE');
        break;
      }

      // 21. Help Command
      case 'HELP': {
        const helpText = "I can help you: • Add personal info ('My name is Devika') • Add skills ('Add Python, Java, SQL') • Add projects ('Add my Student Data Analytics project') • Add education ('My college is Vidyavahini College') • Change templates ('Use modern template') • Improve writing ('Make summary professional') • Check ATS score • Preview and download your resume.";
        this.addMessage('assistant', helpText);
        this.updateUIState('IDLE');
        break;
      }

      // Unknown Fallback
      case 'UNKNOWN':
      default: {
        this.addMessage('assistant', "Sorry, I didn't catch that command. You can say 'Help' to see available commands or say 'Add Python to skills'.");
        this.updateUIState('IDLE');
        break;
      }
    }
  }

  /* ==========================================================================
     Confirmation System for Destructive Actions
     ========================================================================== */
  showConfirmationPrompt(question) {
    if (!this.msgContainer) return;

    const confirmBox = document.createElement('div');
    confirmBox.className = 'voice-confirm-box';
    confirmBox.innerHTML = `
      <div class="voice-confirm-text">⚠️ ${this.escapeHtml(question)}</div>
      <div class="voice-confirm-actions">
        <button class="btn btn-sm btn-danger" id="voiceConfirmYesBtn">Confirm & Clear</button>
        <button class="btn btn-sm btn-outline" id="voiceConfirmCancelBtn">Cancel</button>
      </div>
    `;

    this.msgContainer.appendChild(confirmBox);
    this.msgContainer.scrollTop = this.msgContainer.scrollHeight;

    document.getElementById('voiceConfirmYesBtn')?.addEventListener('click', () => {
      this.resolveConfirmation(true);
    });

    document.getElementById('voiceConfirmCancelBtn')?.addEventListener('click', () => {
      this.resolveConfirmation(false);
    });

    window.speechService.speak(question);
  }

  handleConfirmationInput(text) {
    const lower = text.toLowerCase();
    if (lower.includes('yes') || lower.includes('confirm') || lower.includes('proceed') || lower.includes('sure')) {
      this.resolveConfirmation(true);
    } else {
      this.resolveConfirmation(false);
    }
  }

  resolveConfirmation(confirmed) {
    const pending = this.pendingConfirmation;
    this.pendingConfirmation = null;

    // Remove any confirm boxes
    document.querySelectorAll('.voice-confirm-box').forEach(el => el.remove());

    if (!confirmed) {
      this.addMessage('assistant', 'Action cancelled. Your resume data is safe.');
      this.updateUIState('IDLE');
      return;
    }

    const resume = window.resumeState.currentResume;
    if (pending.target === 'skills') {
      resume.skillCategories = [];
      resume.skills = [];
      this.syncAllChanges();
      this.addMessage('assistant', 'All skills have been removed from your resume.');
    } else {
      // Clear all fields to blank template
      window.resumeState.loadPreset('blank');
      this.syncAllChanges();
      this.addMessage('assistant', 'Your resume has been cleared.');
    }
    this.updateUIState('IDLE');
  }

  /* ==========================================================================
     Helper Utilities
     ========================================================================== */
  findOrCreateCategoryForSkill(resume, skillName) {
    const s = skillName.toLowerCase();
    const categories = resume.skillCategories || [];

    // Intelligent domain mapping
    let preferredCategory = 'Programming';
    if (s.includes('html') || s.includes('css') || s.includes('react') || s.includes('node') || s.includes('web') || s.includes('express') || s.includes('tailwind')) {
      preferredCategory = 'Web Development';
    } else if (s.includes('pandas') || s.includes('numpy') || s.includes('power bi') || s.includes('tableau') || s.includes('sql') || s.includes('analytics') || s.includes('excel')) {
      preferredCategory = 'Data Analytics';
    } else if (s.includes('machine learning') || s.includes('ai') || s.includes('scikit') || s.includes('tensor') || s.includes('pytorch') || s.includes('nlp')) {
      preferredCategory = 'AI / ML';
    } else if (s.includes('docker') || s.includes('aws') || s.includes('cloud') || s.includes('git') || s.includes('devops')) {
      preferredCategory = 'Cloud & DevOps';
    }

    let cat = categories.find(c => c.name.toLowerCase() === preferredCategory.toLowerCase());
    if (!cat) {
      if (categories.length > 0) {
        cat = categories[0];
      } else {
        cat = {
          id: 'cat-' + Date.now(),
          name: preferredCategory,
          skills: []
        };
        categories.push(cat);
      }
    }
    return cat;
  }

  navigateToSection(sectionKey) {
    const tab = document.querySelector(`.section-tab-btn[data-section="${sectionKey}"]`);
    if (tab) {
      tab.click();
      const workspace = document.getElementById('builderWorkspace');
      if (workspace) {
        workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  syncAllChanges() {
    window.resumeState.saveState();
    if (window.appController) {
      window.appController.populateFormFields();
      window.appController.triggerReactiveUpdate();
    }
    if (window.livePreviewEngine) {
      window.livePreviewEngine.render();
    }
    if (window.resumeChecker) {
      window.resumeChecker.updateScore();
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Bootstrap Voice Assistant Controller on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.voiceAssistant = new VoiceAssistantController();
  window.voiceAssistant.init();
});
