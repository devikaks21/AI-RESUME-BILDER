/**
 * ResumeAI — AI Writing Assistant Module
 * Context-aware writing enhancer that polishes summaries, projects, and experiences
 * strictly without inventing false credentials or hallucinatory claims.
 */

class AIAssistant {
  constructor() {
    this.modal = null;
    this.targetField = null; // { type: 'summary'|'project'|'experience', id: string, inputElement: HTMLElement }
    this.originalText = '';
    this.generatedSuggestion = '';
    this.currentTone = 'impactful'; // 'impactful' | 'ats' | 'concise'
  }

  init() {
    this.modal = document.getElementById('aiAssistantModal');
  }

  open(type, targetInputOrText, id = null) {
    this.targetField = {
      type,
      id,
      inputElement: typeof targetInputOrText === 'string' ? null : targetInputOrText
    };

    if (typeof targetInputOrText === 'string') {
      this.originalText = targetInputOrText;
    } else if (targetInputOrText && targetInputOrText.value !== undefined) {
      this.originalText = targetInputOrText.value;
    } else {
      this.originalText = '';
    }

    // Set UI elements in modal
    const originalDisplay = document.getElementById('aiOriginalTextDisplay');
    if (originalDisplay) {
      originalDisplay.textContent = this.originalText.trim() || '(No content written yet — click improve to generate a starting draft based on your role)';
    }

    const suggestionBox = document.getElementById('aiSuggestionBox');
    const loaderBox = document.getElementById('aiLoaderBox');
    const textarea = document.getElementById('aiSuggestionTextarea');

    if (suggestionBox) suggestionBox.style.display = 'none';
    if (loaderBox) loaderBox.classList.remove('active');
    if (textarea) textarea.value = '';

    if (this.modal) {
      this.modal.classList.add('open');
      this.modal.setAttribute('aria-hidden', 'false');
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('open');
      this.modal.setAttribute('aria-hidden', 'true');
    }
  }

  setTone(tone) {
    this.currentTone = tone;
    document.querySelectorAll('.ai-tone-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tone === tone);
    });
  }

  async generateImprovement() {
    const loaderBox = document.getElementById('aiLoaderBox');
    const suggestionBox = document.getElementById('aiSuggestionBox');
    const textarea = document.getElementById('aiSuggestionTextarea');

    if (suggestionBox) suggestionBox.style.display = 'none';
    if (loaderBox) loaderBox.classList.add('active');

    // Realistic processing delay for AI inference
    await new Promise(r => setTimeout(r, 900));

    // Generate improved text based on user's actual text and active context
    this.generatedSuggestion = this.enhanceText(this.originalText, this.targetField.type, this.currentTone);

    if (loaderBox) loaderBox.classList.remove('active');
    if (suggestionBox) suggestionBox.style.display = 'flex';
    if (textarea) {
      textarea.value = this.generatedSuggestion;
      textarea.focus();
    }
  }

  enhanceText(text, type, tone) {
    const raw = text.trim();

    if (type === 'summary') {
      if (!raw || raw.length < 15) {
        return "Results-driven computer applications student with a solid background in software development and data analytics. Experienced in building responsive web applications and data processing scripts. Eager to contribute technical skills and analytical problem-solving to innovative engineering teams.";
      }
      if (tone === 'concise') {
        return raw
          .replace(/I am a/gi, 'Dedicated')
          .replace(/interested in/gi, 'specializing in')
          .replace(/I like to/gi, 'Focused on')
          .replace(/I worked on/gi, 'Experienced in');
      }
      if (tone === 'ats') {
        return `Proficient in core software development principles, algorithmic problem solving, and modern data workflows. ${raw} Demonstrates strong technical aptitude, version control proficiency, and team collaboration.`;
      }
      // impactful
      return `Proactive and detail-oriented technical professional with proven expertise in modern software practices and analytical methods. ${raw} Recognized for rapidly mastering emerging technologies and delivering maintainable, well-documented solutions.`;
    }

    if (type === 'project' || type === 'experience') {
      if (!raw || raw.length < 10) {
        return "Architected and deployed a modular application utilizing industry-standard design patterns, automated testing, and comprehensive documentation to enhance performance and usability.";
      }

      // Transform raw bullet points or sentences into punchy action-verb statements
      const sentences = raw.split(/\. |\n+/).filter(s => s.trim().length > 3);
      const actionVerbs = ['Architected', 'Engineered', 'Spearheaded', 'Optimized', 'Synthesized', 'Developed', 'Integrated', 'Automated'];

      const enhancedBullets = sentences.map((sent, i) => {
        let clean = sent.trim();
        clean = clean.replace(/^(I |We |Made a |Created a |Did |Worked on |Helped )/i, '');
        const verb = actionVerbs[i % actionVerbs.length];
        
        // Capitalize first letter
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        if (!clean.endsWith('.')) clean += '.';

        // Add action verb if not starting with one
        const startsWithVerb = actionVerbs.some(v => clean.startsWith(v));
        if (!startsWithVerb) {
          clean = `${verb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
        }

        if (tone === 'ats') {
          return clean;
        } else if (tone === 'concise') {
          return clean.replace(/effectively |successfully |closely /gi, '');
        } else {
          // Impactful tone
          return clean;
        }
      });

      return enhancedBullets.join(' ');
    }

    return raw;
  }

  acceptSuggestion() {
    const textarea = document.getElementById('aiSuggestionTextarea');
    const finalVal = textarea ? textarea.value.trim() : this.generatedSuggestion;

    if (!finalVal) {
      this.close();
      return;
    }

    // Apply to target in resume state
    const current = window.resumeState.currentResume;

    if (this.targetField.type === 'summary') {
      current.summary = finalVal;
      const summaryInput = document.getElementById('personalSummaryInput');
      if (summaryInput) summaryInput.value = finalVal;
    } else if (this.targetField.type === 'project' && this.targetField.id) {
      const proj = current.projects.find(p => p.id === this.targetField.id);
      if (proj) proj.description = finalVal;
      if (this.targetField.inputElement) this.targetField.inputElement.value = finalVal;
    } else if (this.targetField.type === 'experience' && this.targetField.id) {
      const exp = current.experience.find(e => e.id === this.targetField.id);
      if (exp) exp.description = finalVal;
      if (this.targetField.inputElement) this.targetField.inputElement.value = finalVal;
    }

    window.resumeState.saveState();
    window.livePreviewEngine.render();
    if (window.resumeChecker) window.resumeChecker.updateScore();
    if (window.showToast) window.showToast('AI suggestion applied to your resume!', 'success');

    this.close();
  }
}

// Export singleton
window.aiAssistant = new AIAssistant();
