/**
 * ResumeAI — Main Application Controller & Event Orchestrator
 * Connects state, forms, UI tabs, modals, and reactive rendering
 */

// Toast notification helper
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✦';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span style="font-weight:500;">${message}</span>
  `;

  container.appendChild(toast);
  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

class AppController {
  constructor() {
    this.activeSection = 'personal';
    this.debounceTimer = null;
  }

  init() {
    this.bindGlobalNavigation();
    this.bindEditorTabs();
    this.bindFormInputs();
    this.bindCustomizerControls();
    this.bindJobMatcher();
    this.bindModals();
    this.bindZoomControls();

    // Populate fields from active state
    this.populateFormFields();

    // Initialize engines
    window.livePreviewEngine.init();
    window.aiAssistant.init();
    window.resumeChecker.updateScore();
    this.renderDashboardResumes();
  }

  /* ==========================================================================
     Global Navigation & Scrolling
     ========================================================================== */
  bindGlobalNavigation() {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        mobileDrawer.classList.toggle('open');
      });
      mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileDrawer.classList.remove('open'));
      });
    }

    // Builder Jump buttons
    document.querySelectorAll('[data-jump-to="builder"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const builderSection = document.getElementById('builderWorkspace');
        if (builderSection) {
          builderSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Template Cards Jump in Showcase
    document.querySelectorAll('[data-use-template]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tmpl = btn.dataset.useTemplate;
        if (window.resumeState.currentResume) {
          window.resumeState.currentResume.customization.template = tmpl;
          window.resumeState.saveState();
          window.livePreviewEngine.render();
          this.syncCustomizerUI();
          window.showToast(`Switched template to ${tmpl.toUpperCase()}!`, 'success');
          const builder = document.getElementById('builderWorkspace');
          if (builder) builder.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Mobile Preview Toggle Bar
    const togglePreviewBtn = document.getElementById('mobileTogglePreviewBtn');
    const previewCol = document.getElementById('builderPreviewColumn');
    if (togglePreviewBtn && previewCol) {
      togglePreviewBtn.addEventListener('click', () => {
        const isHidden = previewCol.style.display === 'none' || getComputedStyle(previewCol).display === 'none';
        if (isHidden) {
          previewCol.style.display = 'flex';
          previewCol.scrollIntoView({ behavior: 'smooth' });
          togglePreviewBtn.innerHTML = '✎ Edit Form';
        } else {
          previewCol.style.display = 'none';
          document.getElementById('builderEditorColumn').scrollIntoView({ behavior: 'smooth' });
          togglePreviewBtn.innerHTML = '👁 View Live Preview';
        }
      });
    }
  }

  /* ==========================================================================
     Editor Section Tabs (Personal, Education, Skills, etc.)
     ========================================================================== */
  bindEditorTabs() {
    const tabs = document.querySelectorAll('.section-tab-btn');
    const panels = document.querySelectorAll('.form-panel-view');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.section;
        this.activeSection = target;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        panels.forEach(p => {
          if (p.id === `panel-${target}`) {
            p.style.display = 'flex';
          } else {
            p.style.display = 'none';
          }
        });

        if (target === 'checker') {
          window.resumeChecker.updateScore();
        } else if (target === 'dashboard') {
          this.renderDashboardResumes();
        }
      });
    });
  }

  /* ==========================================================================
     Form Field Bindings & Real-Time Sync
     ========================================================================== */
  bindFormInputs() {
    const bindInput = (id, callback) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          callback(el.value);
          this.triggerReactiveUpdate();
        });
      }
    };

    // Personal info
    bindInput('personalFullName', v => window.resumeState.currentResume.personal.fullName = v);
    bindInput('personalJobTitle', v => window.resumeState.currentResume.personal.jobTitle = v);
    bindInput('personalEmail', v => window.resumeState.currentResume.personal.email = v);
    bindInput('personalPhone', v => {
      let val = v.trim();
      const digitsOnly = val.replace(/\D/g, '');
      if (digitsOnly.length === 10 && !val.startsWith('+')) {
        val = `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
      }
      window.resumeState.currentResume.personal.phone = val;
    });
    bindInput('personalLocation', v => window.resumeState.currentResume.personal.location = v);
    bindInput('personalGithub', v => window.resumeState.currentResume.personal.github = v);
    bindInput('personalLinkedin', v => window.resumeState.currentResume.personal.linkedin = v);
    bindInput('personalPortfolio', v => window.resumeState.currentResume.personal.portfolio = v);

    // Summary
    bindInput('personalSummaryInput', v => window.resumeState.currentResume.summary = v);

    // AI Button for Summary
    const aiSummaryBtn = document.getElementById('aiImproveSummaryBtn');
    if (aiSummaryBtn) {
      aiSummaryBtn.addEventListener('click', () => {
        const input = document.getElementById('personalSummaryInput');
        window.aiAssistant.open('summary', input);
      });
    }

    // Categorized Skills Management
    const addNewCategoryBtn = document.getElementById('addNewCategoryBtn');
    const newCategoryNameInput = document.getElementById('newCategoryNameInput');
    const confirmAddCategoryBtn = document.getElementById('confirmAddCategoryBtn');

    const handleCreateCategory = () => {
      if (!newCategoryNameInput) return;
      const val = (newCategoryNameInput.value || '').trim();
      if (!val) {
        window.showToast('Please enter a category name (e.g. Programming, Web Development)', 'warning');
        newCategoryNameInput.focus();
        return;
      }
      const resume = window.resumeState.currentResume;
      if (!resume.skillCategories) resume.skillCategories = [];
      const exists = resume.skillCategories.find(c => c.name.toLowerCase() === val.toLowerCase());
      if (exists) {
        window.showToast(`Category "${val}" already exists!`, 'warning');
        const input = document.querySelector(`.cat-skill-input[data-cat-id="${exists.id}"]`);
        if (input) input.focus();
        return;
      }
      const newCat = {
        id: 'cat-' + Date.now(),
        name: val,
        skills: []
      };
      resume.skillCategories.push(newCat);
      newCategoryNameInput.value = '';
      this.renderSkillCategories();
      this.triggerReactiveUpdate();
      window.showToast(`Category "${val}" created! You can now add skills below.`, 'success');
      setTimeout(() => {
        const input = document.querySelector(`.cat-skill-input[data-cat-id="${newCat.id}"]`);
        if (input) input.focus();
      }, 50);
    };

    if (addNewCategoryBtn && newCategoryNameInput) {
      addNewCategoryBtn.addEventListener('click', () => {
        newCategoryNameInput.focus();
        newCategoryNameInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    if (confirmAddCategoryBtn) {
      confirmAddCategoryBtn.addEventListener('click', handleCreateCategory);
    }

    if (newCategoryNameInput) {
      newCategoryNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCreateCategory();
        }
      });
    }

    // Quick add popular categories buttons
    document.querySelectorAll('[data-add-preset-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const catName = btn.dataset.addPresetCat;
        if (!catName) return;
        const resume = window.resumeState.currentResume;
        if (!resume.skillCategories) resume.skillCategories = [];
        const existing = resume.skillCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (existing) {
          window.showToast(`Category "${catName}" already exists!`, 'info');
          const input = document.querySelector(`.cat-skill-input[data-cat-id="${existing.id}"]`);
          if (input) input.focus();
          return;
        }

        const presetStarters = {
          'Programming': ['Python', 'Java', 'C'],
          'Web Development': ['HTML', 'CSS', 'JavaScript'],
          'Data Analytics': ['Pandas', 'NumPy', 'Power BI'],
          'AI / ML': ['Machine Learning', 'Scikit-learn'],
          'Cloud & DevOps': ['AWS', 'Docker', 'Git & GitHub'],
          'Database Management': ['PostgreSQL', 'MongoDB', 'MySQL']
        };

        const defaultSkills = presetStarters[catName] || [];
        const newCat = {
          id: 'cat-' + Date.now(),
          name: catName,
          skills: [...defaultSkills]
        };
        resume.skillCategories.push(newCat);
        this.renderSkillCategories();
        this.triggerReactiveUpdate();
        window.showToast(`Added "${catName}" category with starter skills!`, 'success');
      });
    });

    // Education, Projects, Experience, Certs, Achievements buttons
    document.getElementById('addEducationBtn')?.addEventListener('click', () => this.addEducationEntry());
    document.getElementById('addProjectBtn')?.addEventListener('click', () => this.addProjectEntry());
    document.getElementById('addExperienceBtn')?.addEventListener('click', () => this.addExperienceEntry());
    document.getElementById('addCertificationBtn')?.addEventListener('click', () => this.addCertificationEntry());
    document.getElementById('addAchievementBtn')?.addEventListener('click', () => this.addAchievementEntry());

    // Header actions
    document.getElementById('exportPdfBtn')?.addEventListener('click', () => window.resumeExporter.exportPDF());
    document.getElementById('headerBuildPdfBtn')?.addEventListener('click', () => window.resumeExporter.exportPDF());
    document.getElementById('saveResumeBtn')?.addEventListener('click', () => {
      window.resumeState.saveState();
      window.showToast('✓ Resume saved successfully to your browser!', 'success');
    });
    // Student Discipline Preset Selector
    const presetSelect = document.getElementById('studentPresetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        window.resumeState.loadPreset(val);
        this.populateFormFields();
        this.triggerReactiveUpdate();
        this.renderDashboardResumes();
        window.showToast(`Loaded ${presetSelect.options[presetSelect.selectedIndex].text} template!`, 'success');
      });
    }

    document.getElementById('resetSampleDataBtn')?.addEventListener('click', () => {
      const activePreset = presetSelect ? presetSelect.value : 'cs';
      if (confirm('Reset resume to starter data for your chosen field?')) {
        window.resumeState.loadPreset(activePreset);
        this.populateFormFields();
        this.triggerReactiveUpdate();
        window.showToast('Reset to starter data', 'info');
      }
    });

    // Backup JSON buttons
    document.getElementById('exportJsonBtn')?.addEventListener('click', () => window.resumeExporter.exportJSON());
    const importFileInput = document.getElementById('importJsonFileInput');
    document.getElementById('importJsonBtn')?.addEventListener('click', () => importFileInput?.click());
    if (importFileInput) {
      importFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) window.resumeExporter.importJSON(e.target.files[0]);
      });
    }
  }

  populateFormFields() {
    const data = window.resumeState.currentResume;
    if (!data) return;

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v || '';
    };

    const p = data.personal || {};
    setVal('personalFullName', p.fullName);
    setVal('personalJobTitle', p.jobTitle);
    setVal('personalEmail', p.email);
    setVal('personalPhone', p.phone);
    setVal('personalLocation', p.location);
    setVal('personalGithub', p.github);
    setVal('personalLinkedin', p.linkedin);
    setVal('personalPortfolio', p.portfolio);

    setVal('personalSummaryInput', data.summary);

    this.renderSkillCategories();
    this.renderEducationList();
    this.renderProjectsList();
    this.renderExperienceList();
    this.renderCertificationsList();
    this.renderAchievementsList();
    this.syncCustomizerUI();
  }

  triggerReactiveUpdate() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      window.resumeState.saveState();
      window.livePreviewEngine.render();
      window.resumeChecker.updateScore();
    }, 150);
  }

  /* ==========================================================================
     Categorized Skills Rendering & Interactions
     No fake proficiency levels — cleanly organized domains & skill chips
     ========================================================================== */
  renderSkillCategories() {
    const container = document.getElementById('skillCategoriesListContainer');
    if (!container) return;

    const resume = window.resumeState.currentResume;
    if (!resume) return;
    window.resumeState.ensureSkillCategories(resume);

    const categories = resume.skillCategories || [];
    if (categories.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; background: rgba(13, 17, 23, 0.4); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md);">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">⚡</div>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">No skill categories yet</div>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">Create categories like Programming, Web Development, Data Analytics, or AI / ML above.</p>
          <button class="btn btn-sm btn-outline" id="emptyStateAddDefaultsBtn">+ Add Recommended Categories</button>
        </div>
      `;
      document.getElementById('emptyStateAddDefaultsBtn')?.addEventListener('click', () => {
        resume.skillCategories = [
          { id: 'cat-' + Date.now() + '-1', name: 'Programming', skills: ['Python', 'Java', 'C'] },
          { id: 'cat-' + Date.now() + '-2', name: 'Web Development', skills: ['HTML', 'CSS', 'JavaScript'] },
          { id: 'cat-' + Date.now() + '-3', name: 'Data Analytics', skills: ['Pandas', 'NumPy', 'Power BI'] },
          { id: 'cat-' + Date.now() + '-4', name: 'AI / ML', skills: ['Machine Learning', 'Scikit-learn'] }
        ];
        this.renderSkillCategories();
        this.triggerReactiveUpdate();
        window.showToast('Added standard student categories!', 'success');
      });
      return;
    }

    container.innerHTML = categories.map(cat => {
      const skills = cat.skills || [];
      const chipsHtml = skills.length === 0
        ? `<span style="font-size:0.78rem; color:var(--text-muted); padding:4px 0;">No skills in this category yet. Type one below and press + Add.</span>`
        : skills.map((skill, idx) => `
            <span class="skill-chip">
              <span>${this.escapeHtml(skill)}</span>
              <span class="skill-chip-remove" data-cat-id="${cat.id}" data-skill-idx="${idx}" title="Remove skill">×</span>
            </span>
          `).join('');

      return `
        <div class="skill-category-card" data-cat-id="${cat.id}">
          <div class="category-card-header">
            <div class="category-title-wrap">
              <span style="font-size:1rem;">📂</span>
              <span class="category-name-heading">${this.escapeHtml(cat.name)}</span>
              <span class="category-count-badge">${skills.length} ${skills.length === 1 ? 'skill' : 'skills'}</span>
            </div>
            <div class="category-actions">
              <button class="btn btn-xs btn-ghost btn-rename-cat" data-cat-id="${cat.id}" title="Rename category">✏️ Rename</button>
              <button class="btn btn-xs btn-danger btn-delete-cat" data-cat-id="${cat.id}" title="Delete category">🗑 Delete</button>
            </div>
          </div>

          <div class="category-chips-cloud">
            ${chipsHtml}
          </div>

          <div class="category-add-skill-row">
            <input type="text" class="form-input form-input-sm cat-skill-input" data-cat-id="${cat.id}" placeholder="Add skill to ${this.escapeHtml(cat.name)} (e.g. ${cat.name === 'Programming' ? 'Python, Java, C' : cat.name === 'Web Development' ? 'HTML, CSS, JavaScript' : cat.name === 'Data Analytics' ? 'Pandas, NumPy, Power BI' : 'Machine Learning, Scikit-learn'})...">
            <button class="btn btn-sm btn-primary cat-add-skill-btn" data-cat-id="${cat.id}" style="white-space:nowrap;">
              + Add
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners for each category card
    // 1. Add skill button & enter key
    container.querySelectorAll('.cat-add-skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.catId;
        this.addSkillToCategory(catId);
      });
    });

    container.querySelectorAll('.cat-skill-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const catId = input.dataset.catId;
          this.addSkillToCategory(catId);
        }
      });
    });

    // 2. Remove individual skill
    container.querySelectorAll('.skill-chip-remove').forEach(removeBtn => {
      removeBtn.addEventListener('click', () => {
        const catId = removeBtn.dataset.catId;
        const skillIdx = parseInt(removeBtn.dataset.skillIdx, 10);
        this.removeSkillFromCategory(catId, skillIdx);
      });
    });

    // 3. Rename category
    container.querySelectorAll('.btn-rename-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.catId;
        this.renameCategory(catId);
      });
    });

    // 4. Delete category
    container.querySelectorAll('.btn-delete-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.catId;
        this.deleteCategory(catId);
      });
    });
  }

  addSkillToCategory(catId) {
    const resume = window.resumeState.currentResume;
    if (!resume || !resume.skillCategories) return;
    const cat = resume.skillCategories.find(c => c.id === catId);
    if (!cat) return;

    const input = document.querySelector(`.cat-skill-input[data-cat-id="${catId}"]`);
    if (!input) return;
    const val = (input.value || '').trim();
    if (!val) return;

    if (!cat.skills) cat.skills = [];

    // Support comma-separated batch adding (e.g. "Pandas, NumPy, Power BI")
    const newItems = val.split(',').map(s => s.trim()).filter(Boolean);
    let addedCount = 0;

    newItems.forEach(item => {
      const exists = cat.skills.some(s => s.toLowerCase() === item.toLowerCase());
      if (!exists) {
        cat.skills.push(item);
        addedCount++;
      }
    });

    if (addedCount === 0) {
      window.showToast(`Skill(s) already exist in ${cat.name}!`, 'warning');
      return;
    }

    input.value = '';
    this.renderSkillCategories();
    this.triggerReactiveUpdate();

    // Refocus the input
    setTimeout(() => {
      const refreshedInput = document.querySelector(`.cat-skill-input[data-cat-id="${catId}"]`);
      if (refreshedInput) refreshedInput.focus();
    }, 40);

    window.showToast(addedCount === 1 ? `Added "${newItems[0]}" to ${cat.name}` : `Added ${addedCount} skills to ${cat.name}`, 'info');
  }

  removeSkillFromCategory(catId, skillIdx) {
    const resume = window.resumeState.currentResume;
    if (!resume || !resume.skillCategories) return;
    const cat = resume.skillCategories.find(c => c.id === catId);
    if (!cat || !cat.skills || cat.skills[skillIdx] === undefined) return;

    const removed = cat.skills.splice(skillIdx, 1);
    this.renderSkillCategories();
    this.triggerReactiveUpdate();
    window.showToast(`Removed "${removed[0]}"`, 'info');
  }

  renameCategory(catId) {
    const resume = window.resumeState.currentResume;
    if (!resume || !resume.skillCategories) return;
    const cat = resume.skillCategories.find(c => c.id === catId);
    if (!cat) return;

    const newName = prompt(`Enter new name for category "${cat.name}":`, cat.name);
    if (newName && newName.trim() && newName.trim() !== cat.name) {
      cat.name = newName.trim();
      this.renderSkillCategories();
      this.triggerReactiveUpdate();
      window.showToast(`Renamed to "${cat.name}"`, 'success');
    }
  }

  deleteCategory(catId) {
    const resume = window.resumeState.currentResume;
    if (!resume || !resume.skillCategories) return;
    const cat = resume.skillCategories.find(c => c.id === catId);
    if (!cat) return;

    const count = (cat.skills || []).length;
    const confirmMsg = count > 0 
      ? `Delete category "${cat.name}" and its ${count} skills?`
      : `Delete category "${cat.name}"?`;

    if (confirm(confirmMsg)) {
      resume.skillCategories = resume.skillCategories.filter(c => c.id !== catId);
      this.renderSkillCategories();
      this.triggerReactiveUpdate();
      window.showToast(`Deleted category "${cat.name}"`, 'info');
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

  /* ==========================================================================
     Dynamic List Renderers (Education, Projects, Experience, Certs, Achievements)
     ========================================================================== */
  renderEducationList() {
    const container = document.getElementById('educationItemsList');
    if (!container) return;

    const list = window.resumeState.currentResume.education || [];
    if (list.length === 0) {
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No education entries added yet.</p>`;
      return;
    }

    container.innerHTML = list.map((item, idx) => `
      <div class="item-card-entry" data-id="${item.id}">
        <div class="item-card-entry-header">
          <div>
            <div class="item-card-main-title">${item.degree || 'Degree Title'}</div>
            <div class="item-card-sub-info">${item.institution || 'College / University'} • ${item.startDate || ''} – ${item.endDate || ''}</div>
            ${item.grade ? `<div style="font-size:0.8rem; color:var(--accent-secondary); margin-top:2px;">${item.grade}</div>` : ''}
          </div>
          <div class="item-card-actions">
            <button class="btn btn-sm btn-outline edit-edu-btn" data-index="${idx}">Edit</button>
            <button class="btn btn-sm btn-icon-only delete-edu-btn" data-index="${idx}" style="color:var(--danger);">✕</button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.delete-edu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        window.resumeState.currentResume.education.splice(idx, 1);
        this.renderEducationList();
        this.triggerReactiveUpdate();
      });
    });

    container.querySelectorAll('.edit-edu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        this.editEducationEntry(idx);
      });
    });
  }

  addEducationEntry() {
    const newEdu = {
      id: 'edu-' + Date.now(),
      degree: 'Degree / Program',
      institution: 'University / Institute Name',
      location: 'City, Country',
      startDate: '2025',
      endDate: '2028',
      grade: 'CGPA: 8.5'
    };
    window.resumeState.currentResume.education.push(newEdu);
    this.renderEducationList();
    this.triggerReactiveUpdate();
    this.editEducationEntry(window.resumeState.currentResume.education.length - 1);
  }

  editEducationEntry(idx) {
    const item = window.resumeState.currentResume.education[idx];
    if (!item) return;

    const degree = prompt('Degree or Course name:', item.degree);
    if (degree !== null) item.degree = degree;

    const inst = prompt('Institution or College name:', item.institution);
    if (inst !== null) item.institution = inst;

    const start = prompt('Start Year:', item.startDate);
    if (start !== null) item.startDate = start;

    const end = prompt('End Year (or Present):', item.endDate);
    if (end !== null) item.endDate = end;

    const grade = prompt('Grade / CGPA / Percentage:', item.grade);
    if (grade !== null) item.grade = grade;

    this.renderEducationList();
    this.triggerReactiveUpdate();
  }

  /* Projects */
  renderProjectsList() {
    const container = document.getElementById('projectsItemsList');
    if (!container) return;

    const list = window.resumeState.currentResume.projects || [];
    if (list.length === 0) {
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No projects added yet.</p>`;
      return;
    }

    container.innerHTML = list.map((item, idx) => `
      <div class="item-card-entry" data-id="${item.id}">
        <div class="item-card-entry-header">
          <div style="flex:1;">
            <div class="item-card-main-title">${item.title || 'Project Title'}</div>
            ${item.techStack ? `<div class="item-card-sub-info" style="color:var(--accent-secondary); font-weight:600;">${item.techStack}</div>` : ''}
          </div>
          <div class="item-card-actions">
            <button class="btn btn-sm btn-ai ai-proj-btn" data-id="${item.id}">✦ AI Polish</button>
            <button class="btn btn-sm btn-outline edit-proj-btn" data-index="${idx}">Edit</button>
            <button class="btn btn-sm btn-icon-only delete-proj-btn" data-index="${idx}" style="color:var(--danger);">✕</button>
          </div>
        </div>
        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">${item.description || ''}</p>
      </div>
    `).join('');

    container.querySelectorAll('.delete-proj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        window.resumeState.currentResume.projects.splice(idx, 1);
        this.renderProjectsList();
        this.triggerReactiveUpdate();
      });
    });

    container.querySelectorAll('.edit-proj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        this.editProjectEntry(idx);
      });
    });

    container.querySelectorAll('.ai-proj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const proj = window.resumeState.currentResume.projects.find(p => p.id === id);
        if (proj) {
          window.aiAssistant.open('project', proj.description, id);
        }
      });
    });
  }

  addProjectEntry() {
    const newProj = {
      id: 'proj-' + Date.now(),
      title: 'New Project Title',
      techStack: 'Python, SQL, HTML/CSS',
      link: 'https://github.com/username/project',
      description: 'Developed an innovative software application focused on solving key problems with clean architecture.'
    };
    window.resumeState.currentResume.projects.push(newProj);
    this.renderProjectsList();
    this.triggerReactiveUpdate();
    this.editProjectEntry(window.resumeState.currentResume.projects.length - 1);
  }

  editProjectEntry(idx) {
    const item = window.resumeState.currentResume.projects[idx];
    if (!item) return;

    const title = prompt('Project Title:', item.title);
    if (title !== null) item.title = title;

    const tech = prompt('Technologies used (comma-separated):', item.techStack);
    if (tech !== null) item.techStack = tech;

    const link = prompt('Project or GitHub link:', item.link);
    if (link !== null) item.link = link;

    const desc = prompt('Description / Key accomplishments:', item.description);
    if (desc !== null) item.description = desc;

    this.renderProjectsList();
    this.triggerReactiveUpdate();
  }

  /* Experience */
  renderExperienceList() {
    const container = document.getElementById('experienceItemsList');
    if (!container) return;

    const list = window.resumeState.currentResume.experience || [];
    if (list.length === 0) {
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No experience added yet. (Fresher / Student resumes can leave this blank or add internships!)</p>`;
      return;
    }

    container.innerHTML = list.map((item, idx) => `
      <div class="item-card-entry" data-id="${item.id}">
        <div class="item-card-entry-header">
          <div style="flex:1;">
            <div class="item-card-main-title">${item.role || 'Job Role'} — ${item.company || 'Company'}</div>
            <div class="item-card-sub-info">${item.startDate || ''} – ${item.endDate || 'Present'} ${item.location ? `• ${item.location}` : ''}</div>
          </div>
          <div class="item-card-actions">
            <button class="btn btn-sm btn-ai ai-exp-btn" data-id="${item.id}">✦ AI Polish</button>
            <button class="btn btn-sm btn-outline edit-exp-btn" data-index="${idx}">Edit</button>
            <button class="btn btn-sm btn-icon-only delete-exp-btn" data-index="${idx}" style="color:var(--danger);">✕</button>
          </div>
        </div>
        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">${item.description || ''}</p>
      </div>
    `).join('');

    container.querySelectorAll('.delete-exp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        window.resumeState.currentResume.experience.splice(idx, 1);
        this.renderExperienceList();
        this.triggerReactiveUpdate();
      });
    });

    container.querySelectorAll('.edit-exp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        this.editExperienceEntry(idx);
      });
    });

    container.querySelectorAll('.ai-exp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const exp = window.resumeState.currentResume.experience.find(e => e.id === id);
        if (exp) {
          window.aiAssistant.open('experience', exp.description, id);
        }
      });
    });
  }

  addExperienceEntry() {
    const newExp = {
      id: 'exp-' + Date.now(),
      role: 'Intern / Developer',
      company: 'Organization Name',
      location: 'Remote',
      startDate: 'Jun 2026',
      endDate: 'Aug 2026',
      description: 'Collaborated on developing software modules, optimizing performance, and testing code quality.'
    };
    window.resumeState.currentResume.experience.push(newExp);
    this.renderExperienceList();
    this.triggerReactiveUpdate();
    this.editExperienceEntry(window.resumeState.currentResume.experience.length - 1);
  }

  editExperienceEntry(idx) {
    const item = window.resumeState.currentResume.experience[idx];
    if (!item) return;

    const role = prompt('Role or Job Title:', item.role);
    if (role !== null) item.role = role;

    const comp = prompt('Company or Organization:', item.company);
    if (comp !== null) item.company = comp;

    const start = prompt('Start Date:', item.startDate);
    if (start !== null) item.startDate = start;

    const end = prompt('End Date:', item.endDate);
    if (end !== null) item.endDate = end;

    const desc = prompt('Responsibilities & Achievements:', item.description);
    if (desc !== null) item.description = desc;

    this.renderExperienceList();
    this.triggerReactiveUpdate();
  }

  /* Certifications */
  renderCertificationsList() {
    const container = document.getElementById('certificationsItemsList');
    if (!container) return;

    const list = window.resumeState.currentResume.certifications || [];
    if (list.length === 0) {
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No certifications added yet.</p>`;
      return;
    }

    container.innerHTML = list.map((item, idx) => `
      <div class="item-card-entry" data-id="${item.id}">
        <div class="item-card-entry-header">
          <div>
            <div class="item-card-main-title">${item.title || 'Certification Title'}</div>
            <div class="item-card-sub-info">${item.issuer || 'Issuing Organization'} (${item.date || ''})</div>
          </div>
          <div class="item-card-actions">
            <button class="btn btn-sm btn-icon-only delete-cert-btn" data-index="${idx}" style="color:var(--danger);">✕</button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.delete-cert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        window.resumeState.currentResume.certifications.splice(idx, 1);
        this.renderCertificationsList();
        this.triggerReactiveUpdate();
      });
    });
  }

  addCertificationEntry() {
    const title = prompt('Certification Name:');
    if (!title) return;
    const issuer = prompt('Issuing Organization:') || 'Self-Verified';
    const date = prompt('Year / Date:') || new Date().getFullYear().toString();

    window.resumeState.currentResume.certifications.push({
      id: 'cert-' + Date.now(),
      title,
      issuer,
      date,
      credentialUrl: ''
    });
    this.renderCertificationsList();
    this.triggerReactiveUpdate();
  }

  /* Achievements */
  renderAchievementsList() {
    const container = document.getElementById('achievementsItemsList');
    if (!container) return;

    const list = window.resumeState.currentResume.achievements || [];
    if (list.length === 0) {
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No achievements listed yet.</p>`;
      return;
    }

    container.innerHTML = list.map((item, idx) => `
      <div class="item-card-entry" data-id="${item.id}">
        <div class="item-card-entry-header">
          <div>
            <div class="item-card-main-title">🏆 ${item.title || 'Achievement'}</div>
            ${item.description ? `<p style="font-size:0.84rem; color:var(--text-secondary); margin-top:4px;">${item.description}</p>` : ''}
          </div>
          <div class="item-card-actions">
            <button class="btn btn-sm btn-icon-only delete-ach-btn" data-index="${idx}" style="color:var(--danger);">✕</button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.delete-ach-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        window.resumeState.currentResume.achievements.splice(idx, 1);
        this.renderAchievementsList();
        this.triggerReactiveUpdate();
      });
    });
  }

  addAchievementEntry() {
    const title = prompt('Achievement or Honor Title:');
    if (!title) return;
    const description = prompt('Short description:') || '';

    window.resumeState.currentResume.achievements.push({
      id: 'ach-' + Date.now(),
      title,
      description
    });
    this.renderAchievementsList();
    this.triggerReactiveUpdate();
  }

  /* ==========================================================================
     Customizer Controls (Template, Font, Spacing, Color)
     ========================================================================== */
  bindCustomizerControls() {
    const tmplSelect = document.getElementById('custTemplateSelect');
    if (tmplSelect) {
      tmplSelect.addEventListener('change', () => {
        window.resumeState.currentResume.customization.template = tmplSelect.value;
        this.triggerReactiveUpdate();
        window.showToast(`Template changed to ${tmplSelect.value.toUpperCase()}`, 'info');
      });
    }

    const fontSelect = document.getElementById('custFontSelect');
    if (fontSelect) {
      fontSelect.addEventListener('change', () => {
        window.resumeState.currentResume.customization.font = fontSelect.value;
        this.triggerReactiveUpdate();
      });
    }

    const sizeSelect = document.getElementById('custFontSizeSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', () => {
        window.resumeState.currentResume.customization.fontSize = sizeSelect.value;
        this.triggerReactiveUpdate();
      });
    }

    const spacingSelect = document.getElementById('custSpacingSelect');
    if (spacingSelect) {
      spacingSelect.addEventListener('change', () => {
        window.resumeState.currentResume.customization.spacing = spacingSelect.value;
        this.triggerReactiveUpdate();
      });
    }

    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        window.resumeState.currentResume.customization.accentColor = color;
        document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.triggerReactiveUpdate();
        window.showToast(`Accent color updated!`, 'info');
      });
    });
  }

  syncCustomizerUI() {
    const cust = window.resumeState.currentResume.customization;
    if (!cust) return;

    const setSelect = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setSelect('custTemplateSelect', cust.template);
    setSelect('custFontSelect', cust.font);
    setSelect('custFontSizeSelect', cust.fontSize);
    setSelect('custSpacingSelect', cust.spacing);

    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === cust.accentColor);
    });
  }

  /* ==========================================================================
     Job Matcher Bindings
     ========================================================================== */
  bindJobMatcher() {
    const btn = document.getElementById('runJobMatchBtn');
    const input = document.getElementById('jobDescriptionInput');
    const results = document.getElementById('jobMatchResultsBox');

    if (btn && input && results) {
      btn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) {
          alert('Please paste a job description first.');
          return;
        }

        const match = window.resumeChecker.matchJobDescription(text);
        results.style.display = 'flex';

        document.getElementById('jobMatchScoreText').textContent = `${match.matchPercentage}% Match`;
        document.getElementById('jobMatchProgressBarFill').style.width = `${match.matchPercentage}%`;

        const foundContainer = document.getElementById('matchedSkillsTagsCloud');
        const missingContainer = document.getElementById('missingSkillsTagsCloud');

        if (foundContainer) {
          foundContainer.innerHTML = match.matched.length > 0 
            ? match.matched.map(s => `<span class="match-skill-tag found">✓ ${s}</span>`).join('')
            : '<span style="font-size:0.8rem; color:var(--text-muted);">None detected</span>';
        }

        if (missingContainer) {
          missingContainer.innerHTML = match.missing.length > 0
            ? match.missing.map(s => `<span class="match-skill-tag missing">⚠ ${s}</span>`).join('')
            : '<span style="font-size:0.8rem; color:var(--success);">None! You possess all key keywords.</span>';
        }

        window.showToast(`Job analysis complete: ${match.matchPercentage}% keyword match!`, 'success');
      });
    }
  }

  /* ==========================================================================
     Modals & AI Assistant Dialog Bindings
     ========================================================================== */
  bindModals() {
    // AI Assistant modal close buttons
    document.getElementById('aiModalCloseBtn')?.addEventListener('click', () => window.aiAssistant.close());
    document.getElementById('aiCancelBtn')?.addEventListener('click', () => window.aiAssistant.close());
    document.getElementById('aiGenerateImprovementBtn')?.addEventListener('click', () => window.aiAssistant.generateImprovement());
    document.getElementById('aiAcceptBtn')?.addEventListener('click', () => window.aiAssistant.acceptSuggestion());

    // AI Tone buttons
    document.querySelectorAll('.ai-tone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.aiAssistant.setTone(btn.dataset.tone);
        window.aiAssistant.generateImprovement();
      });
    });
  }

  /* ==========================================================================
     Zoom Controls for Preview
     ========================================================================== */
  bindZoomControls() {
    document.getElementById('zoomInBtn')?.addEventListener('click', () => {
      const newZoom = Math.min(1.25, window.livePreviewEngine.currentZoom + 0.1);
      window.livePreviewEngine.setZoom(newZoom);
    });

    document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
      const newZoom = Math.max(0.65, window.livePreviewEngine.currentZoom - 0.1);
      window.livePreviewEngine.setZoom(newZoom);
    });

    document.getElementById('zoomFitBtn')?.addEventListener('click', () => {
      window.livePreviewEngine.setZoom(1);
    });
  }

  /* ==========================================================================
     Dashboard Resumes Manager
     ========================================================================== */
  renderDashboardResumes() {
    const container = document.getElementById('savedResumesList');
    if (!container) return;

    const resumes = window.resumeState.resumes || [];
    const activeId = window.resumeState.activeResumeId;

    // Update stats
    document.getElementById('statTotalResumes').textContent = resumes.length;
    document.getElementById('statCurrentScore').textContent = `${window.resumeChecker.score}%`;
    document.getElementById('statActiveTemplate').textContent = (window.resumeState.currentResume.customization.template || 'Modern').toUpperCase();

    if (resumes.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--text-muted); grid-column:1/-1;">
          No resumes found. Create your first resume to get started!
        </div>
      `;
      return;
    }

    container.innerHTML = resumes.map(r => {
      const isCurrent = r.id === activeId;
      const dateFormatted = new Date(r.updatedAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      return `
        <div class="resume-card-item ${isCurrent ? 'active' : ''}">
          <div class="resume-card-top">
            <div>
              <div class="resume-card-name">${r.name || 'Untitled Resume'} ${isCurrent ? '<span class="badge badge-ai" style="font-size:0.7rem; padding:2px 8px; margin-left:6px;">Active</span>' : ''}</div>
              <div class="resume-card-date">Updated ${dateFormatted} • ${(r.customization?.template || 'modern').toUpperCase()}</div>
            </div>
          </div>
          <div class="resume-card-actions">
            <button class="btn btn-sm btn-primary switch-resume-btn" data-id="${r.id}">Load & Edit</button>
            <button class="btn btn-sm btn-outline dup-resume-btn" data-id="${r.id}" title="Duplicate version">Duplicate</button>
            <button class="btn btn-sm btn-icon-only del-resume-btn" data-id="${r.id}" style="color:var(--danger);" title="Delete">✕</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.switch-resume-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.resumeState.setActiveResume(btn.dataset.id);
        this.populateFormFields();
        this.triggerReactiveUpdate();
        this.renderDashboardResumes();
        window.showToast('Loaded resume!', 'success');
        // Switch to personal tab
        document.querySelector('[data-section="personal"]')?.click();
      });
    });

    container.querySelectorAll('.dup-resume-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.resumeState.duplicateResume(btn.dataset.id);
        this.renderDashboardResumes();
        window.showToast('Resume version duplicated!', 'success');
      });
    });

    container.querySelectorAll('.del-resume-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this resume?')) {
          window.resumeState.deleteResume(btn.dataset.id);
          this.populateFormFields();
          this.triggerReactiveUpdate();
          this.renderDashboardResumes();
          window.showToast('Resume deleted.', 'info');
        }
      });
    });

    // Create New Resume Button
    document.getElementById('createNewResumeBtn')?.addEventListener('click', () => {
      const name = prompt('Enter a name for the new resume:', 'New Software Developer Resume');
      if (name) {
        window.resumeState.createNewResume(name);
        this.populateFormFields();
        this.triggerReactiveUpdate();
        this.renderDashboardResumes();
        window.showToast(`Created "${name}"!`, 'success');
        document.querySelector('[data-section="personal"]')?.click();
      }
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
  window.appController.init();
});
