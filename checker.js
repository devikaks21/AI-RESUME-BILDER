/**
 * ResumeAI — Resume Quality Score Checker & Job Description Keyword Matcher
 * Performs real-time audit, checklist verification, and ATS job description alignment
 */

class ResumeChecker {
  constructor() {
    this.score = 0;
    this.checklist = [];
    this.suggestions = [];
  }

  calculate() {
    const data = window.resumeState.currentResume;
    if (!data) return { score: 0, checklist: [], suggestions: [] };

    let totalPoints = 0;
    const checklist = [];
    const suggestions = [];

    // 1. Personal Information (20 pts)
    const p = data.personal || {};
    const hasBasicContact = p.fullName && p.email && p.phone;
    const hasSocials = p.linkedin || p.github || p.portfolio;

    if (hasBasicContact && hasSocials) {
      totalPoints += 20;
      checklist.push({ label: 'Personal Information & Social Links', status: 'passed' });
    } else if (hasBasicContact) {
      totalPoints += 15;
      checklist.push({ label: 'Personal Information (Missing LinkedIn / GitHub)', status: 'warning' });
      suggestions.push('Add a LinkedIn or GitHub profile link to boost recruiter trust.');
    } else {
      totalPoints += 5;
      checklist.push({ label: 'Personal Information incomplete', status: 'failed' });
      suggestions.push('Complete your full name, email address, and phone number.');
    }

    // 2. Professional Summary (15 pts)
    if (data.summary && data.summary.trim().length >= 80) {
      totalPoints += 15;
      checklist.push({ label: 'Professional Summary', status: 'passed' });
    } else if (data.summary && data.summary.trim().length > 20) {
      totalPoints += 10;
      checklist.push({ label: 'Summary could be more detailed', status: 'warning' });
      suggestions.push('Expand your summary using our AI assistant to highlight your strengths.');
    } else {
      checklist.push({ label: 'Professional Summary missing', status: 'failed' });
      suggestions.push('Add a 2-3 sentence summary detailing your background and ambitions.');
    }

    // 3. Education (15 pts)
    if (data.education && data.education.length > 0 && data.education[0].degree && data.education[0].institution) {
      totalPoints += 15;
      checklist.push({ label: 'Education History', status: 'passed' });
    } else {
      checklist.push({ label: 'Education details missing', status: 'failed' });
      suggestions.push('Add your degree, college name, and graduation timeline.');
    }

    // 4. Skills (15 pts)
    const skillCount = (data.skills || []).length;
    if (skillCount >= 8) {
      totalPoints += 15;
      checklist.push({ label: `Technical Skills (${skillCount} added)`, status: 'passed' });
    } else if (skillCount >= 4) {
      totalPoints += 10;
      checklist.push({ label: `Skills (${skillCount} added — recommend 8+)`, status: 'warning' });
      suggestions.push('Add a few more relevant technical or soft skills.');
    } else {
      totalPoints += 5;
      checklist.push({ label: 'Skills section sparse', status: 'failed' });
      suggestions.push('Add at least 5-8 core competencies relevant to your field.');
    }

    // 5. Projects (20 pts)
    const projCount = (data.projects || []).length;
    if (projCount >= 2) {
      totalPoints += 20;
      checklist.push({ label: `Projects (${projCount} documented)`, status: 'passed' });
    } else if (projCount === 1) {
      totalPoints += 12;
      checklist.push({ label: 'Projects (Only 1 project added)', status: 'warning' });
      suggestions.push('Adding a 2nd project significantly strengthens portfolio evidence.');
    } else {
      checklist.push({ label: 'Projects missing', status: 'failed' });
      suggestions.push('Add at least 1-2 practical projects demonstrating your skills.');
    }

    // 6. Experience or Certifications (15 pts)
    const hasExp = (data.experience || []).length > 0;
    const hasCerts = (data.certifications || []).length > 0;
    const hasAch = (data.achievements || []).length > 0;

    if (hasExp && (hasCerts || hasAch)) {
      totalPoints += 15;
      checklist.push({ label: 'Experience & Certifications', status: 'passed' });
    } else if (hasExp || hasCerts || hasAch) {
      totalPoints += 12;
      checklist.push({ label: 'Certifications / Extra Credentials', status: 'passed' });
    } else {
      totalPoints += 5;
      checklist.push({ label: 'No experience or certifications listed', status: 'warning' });
      suggestions.push('Add certifications, virtual internships, or academic achievements.');
    }

    this.score = Math.min(100, totalPoints);
    this.checklist = checklist;
    this.suggestions = suggestions;

    return {
      score: this.score,
      checklist: this.checklist,
      suggestions: this.suggestions
    };
  }

