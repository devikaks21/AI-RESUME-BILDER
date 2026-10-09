/**
 * ResumeAI — Live Resume Preview Engine
 * Renders the 8 distinct professional templates in real-time with dynamic custom styling
 * Supports categorized skills without forcing fake proficiency levels.
 */

class LivePreviewEngine {
  constructor() {
    this.container = null;
    this.currentZoom = 1;
    this.isFit = true;
  }

  init() {
    this.container = document.getElementById('resumePreviewPaper');
    this.render();
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

  hasAnySkills(data) {
    if (data.skillCategories && Array.isArray(data.skillCategories)) {
      return data.skillCategories.some(c => c.skills && c.skills.length > 0);
    }
    return data.skills && data.skills.length > 0;
  }

  getSkillCategories(data) {
    if (data.skillCategories && Array.isArray(data.skillCategories) && data.skillCategories.length > 0) {
      return data.skillCategories.filter(c => c.skills && c.skills.length > 0);
    }
    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
      return [{ id: 'cat-gen', name: 'Skills', skills: data.skills }];
    }
    return [];
  }

  renderSkillsSection(data, variant) {
    const categories = this.getSkillCategories(data);
    if (categories.length === 0) return '';

    if (variant === 'modern') {
      return `
        <div>
          <h2 class="sidebar-heading">Core Skills</h2>
          ${categories.map(cat => `
            <div style="margin-bottom:10px;">
              <div style="font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px;">${this.escapeHtml(cat.name)}</div>
              <div style="display:flex; flex-wrap:wrap;">
                ${cat.skills.map(s => `<span class="modern-skill-pill">${this.escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (variant === 'classic' || variant === 'ats' || variant === 'executive') {
      const heading = variant === 'ats' ? 'SKILLS' : variant === 'executive' ? 'Core Competencies' : 'Technical & Professional Skills';
      return `
        <section class="resume-section">
          <h2 class="section-heading">${heading}</h2>
          ${categories.map(cat => `
            <div style="margin-bottom:4px; font-size:11.5px; line-height:1.45;">
              <strong>${this.escapeHtml(cat.name)}:</strong> ${this.escapeHtml(cat.skills.join(', '))}
            </div>
          `).join('')}
        </section>
      `;
    }

    if (variant === 'tech') {
      return `
        <section>
          <h2 class="section-heading">tech_stack</h2>
          ${categories.map(cat => `
            <div style="margin-bottom:6px;">
              <span style="font-size:10.5px; color:#6B7280; font-weight:700;">// ${this.escapeHtml(cat.name)}:</span>
              <div>
                ${cat.skills.map(s => `<span class="tech-chip">${this.escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </section>
      `;
    }

    if (variant === 'creative') {
      return `
        <section>
          <h2 class="section-heading">Skills & Toolset</h2>
          ${categories.map(cat => `
            <div style="margin-bottom:8px;">
              <div style="font-size:11.5px; font-weight:700; color:#1F2937; margin-bottom:3px;">${this.escapeHtml(cat.name)}:</div>
              <div>
                ${cat.skills.map(s => `<span class="creative-skill-pill">${this.escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </section>
      `;
    }

    // minimal & compact
    return `
      <section>
        <h2 class="section-heading">${variant === 'compact' ? 'Technical Skills' : 'Expertise & Skills'}</h2>
        ${categories.map(cat => `
          <div style="margin-bottom:3px; font-size:11.5px; line-height:1.45;">
            <span style="font-weight:700;">${this.escapeHtml(cat.name)}:</span> ${this.escapeHtml(cat.skills.join('  •  '))}
          </div>
        `).join('')}
      </section>
    `;
  }

  render() {
    if (!this.container || !window.resumeState || !window.resumeState.currentResume) return;

    const data = window.resumeState.currentResume;
    const cust = data.customization || {
      template: 'modern',
      font: 'Inter',
      fontSize: 'normal',
      spacing: 'normal',
      accentColor: '#7C5CFF'
    };

    // Apply styling tokens
    this.container.style.setProperty('--accent-color', cust.accentColor);
    this.container.style.fontFamily = `"${cust.font}", sans-serif`;

    // Apply sizing classes
    this.container.className = 'resume-paper-page';
    this.container.classList.add(`template-${cust.template}`);
    this.container.classList.add(`font-size-${cust.fontSize}`);
    this.container.classList.add(`spacing-${cust.spacing}`);

    // Render corresponding template layout
    switch (cust.template) {
      case 'classic':
        this.container.innerHTML = this.renderClassicTemplate(data, cust);
        break;
      case 'minimal':
        this.container.innerHTML = this.renderMinimalTemplate(data, cust);
        break;
      case 'ats':
        this.container.innerHTML = this.renderAtsTemplate(data, cust);
        break;
      case 'tech':
        this.container.innerHTML = this.renderTechTemplate(data, cust);
        break;
      case 'executive':
        this.container.innerHTML = this.renderExecutiveTemplate(data, cust);
        break;
      case 'creative':
        this.container.innerHTML = this.renderCreativeTemplate(data, cust);
        break;
      case 'compact':
        this.container.innerHTML = this.renderCompactTemplate(data, cust);
        break;
      case 'modern':
      default:
        this.container.innerHTML = this.renderModernTemplate(data, cust);
        break;
    }
  }

  /* ==========================================================================
     Template 01: Classic (Executive Single Column)
     ========================================================================== */
  renderClassicTemplate(data, cust) {
    const p = data.personal || {};
    const contacts = [
      p.email ? `<a href="mailto:${this.escapeHtml(p.email)}">${this.escapeHtml(p.email)}</a>` : '',
      p.phone ? `<span>${this.escapeHtml(p.phone)}</span>` : '',
      p.location ? `<span>${this.escapeHtml(p.location)}</span>` : '',
      p.linkedin ? `<a href="${this.escapeHtml(p.linkedin)}" target="_blank">LinkedIn</a>` : '',
      p.github ? `<a href="${this.escapeHtml(p.github)}" target="_blank">GitHub</a>` : '',
      p.portfolio ? `<a href="${this.escapeHtml(p.portfolio)}" target="_blank">Portfolio</a>` : ''
    ].filter(Boolean).join(' • ');

    return `
      <header class="resume-header">
        <h1 class="resume-name">${this.escapeHtml(p.fullName || 'Your Full Name')}</h1>
        <div class="resume-title">${this.escapeHtml(p.jobTitle || 'Professional Title')}</div>
        <div class="resume-contacts">${contacts}</div>
      </header>

      ${data.summary ? `
        <section class="resume-section">
          <h2 class="section-heading">Professional Summary</h2>
          <p class="resume-body-text">${this.escapeHtml(data.summary)}</p>
        </section>
      ` : ''}

      ${this.renderSkillsSection(data, 'classic')}

      ${data.projects && data.projects.length > 0 ? `
        <section class="resume-section">
          <h2 class="section-heading">Key Projects</h2>
          ${data.projects.map(proj => `
            <div class="entry-block">
              <div class="entry-header">
                <div>
                  <span class="entry-title">${this.escapeHtml(proj.title)}</span>
                  ${proj.techStack ? `<span style="font-size:11px; color:var(--accent-color); font-weight:600; margin-left:6px;">[${this.escapeHtml(proj.techStack)}]</span>` : ''}
                </div>
                ${proj.link ? `<a href="${this.escapeHtml(proj.link)}" target="_blank" style="font-size:11px; color:var(--accent-color);">View Project ↗</a>` : ''}
              </div>
              <p class="resume-body-text">${this.escapeHtml(proj.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.experience && data.experience.length > 0 ? `
        <section class="resume-section">
          <h2 class="section-heading">Experience & Internships</h2>
          ${data.experience.map(exp => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(exp.role)} — ${this.escapeHtml(exp.company)}</span>
                <span class="entry-date">${this.escapeHtml(exp.startDate)} – ${this.escapeHtml(exp.endDate || 'Present')}</span>
              </div>
              <p class="resume-body-text">${this.escapeHtml(exp.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.education && data.education.length > 0 ? `
        <section class="resume-section">
          <h2 class="section-heading">Education</h2>
          ${data.education.map(edu => `
            <div class="entry-block">
              <div class="entry-header">
                <div>
                  <span class="entry-title">${this.escapeHtml(edu.degree)}</span>
                  <div class="entry-subtitle">${this.escapeHtml(edu.institution)} ${edu.location ? `• ${this.escapeHtml(edu.location)}` : ''}</div>
                </div>
                <div style="text-align:right;">
                  <span class="entry-date">${this.escapeHtml(edu.startDate)} – ${this.escapeHtml(edu.endDate)}</span>
                  ${edu.grade ? `<div style="font-size:11px; font-weight:600; color:#4B5563;">${this.escapeHtml(edu.grade)}</div>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.certifications && data.certifications.length > 0 ? `
        <section class="resume-section">
          <h2 class="section-heading">Certifications</h2>
          ${data.certifications.map(c => `
            <div class="entry-block" style="margin-bottom:6px;">
              <div class="entry-header">
                <span class="entry-title" style="font-size:12px;">${this.escapeHtml(c.title)} — <span style="font-weight:normal; color:#4B5563;">${this.escapeHtml(c.issuer)}</span></span>
                <span class="entry-date">${this.escapeHtml(c.date)}</span>
              </div>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.achievements && data.achievements.length > 0 ? `
        <section class="resume-section">
          <h2 class="section-heading">Achievements & Honors</h2>
          ${data.achievements.map(a => `
            <div class="entry-block" style="margin-bottom:6px;">
              <span class="entry-title" style="font-size:12px;">• ${this.escapeHtml(a.title)}</span>
              ${a.description ? `<span class="resume-body-text" style="margin-left:6px;">${this.escapeHtml(a.description)}</span>` : ''}
            </div>
          `).join('')}
        </section>
      ` : ''}
    `;
  }

  /* ==========================================================================
     Template 02: Modern (Two-Column with Sleek Sidebar)
     ========================================================================== */
  renderModernTemplate(data, cust) {
    const p = data.personal || {};

    return `
      <aside class="modern-sidebar">
        <div>
          <h2 class="sidebar-heading">Contact</h2>
          <div class="sidebar-contacts-list">
            ${p.email ? `<div>✉ <a href="mailto:${this.escapeHtml(p.email)}">${this.escapeHtml(p.email)}</a></div>` : ''}
            ${p.phone ? `<div>☎ ${this.escapeHtml(p.phone)}</div>` : ''}
            ${p.location ? `<div>📍 ${this.escapeHtml(p.location)}</div>` : ''}
            ${p.github ? `<div>💻 <a href="${this.escapeHtml(p.github)}" target="_blank">${this.escapeHtml(p.github.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>` : ''}
            ${p.linkedin ? `<div>🔗 <a href="${this.escapeHtml(p.linkedin)}" target="_blank">${this.escapeHtml(p.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>` : ''}
            ${p.portfolio ? `<div>🌐 <a href="${this.escapeHtml(p.portfolio)}" target="_blank">${this.escapeHtml(p.portfolio.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>` : ''}
          </div>
        </div>

        ${data.education && data.education.length > 0 ? `
          <div>
            <h2 class="sidebar-heading">Education</h2>
            ${data.education.map(edu => `
              <div style="margin-bottom:12px;">
                <div style="font-size:12px; font-weight:700; color:#FFFFFF;">${this.escapeHtml(edu.degree)}</div>
                <div style="font-size:11px; color:#94A3B8;">${this.escapeHtml(edu.institution)}</div>
                <div style="font-size:10px; color:#64748B;">${this.escapeHtml(edu.startDate)} – ${this.escapeHtml(edu.endDate)}</div>
                ${edu.grade ? `<div style="font-size:10px; color:#38BDF8; font-weight:600; margin-top:2px;">${this.escapeHtml(edu.grade)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${this.renderSkillsSection(data, 'modern')}

        ${data.certifications && data.certifications.length > 0 ? `
          <div>
            <h2 class="sidebar-heading">Certifications</h2>
            ${data.certifications.map(c => `
              <div style="margin-bottom:10px;">
                <div style="font-size:11px; font-weight:700; color:#FFFFFF;">${this.escapeHtml(c.title)}</div>
                <div style="font-size:10px; color:#94A3B8;">${this.escapeHtml(c.issuer)} (${this.escapeHtml(c.date)})</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </aside>

      <main class="modern-main">
        <header>
          <h1 class="resume-name">${this.escapeHtml(p.fullName || 'Your Full Name')}</h1>
          <div class="resume-title">${this.escapeHtml(p.jobTitle || 'Professional Title')}</div>
        </header>

        ${data.summary ? `
          <section>
            <h2 class="section-heading">Professional Summary</h2>
            <p class="resume-body-text">${this.escapeHtml(data.summary)}</p>
          </section>
        ` : ''}

        ${data.projects && data.projects.length > 0 ? `
          <section>
            <h2 class="section-heading">Featured Projects</h2>
            ${data.projects.map(proj => `
              <div class="entry-block">
                <div class="entry-header">
                  <span class="entry-title">${this.escapeHtml(proj.title)}</span>
                  ${proj.link ? `<a href="${this.escapeHtml(proj.link)}" target="_blank" style="font-size:11px; color:var(--accent-color);">GitHub ↗</a>` : ''}
                </div>
                ${proj.techStack ? `<div class="entry-subtitle">${this.escapeHtml(proj.techStack)}</div>` : ''}
                <p class="resume-body-text">${this.escapeHtml(proj.description)}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${data.experience && data.experience.length > 0 ? `
          <section>
            <h2 class="section-heading">Experience & Internships</h2>
            ${data.experience.map(exp => `
              <div class="entry-block">
                <div class="entry-header">
                  <span class="entry-title">${this.escapeHtml(exp.role)}</span>
                  <span class="entry-date">${this.escapeHtml(exp.startDate)} – ${this.escapeHtml(exp.endDate || 'Present')}</span>
                </div>
                <div class="entry-subtitle">${this.escapeHtml(exp.company)} ${exp.location ? `• ${this.escapeHtml(exp.location)}` : ''}</div>
                <p class="resume-body-text">${this.escapeHtml(exp.description)}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${data.achievements && data.achievements.length > 0 ? `
          <section>
            <h2 class="section-heading">Achievements & Honors</h2>
            ${data.achievements.map(a => `
              <div style="margin-bottom:6px;">
                <span class="entry-title" style="font-size:12px;">🏆 ${this.escapeHtml(a.title)}</span>
                ${a.description ? `<p class="resume-body-text" style="margin-top:2px;">${this.escapeHtml(a.description)}</p>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}
      </main>
    `;
  }

  /* ==========================================================================
     Template 03: Minimal (Crisp Editorial Whitespace)
     ========================================================================== */
  renderMinimalTemplate(data, cust) {
    const p = data.personal || {};
    const contacts = [
      p.email,
      p.phone,
      p.location,
      p.linkedin ? 'LinkedIn' : '',
      p.github ? 'GitHub' : ''
    ].filter(Boolean).join('  /  ');

    return `
      <header class="resume-header">
        <h1 class="resume-name">${this.escapeHtml(p.fullName || 'Your Full Name')}</h1>
        <div class="resume-title">${this.escapeHtml(p.jobTitle || 'Professional Title')}</div>
        <div class="resume-contacts">${this.escapeHtml(contacts)}</div>
      </header>

      ${data.summary ? `
        <section>
          <h2 class="section-heading">About</h2>
          <p class="resume-body-text">${this.escapeHtml(data.summary)}</p>
        </section>
      ` : ''}

      ${this.renderSkillsSection(data, 'minimal')}

      ${data.projects && data.projects.length > 0 ? `
        <section>
          <h2 class="section-heading">Selected Projects</h2>
          ${data.projects.map(proj => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(proj.title)} <span style="font-weight:normal; color:#6B7280; font-size:11px;">(${this.escapeHtml(proj.techStack)})</span></span>
                ${proj.link ? `<a href="${this.escapeHtml(proj.link)}" target="_blank" style="font-size:11px; color:#4B5563;">View ↗</a>` : ''}
              </div>
              <p class="resume-body-text">${this.escapeHtml(proj.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.experience && data.experience.length > 0 ? `
        <section>
          <h2 class="section-heading">Experience</h2>
          ${data.experience.map(exp => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(exp.role)} — ${this.escapeHtml(exp.company)}</span>
                <span class="entry-date">${this.escapeHtml(exp.startDate)} – ${this.escapeHtml(exp.endDate || 'Present')}</span>
              </div>
              <p class="resume-body-text">${this.escapeHtml(exp.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.education && data.education.length > 0 ? `
        <section>
          <h2 class="section-heading">Education</h2>
          ${data.education.map(edu => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(edu.degree)} — <span style="font-weight:normal; color:#6B7280;">${this.escapeHtml(edu.institution)}</span></span>
                <span class="entry-date">${this.escapeHtml(edu.startDate)} – ${this.escapeHtml(edu.endDate)}</span>
              </div>
              ${edu.grade ? `<div style="font-size:11px; color:#6B7280;">${this.escapeHtml(edu.grade)}</div>` : ''}
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.certifications && data.certifications.length > 0 ? `
        <section>
          <h2 class="section-heading">Certifications</h2>
          ${data.certifications.map(c => `
            <div style="font-size:12px; margin-bottom:4px; display:flex; justify-content:space-between;">
              <span>${this.escapeHtml(c.title)} (${this.escapeHtml(c.issuer)})</span>
              <span style="color:#9CA3AF;">${this.escapeHtml(c.date)}</span>
            </div>
          `).join('')}
        </section>
      ` : ''}
    `;
  }

  /* ==========================================================================
     Template 04: ATS-Friendly (High Parser Readability)
     ========================================================================== */
  renderAtsTemplate(data, cust) {
    const p = data.personal || {};
    const contacts = [
      p.email,
      p.phone,
      p.location,
      p.linkedin,
      p.github
    ].filter(Boolean).join(' | ');

    return `
      <header class="resume-header">
        <h1 class="resume-name">${this.escapeHtml((p.fullName || 'YOUR NAME').toUpperCase())}</h1>
        <div class="resume-title">${this.escapeHtml(p.jobTitle || 'JOB TITLE')}</div>
        <div class="resume-contacts">${this.escapeHtml(contacts)}</div>
      </header>

      ${data.summary ? `
        <section>
          <h2 class="section-heading">PROFESSIONAL SUMMARY</h2>
          <p class="resume-body-text">${this.escapeHtml(data.summary)}</p>
        </section>
      ` : ''}

      ${this.renderSkillsSection(data, 'ats')}

      ${data.projects && data.projects.length > 0 ? `
        <section>
          <h2 class="section-heading">PROJECTS</h2>
          ${data.projects.map(proj => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(proj.title)} | ${this.escapeHtml(proj.techStack || '')}</span>
                ${proj.link ? `<span style="font-size:11px;">${this.escapeHtml(proj.link)}</span>` : ''}
              </div>
              <p class="resume-body-text">• ${this.escapeHtml(proj.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.experience && data.experience.length > 0 ? `
        <section>
          <h2 class="section-heading">PROFESSIONAL EXPERIENCE</h2>
          ${data.experience.map(exp => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(exp.company)} — ${this.escapeHtml(exp.role)}</span>
                <span class="entry-date">${this.escapeHtml(exp.startDate)} – ${this.escapeHtml(exp.endDate || 'Present')}</span>
              </div>
              <p class="resume-body-text">• ${this.escapeHtml(exp.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.education && data.education.length > 0 ? `
        <section>
          <h2 class="section-heading">EDUCATION</h2>
          ${data.education.map(edu => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(edu.degree)}</span>
                <span class="entry-date">${this.escapeHtml(edu.startDate)} – ${this.escapeHtml(edu.endDate)}</span>
              </div>
              <div style="font-size:11px;">${this.escapeHtml(edu.institution)} ${edu.grade ? `| ${this.escapeHtml(edu.grade)}` : ''}</div>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.certifications && data.certifications.length > 0 ? `
        <section>
          <h2 class="section-heading">CERTIFICATIONS</h2>
          ${data.certifications.map(c => `
            <div style="font-size:11px; margin-bottom:3px;">
              • <strong>${this.escapeHtml(c.title)}</strong>, ${this.escapeHtml(c.issuer)} (${this.escapeHtml(c.date)})
            </div>
          `).join('')}
        </section>
      ` : ''}
    `;
  }

  /* ==========================================================================
     Template 05: Tech / Developer (Monospace Code Styling)
     ========================================================================== */
  renderTechTemplate(data, cust) {
    const p = data.personal || {};
    const contacts = [
      p.email ? `<a href="mailto:${this.escapeHtml(p.email)}">${this.escapeHtml(p.email)}</a>` : '',
      p.phone ? `<span>${this.escapeHtml(p.phone)}</span>` : '',
      p.location ? `<span>${this.escapeHtml(p.location)}</span>` : '',
      p.github ? `<a href="${this.escapeHtml(p.github)}" target="_blank">github</a>` : '',
      p.linkedin ? `<a href="${this.escapeHtml(p.linkedin)}" target="_blank">linkedin</a>` : ''
    ].filter(Boolean).join(' | ');

    return `
      <header class="resume-header">
        <h1 class="resume-name">${this.escapeHtml(p.fullName || 'Dev Name')}</h1>
        <div class="resume-title">${this.escapeHtml(p.jobTitle || 'Software Engineer')}</div>
        <div class="resume-contacts">${contacts}</div>
      </header>

      ${data.summary ? `
        <section>
          <h2 class="section-heading">summary</h2>
          <p class="resume-body-text">${this.escapeHtml(data.summary)}</p>
        </section>
      ` : ''}

      ${this.renderSkillsSection(data, 'tech')}

      ${data.projects && data.projects.length > 0 ? `
        <section>
          <h2 class="section-heading">projects</h2>
          ${data.projects.map(proj => `
            <div class="entry-block">
              <div class="entry-header">
                <div>
                  <span class="entry-title">${this.escapeHtml(proj.title)}</span>
                  ${proj.techStack ? `<span style="font-size:11px; color:var(--accent-color); margin-left:6px;">[${this.escapeHtml(proj.techStack)}]</span>` : ''}
                </div>
                ${proj.link ? `<a href="${this.escapeHtml(proj.link)}" target="_blank" style="font-size:11px; color:var(--accent-color);">code ↗</a>` : ''}
              </div>
              <p class="resume-body-text">${this.escapeHtml(proj.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.experience && data.experience.length > 0 ? `
        <section>
          <h2 class="section-heading">experience</h2>
          ${data.experience.map(exp => `
            <div class="entry-block">
              <div class="entry-header">
                <div>
                  <span class="entry-title">${this.escapeHtml(exp.role)}</span>
                  <span class="entry-subtitle">@ ${this.escapeHtml(exp.company)}</span>
                </div>
                <span class="entry-date">${this.escapeHtml(exp.startDate)} – ${this.escapeHtml(exp.endDate || 'Present')}</span>
              </div>
              <p class="resume-body-text">${this.escapeHtml(exp.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.education && data.education.length > 0 ? `
        <section>
          <h2 class="section-heading">education</h2>
          ${data.education.map(edu => `
            <div class="entry-block">
              <div class="entry-header">
                <div>
                  <span class="entry-title">${this.escapeHtml(edu.degree)}</span>
                  <div class="entry-subtitle">${this.escapeHtml(edu.institution)}</div>
                </div>
                <span class="entry-date">${this.escapeHtml(edu.startDate)} – ${this.escapeHtml(edu.endDate)}</span>
              </div>
              ${edu.grade ? `<div style="font-size:10.5px; color:#4B5563;">${this.escapeHtml(edu.grade)}</div>` : ''}
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.certifications && data.certifications.length > 0 ? `
        <section>
          <h2 class="section-heading">credentials</h2>
          ${data.certifications.map(c => `
            <div style="font-size:11px; margin-bottom:4px;">
              • ${this.escapeHtml(c.title)} — ${this.escapeHtml(c.issuer)} (${this.escapeHtml(c.date)})
            </div>
          `).join('')}
        </section>
      ` : ''}
    `;
  }

  /* ==========================================================================
     Template 06: Executive / Elegant Serif
     ========================================================================== */
  renderExecutiveTemplate(data, cust) {
    const p = data.personal || {};
    const contacts = [
      p.email ? `<a href="mailto:${this.escapeHtml(p.email)}">${this.escapeHtml(p.email)}</a>` : '',
      p.phone ? `<span>${this.escapeHtml(p.phone)}</span>` : '',
      p.location ? `<span>${this.escapeHtml(p.location)}</span>` : '',
      p.linkedin ? `<a href="${this.escapeHtml(p.linkedin)}" target="_blank">LinkedIn</a>` : ''
    ].filter(Boolean).join(' • ');

    return `
      <header class="resume-header">
        <h1 class="resume-name">${this.escapeHtml(p.fullName || 'Executive Candidate')}</h1>
        <div class="resume-title">${this.escapeHtml(p.jobTitle || 'Professional Title')}</div>
        <div class="resume-contacts">${contacts}</div>
      </header>

      ${data.summary ? `
        <section>
          <h2 class="section-heading">Executive Profile</h2>
          <p class="resume-body-text" style="text-align:justify;">${this.escapeHtml(data.summary)}</p>
        </section>
      ` : ''}

      ${this.renderSkillsSection(data, 'executive')}

      ${data.experience && data.experience.length > 0 ? `
        <section>
          <h2 class="section-heading">Professional Experience</h2>
          ${data.experience.map(exp => `
            <div class="entry-block">
              <div class="entry-header">
                <div>
                  <span class="entry-title">${this.escapeHtml(exp.role)}</span>
                  <div class="entry-subtitle">${this.escapeHtml(exp.company)} ${exp.location ? `| ${this.escapeHtml(exp.location)}` : ''}</div>
                </div>
                <span class="entry-date">${this.escapeHtml(exp.startDate)} – ${this.escapeHtml(exp.endDate || 'Present')}</span>
              </div>
              <p class="resume-body-text">${this.escapeHtml(exp.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.projects && data.projects.length > 0 ? `
        <section>
          <h2 class="section-heading">Key Initiatives & Projects</h2>
          ${data.projects.map(proj => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(proj.title)}</span>
                ${proj.link ? `<a href="${this.escapeHtml(proj.link)}" target="_blank" style="font-size:11px; color:var(--accent-color);">Link ↗</a>` : ''}
              </div>
              ${proj.techStack ? `<div class="entry-subtitle">${this.escapeHtml(proj.techStack)}</div>` : ''}
              <p class="resume-body-text">${this.escapeHtml(proj.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.education && data.education.length > 0 ? `
        <section>
          <h2 class="section-heading">Academic Credentials</h2>
          ${data.education.map(edu => `
            <div class="entry-block">
              <div class="entry-header">
                <div>
                  <span class="entry-title">${this.escapeHtml(edu.degree)}</span>
                  <div class="entry-subtitle">${this.escapeHtml(edu.institution)}</div>
                </div>
                <span class="entry-date">${this.escapeHtml(edu.startDate)} – ${this.escapeHtml(edu.endDate)}</span>
              </div>
              ${edu.grade ? `<div style="font-size:11px; color:#4B5563;">${this.escapeHtml(edu.grade)}</div>` : ''}
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.achievements && data.achievements.length > 0 ? `
        <section>
          <h2 class="section-heading">Honors & Distinction</h2>
          ${data.achievements.map(a => `
            <div style="font-size:11.5px; margin-bottom:4px;">
              <strong>${this.escapeHtml(a.title)}:</strong> ${this.escapeHtml(a.description)}
            </div>
          `).join('')}
        </section>
      ` : ''}
    `;
  }

  /* ==========================================================================
     Template 07: Creative / Banner
     ========================================================================== */
  renderCreativeTemplate(data, cust) {
    const p = data.personal || {};
    const contacts = [
      p.email ? `<a href="mailto:${this.escapeHtml(p.email)}">${this.escapeHtml(p.email)}</a>` : '',
      p.phone ? `<span>${this.escapeHtml(p.phone)}</span>` : '',
      p.location ? `<span>${this.escapeHtml(p.location)}</span>` : '',
      p.linkedin ? `<a href="${this.escapeHtml(p.linkedin)}" target="_blank">LinkedIn</a>` : '',
      p.portfolio ? `<a href="${this.escapeHtml(p.portfolio)}" target="_blank">Portfolio</a>` : ''
    ].filter(Boolean).join('  •  ');

    return `
      <div class="creative-banner">
        <h1 class="resume-name">${this.escapeHtml(p.fullName || 'Candidate Name')}</h1>
        <div class="resume-title">${this.escapeHtml(p.jobTitle || 'Professional Role')}</div>
        <div class="resume-contacts">${contacts}</div>
      </div>

      <div class="creative-body">
        ${data.summary ? `
          <section>
            <h2 class="section-heading">About Me</h2>
            <p class="resume-body-text">${this.escapeHtml(data.summary)}</p>
          </section>
        ` : ''}

        ${this.renderSkillsSection(data, 'creative')}

        ${data.projects && data.projects.length > 0 ? `
          <section>
            <h2 class="section-heading">Portfolio Projects</h2>
            ${data.projects.map(proj => `
              <div class="entry-block">
                <div class="entry-header">
                  <div>
                    <span class="entry-title">${this.escapeHtml(proj.title)}</span>
                    ${proj.techStack ? `<span style="font-size:11px; color:var(--accent-color); margin-left:6px;">• ${this.escapeHtml(proj.techStack)}</span>` : ''}
                  </div>
                  ${proj.link ? `<a href="${this.escapeHtml(proj.link)}" target="_blank" style="font-size:11px; color:var(--accent-color); font-weight:600;">Visit ↗</a>` : ''}
                </div>
                <p class="resume-body-text">${this.escapeHtml(proj.description)}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${data.experience && data.experience.length > 0 ? `
          <section>
            <h2 class="section-heading">Work Experience</h2>
            ${data.experience.map(exp => `
              <div class="entry-block">
                <div class="entry-header">
                  <span class="entry-title">${this.escapeHtml(exp.role)} — ${this.escapeHtml(exp.company)}</span>
                  <span class="entry-date">${this.escapeHtml(exp.startDate)} – ${this.escapeHtml(exp.endDate || 'Present')}</span>
                </div>
                <p class="resume-body-text">${this.escapeHtml(exp.description)}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${data.education && data.education.length > 0 ? `
          <section>
            <h2 class="section-heading">Education</h2>
            ${data.education.map(edu => `
              <div class="entry-block">
                <div class="entry-header">
                  <span class="entry-title">${this.escapeHtml(edu.degree)} — ${this.escapeHtml(edu.institution)}</span>
                  <span class="entry-date">${this.escapeHtml(edu.startDate)} – ${this.escapeHtml(edu.endDate)}</span>
                </div>
                ${edu.grade ? `<div style="font-size:11px; color:#4B5563;">${this.escapeHtml(edu.grade)}</div>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}
      </div>
    `;
  }

  /* ==========================================================================
     Template 08: Compact (1-Page High Density)
     ========================================================================== */
  renderCompactTemplate(data, cust) {
    const p = data.personal || {};

    return `
      <header class="resume-header">
        <div>
          <h1 class="resume-name">${this.escapeHtml(p.fullName || 'Candidate Name')}</h1>
          <div class="resume-title">${this.escapeHtml(p.jobTitle || 'Professional Title')}</div>
        </div>
        <div class="resume-contacts">
          ${p.email ? `<div>${this.escapeHtml(p.email)}</div>` : ''}
          ${p.phone ? `<div>${this.escapeHtml(p.phone)}</div>` : ''}
          ${p.location ? `<div>${this.escapeHtml(p.location)}</div>` : ''}
          ${p.github ? `<div><a href="${this.escapeHtml(p.github)}" target="_blank">github</a></div>` : ''}
        </div>
      </header>

      ${data.summary ? `
        <section>
          <h2 class="section-heading">Profile</h2>
          <p class="resume-body-text">${this.escapeHtml(data.summary)}</p>
        </section>
      ` : ''}

      ${this.renderSkillsSection(data, 'compact')}

      ${data.projects && data.projects.length > 0 ? `
        <section>
          <h2 class="section-heading">Projects</h2>
          ${data.projects.map(proj => `
            <div class="entry-block">
              <div class="entry-header">
                <div>
                  <span class="entry-title">${this.escapeHtml(proj.title)}</span>
                  ${proj.techStack ? `<span style="font-size:10px; color:var(--accent-color);">(${this.escapeHtml(proj.techStack)})</span>` : ''}
                </div>
                ${proj.link ? `<a href="${this.escapeHtml(proj.link)}" target="_blank" style="font-size:10px;">Link ↗</a>` : ''}
              </div>
              <p class="resume-body-text">${this.escapeHtml(proj.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.experience && data.experience.length > 0 ? `
        <section>
          <h2 class="section-heading">Experience</h2>
          ${data.experience.map(exp => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(exp.role)} — ${this.escapeHtml(exp.company)}</span>
                <span class="entry-date">${this.escapeHtml(exp.startDate)} – ${this.escapeHtml(exp.endDate || 'Present')}</span>
              </div>
              <p class="resume-body-text">${this.escapeHtml(exp.description)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.education && data.education.length > 0 ? `
        <section>
          <h2 class="section-heading">Education</h2>
          ${data.education.map(edu => `
            <div class="entry-block">
              <div class="entry-header">
                <span class="entry-title">${this.escapeHtml(edu.degree)} — ${this.escapeHtml(edu.institution)}</span>
                <span class="entry-date">${this.escapeHtml(edu.startDate)} – ${this.escapeHtml(edu.endDate)}</span>
              </div>
              ${edu.grade ? `<div style="font-size:10px; color:#4B5563;">${this.escapeHtml(edu.grade)}</div>` : ''}
            </div>
          `).join('')}
        </section>
      ` : ''}
    `;
  }

  setZoom(zoomVal) {
    if (!this.container) return;
    this.currentZoom = zoomVal;
    this.container.style.transform = `scale(${zoomVal})`;
    const label = document.getElementById('zoomPercentageLabel');
    if (label) label.textContent = `${Math.round(zoomVal * 100)}%`;
  }
}

// Export singleton
window.livePreviewEngine = new LivePreviewEngine();