  updateScore() {
    const res = this.calculate();

    // Update circular SVG gauge
    const circle = document.getElementById('scoreProgressCircle');
    const scoreVal = document.getElementById('scoreNumericVal');
    const progressBarFill = document.getElementById('overallProgressBarFill');
    const progressValBadge = document.getElementById('overallProgressBadge');

    if (scoreVal) scoreVal.textContent = res.score;
    if (progressValBadge) progressValBadge.textContent = `${res.score}%`;
    if (progressBarFill) progressBarFill.style.width = `${res.score}%`;

    if (circle) {
      const radius = 38;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (res.score / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;

      // Color based on tier
      if (res.score >= 80) {
        circle.style.stroke = 'var(--success)';
      } else if (res.score >= 60) {
        circle.style.stroke = 'var(--warning)';
      } else {
        circle.style.stroke = 'var(--danger)';
      }
    }

    // Update checklist UI
    const listContainer = document.getElementById('checkerListContainer');
    if (listContainer) {
      listContainer.innerHTML = res.checklist.map(item => `
        <div class="checklist-item ${item.status}">
          <span style="display:flex; align-items:center; gap:8px;">
            <span class="checklist-status-icon">${item.status === 'passed' ? '✓' : item.status === 'warning' ? '⚠' : '✗'}</span>
            ${item.label}
          </span>
          <span style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:${item.status === 'passed' ? 'var(--success)' : item.status === 'warning' ? 'var(--warning)' : 'var(--danger)'}">
            ${item.status}
          </span>
        </div>
      `).join('');
    }

    // Update suggestions UI
    const suggContainer = document.getElementById('checkerSuggestionsContainer');
    if (suggContainer) {
      if (res.suggestions.length === 0) {
        suggContainer.innerHTML = `
          <div style="font-size:0.85rem; color:var(--success); padding:8px 0;">
            ✓ Outstanding! Your resume meets all top-tier recommendations.
          </div>
        `;
      } else {
        suggContainer.innerHTML = res.suggestions.map(s => `
          <div style="font-size:0.84rem; color:var(--text-secondary); display:flex; gap:8px; margin-bottom:6px;">
            <span style="color:var(--accent-secondary); font-weight:700;">→</span>
            <span>${s}</span>
          </div>
        `).join('');
      }
    }
  }

  /* ==========================================================================
     Job Description Matcher Algorithm
     ========================================================================== */
  matchJobDescription(jdText) {
    if (!jdText || jdText.trim().length < 15) {
      return { matchPercentage: 0, found: [], missing: [] };
    }

    const currentResume = window.resumeState.currentResume;
    const userSkills = (currentResume.skills || []).map(s => s.toLowerCase());
    const resumeFullText = JSON.stringify(currentResume).toLowerCase();

    // Industry keywords dictionary
    const commonKeywords = [
      'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'sql', 'mysql', 'postgresql',
      'mongodb', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
      'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'power bi', 'tableau',
      'excel', 'aws', 'azure', 'docker', 'kubernetes', 'git', 'github', 'ci/cd',
      'rest api', 'graphql', 'html', 'css', 'data analytics', 'data structures',
      'machine learning', 'agile', 'scrum', 'problem solving', 'communication'
    ];

    const jdLower = jdText.toLowerCase();
    const detectedInJd = commonKeywords.filter(k => jdLower.includes(k));

    if (detectedInJd.length === 0) {
      // Fallback: extract prominent words
      const words = jdLower.match(/[a-z]{4,}/g) || [];
      const freq = {};
      words.forEach(w => freq[w] = (freq[w] || 0) + 1);
      detectedInJd.push(...Object.keys(freq).filter(w => freq[w] > 2).slice(0, 10));
    }

    const matched = [];
    const missing = [];

    detectedInJd.forEach(kw => {
      const isDirectSkill = userSkills.some(s => s.includes(kw) || kw.includes(s));
      const isInResumeText = resumeFullText.includes(kw);

      if (isDirectSkill || isInResumeText) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const total = detectedInJd.length;
    const matchPercentage = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    return {
      matchPercentage,
      matched,
      missing
    };
  }
}

// Export singleton
window.resumeChecker = new ResumeChecker();
