/**
 * ResumeAI — Voice Command Parser & Intent Classification
 * Translates natural speech phrases into structured intents and entity parameters
 * with support for conversational state and multi-entity extraction.
 */

class VoiceCommandParser {
  constructor() {
    this.templates = ['modern', 'classic', 'minimal', 'ats', 'tech', 'executive', 'creative', 'compact'];
    this.sections = [
      { key: 'personal', aliases: ['personal', 'personal info', 'personal information', 'contact', 'contacts'] },
      { key: 'summary', aliases: ['summary', 'about me', 'profile', 'bio', 'objective'] },
      { key: 'education', aliases: ['education', 'college', 'school', 'university', 'academics'] },
      { key: 'skills', aliases: ['skills', 'skill', 'technologies', 'tech stack', 'competencies'] },
      { key: 'projects', aliases: ['projects', 'project', 'portfolio work'] },
      { key: 'experience', aliases: ['experience', 'internship', 'internships', 'work', 'job', 'work experience'] },
      { key: 'certifications', aliases: ['certifications', 'certification', 'certificates', 'credentials'] },
      { key: 'achievements', aliases: ['achievements', 'achievement', 'honors', 'awards', 'accomplishments'] },
      { key: 'customizer', aliases: ['styling', 'customizer', 'styles', 'appearance', 'theme', 'color', 'font'] },
      { key: 'checker', aliases: ['ats score', 'checker', 'score', 'audit', 'completeness'] },
      { key: 'jobmatch', aliases: ['job match', 'job matcher', 'keywords', 'job description'] },
      { key: 'dashboard', aliases: ['dashboard', 'my resumes', 'resumes', 'all resumes'] }
    ];
  }

  /**
   * Parse user utterance into one or more structured intents
   * @param {string} rawText 
   * @param {object} conversationContext 
   * @returns {object} { intent, entities, originalText, isDestructive, confirmationRequired }
   */
  parse(rawText, conversationContext = null) {
    if (!rawText || typeof rawText !== 'string') {
      return { intent: 'UNKNOWN', originalText: '' };
    }

    const text = rawText.trim();
    // Normalize string: strip trailing punctuation and extra spaces
    const lower = text.toLowerCase().replace(/[?!.,;: ]+$/g, '').trim();

    // 1. If currently in a multi-step conversation waiting for specific answer
    if (conversationContext && conversationContext.activeStep) {
      return this.handleConversationalStep(text, lower, conversationContext);
    }

    // 2. Destructive Commands (Must be caught early to trigger confirmation)
    if (this.isMatch(lower, ['clear my resume', 'clear resume', 'reset my resume', 'delete all data', 'wipe resume', 'remove all skills', 'delete my resume'])) {
      return {
        intent: 'CLEAR_RESUME',
        originalText: text,
        isDestructive: true,
        confirmationRequired: true,
        confirmQuestion: lower.includes('skill') 
          ? 'Are you sure you want to remove all skills from your resume?'
          : 'Are you sure you want to clear your entire resume data?'
      };
    }

    // 3. Help Commands
    if (this.isMatch(lower, ['help', 'what can you do', 'what can i say', 'commands', 'voice commands', 'show help', 'guide me'])) {
      return {
        intent: 'HELP',
        originalText: text
      };
    }

    // 4. Download / Export PDF
    if (this.isMatch(lower, ['download my resume', 'download resume', 'download as pdf', 'download pdf', 'export my resume', 'export pdf', 'save as pdf'])) {
      return {
        intent: 'DOWNLOAD_RESUME',
        originalText: text
      };
    }

    // 5. Save Resume
    if (this.isMatch(lower, ['save my resume', 'save resume', 'save this resume', 'save', 'store resume'])) {
      return {
        intent: 'SAVE_RESUME',
        originalText: text
      };
    }

    // 6. Preview Resume / View
    if (this.isMatch(lower, ['preview my resume', 'preview resume', 'open my resume', 'show preview', 'go to preview', 'open preview', 'view preview', 'see preview', 'live preview'])) {
      return {
        intent: 'PREVIEW_RESUME',
        originalText: text
      };
    }

    // 7. Check Resume / ATS Score
    if (this.isMatch(lower, ['check my resume', 'check resume', 'is my resume ats friendly', 'is it ats friendly', 'what is missing from my resume', 'what is missing', 'ats score', 'check ats', 'check my skills section', 'check my project section'])) {
      let targetSection = null;
      if (lower.includes('skill')) targetSection = 'skills';
      if (lower.includes('project')) targetSection = 'projects';
      return {
        intent: 'CHECK_RESUME',
        originalText: text,
        entities: { targetSection }
      };
    }

    // 8. Template Selection
    // e.g. "Use the modern template", "Change my template to tech", "Switch to minimal"
    const templateMatch = this.extractTemplate(lower);
    if (templateMatch) {
      return {
        intent: 'CHANGE_TEMPLATE',
        originalText: text,
        entities: { template: templateMatch }
      };
    }

    // 9. AI Writing & Content Improvement
    // e.g. "Improve my project description", "Make my summary more professional", "Make my resume more ATS friendly", "Shorten this description"
    const aiIntent = this.extractAIImprovement(lower, text);
    if (aiIntent) {
      return aiIntent;
    }

    // 10. Read Aloud / Review Info
    // e.g. "Read my summary", "Read my skills", "Read my contact details"
    const readMatch = this.extractReadInfo(lower);
    if (readMatch) {
      return readMatch;
    }

    // 11. Navigation / Section Opening
    // e.g. "Open personal information", "Open education", "Open skills", "Open projects", "Go back"
    const navMatch = this.extractNavigation(lower);
    if (navMatch) {
      return navMatch;
    }

    // 12. Create New Resume
    if (this.isMatch(lower, ['create a new resume', 'create new resume', 'start a new resume', 'new resume'])) {
      return {
        intent: 'CREATE_NEW_RESUME',
        originalText: text
      };
    }

    // 13. Remove Skills
    // e.g. "Remove C from my skills", "Delete Java from skills", "Remove Python"
    if (lower.startsWith('remove ') || lower.startsWith('delete ')) {
      const skillToRemove = this.extractSkillToRemove(text);
      if (skillToRemove) {
        return {
          intent: 'REMOVE_SKILL',
          originalText: text,
          entities: { skill: skillToRemove }
        };
      }
    }

    // 14. List / What skills have I added
    if (this.isMatch(lower, ['what skills have i added', 'what are my skills', 'show my skills', 'list my skills', 'show skills'])) {
      return {
        intent: 'LIST_SKILLS',
        originalText: text
      };
    }

    // 15. Add Skills
    // e.g. "Add Python to my skills", "Add Python, Java and SQL", "Include React and Node.js"
    const skillsToAdd = this.extractSkillsToAdd(text, lower);
    if (skillsToAdd && skillsToAdd.length > 0) {
      return {
        intent: 'ADD_SKILL',
        originalText: text,
        entities: { skills: skillsToAdd }
      };
    }

    // 16. Projects (Add project or provide project detail)
    // e.g. "Add a project", "Add my Student Data Analytics project", "My project is...", "The technology used is..."
    const projectIntent = this.extractProjectIntent(text, lower);
    if (projectIntent) {
      return projectIntent;
    }

    // 17. Education (Add education, degree, college, CGPA, graduation)
    // e.g. "Add my BCA education", "My college is...", "My CGPA is 8.2", "I'm graduating in 2028"
    const eduIntent = this.extractEducationIntent(text, lower);
    if (eduIntent) {
      return eduIntent;
    }

    // 18. Experience / Internships
    // e.g. "Add my internship", "Add my internship experience", "Add experience at..."
    const expIntent = this.extractExperienceIntent(text, lower);
    if (expIntent) {
      return expIntent;
    }

    // 19. Certifications
    // e.g. "Add my Python certification", "Add AWS certification", "Show my certifications", "Remove AWS certification"
    const certIntent = this.extractCertIntent(text, lower);
    if (certIntent) {
      return certIntent;
    }

    // 20. Achievements
    // e.g. "Add my hackathon achievement", "Add achievement 1st place in coding"
    const achIntent = this.extractAchievementIntent(text, lower);
    if (achIntent) {
      return achIntent;
    }

    // 21. Personal Information Extraction (Single or Compound)
    // e.g. "My name is Devika KS", "My email is ...", "My phone number is ...", "I'm from Tumkur", "I'm a BCA student"
    const personalUpdates = this.extractPersonalInfo(text, lower);
    if (personalUpdates && Object.keys(personalUpdates).length > 0) {
      return {
        intent: 'UPDATE_PERSONAL_INFO',
        originalText: text,
        entities: personalUpdates
      };
    }

    // Default Unknown fallback
    return {
      intent: 'UNKNOWN',
      originalText: text,
      message: "I didn't recognize that command. You can say 'Help' to see what I can do."
    };
  }

  /* ==========================================================================
     Conversational Step Handling (Multi-Turn Prompts)
     ========================================================================== */
  handleConversationalStep(text, lower, context) {
    const { activeStep, stepData } = context;

    // Support cancellation at any conversational step
    if (this.isMatch(lower, ['cancel', 'stop', 'nevermind', 'abort', 'exit', 'quit'])) {
      return {
        intent: 'CONVERSATION_CANCELLED',
        originalText: text,
        message: 'Cancelled action.'
      };
    }

    // Multi-step: Adding a Project
    if (activeStep === 'COLLECT_PROJECT_NAME') {
      const name = text.replace(/^(my project is|the project is|it is|it's|name is)\s+/i, '').trim();
      return {
        intent: 'CONVERSATION_CONTINUE',
        nextStep: 'COLLECT_PROJECT_TECH',
        stepData: { ...stepData, title: name },
        question: `Great! What technologies did you use for "${name}"?`
      };
    }

    if (activeStep === 'COLLECT_PROJECT_TECH') {
      const tech = text.replace(/^(the technology used is|technologies are|tech stack is|i used|using)\s+/i, '').trim();
      return {
        intent: 'CONVERSATION_CONTINUE',
        nextStep: 'COLLECT_PROJECT_DESC',
        stepData: { ...stepData, techStack: tech },
        question: 'What did you build, solve, or achieve in this project?'
      };
    }

    if (activeStep === 'COLLECT_PROJECT_DESC') {
      const desc = text.replace(/^(it does|i built|the description is|we built)\s+/i, '').trim();
      return {
        intent: 'PROJECT_CONVERSATION_COMPLETE',
        entities: {
          title: stepData.title,
          techStack: stepData.techStack,
          description: desc
        }
      };
    }

    // Multi-step: Adding Education
    if (activeStep === 'COLLECT_EDU_DEGREE') {
      const degree = text.replace(/^(my degree is|the degree is|i am doing|studying)\s+/i, '').trim();
      return {
        intent: 'CONVERSATION_CONTINUE',
        nextStep: 'COLLECT_EDU_COLLEGE',
        stepData: { ...stepData, degree },
        question: 'Which college or university are you attending?'
      };
    }

    if (activeStep === 'COLLECT_EDU_COLLEGE') {
      const institution = text.replace(/^(my college is|institution is|at|i attend)\s+/i, '').trim();
      return {
        intent: 'CONVERSATION_CONTINUE',
        nextStep: 'COLLECT_EDU_YEAR',
        stepData: { ...stepData, institution },
        question: 'What is your graduation year (e.g. 2028)?'
      };
    }

    if (activeStep === 'COLLECT_EDU_YEAR') {
      const year = text.match(/\b(20\d\d)\b/) ? text.match(/\b(20\d\d)\b/)[1] : text.trim();
      return {
        intent: 'EDUCATION_CONVERSATION_COMPLETE',
        entities: {
          degree: stepData.degree,
          institution: stepData.institution,
          endDate: year,
          startDate: String(parseInt(year, 10) - 3 || '2024'),
          grade: 'CGPA: In Progress'
        }
      };
    }

    // Fallback if step is unrecognized
    return {
      intent: 'UNKNOWN',
      originalText: text
    };
  }

  /* ==========================================================================
     Helper Entity Extractors
     ========================================================================== */
  isMatch(text, phrases) {
    const clean = text.replace(/[?!.,;: ]+$/g, '').trim();
    return phrases.some(p => clean === p || clean.startsWith(p + ' ') || clean.endsWith(' ' + p) || clean.includes(' ' + p + ' '));
  }

  extractTemplate(lower) {
    if (lower.includes('professional template') || lower.includes('use professional') || lower.includes('use the professional')) {
      return 'executive';
    }

    if (lower.includes('template')) {
      for (const t of this.templates) {
        if (lower.includes(t)) return t;
      }
    }
    // direct phrases like "use modern", "use ats"
    for (const t of this.templates) {
      if (lower.includes(`use the ${t}`) || lower.includes(`use ${t}`) || lower.includes(`switch to ${t}`)) {
        return t;
      }
    }
    return null;
  }

  extractNavigation(lower) {
    if (lower === 'open builder' || lower === 'go to builder') {
      return {
        intent: 'OPEN_SECTION',
        entities: { sectionKey: 'personal', sectionName: 'Builder' }
      };
    }

    if (lower === 'show templates' || lower === 'change my template' || lower === 'change template') {
      return {
        intent: 'OPEN_SECTION',
        entities: { sectionKey: 'customizer', sectionName: 'Templates & Styling' }
      };
    }

    // "Open ..." or "Go to ..."
    for (const sec of this.sections) {
      for (const alias of sec.aliases) {
        if (
          lower === `open ${alias}` ||
          lower.startsWith(`open ${alias}`) ||
          lower.startsWith(`open my ${alias}`) ||
          lower === `go to ${alias}` ||
          lower.startsWith(`go to ${alias}`) ||
          lower.startsWith(`go to my ${alias}`) ||
          lower === `show ${alias}` ||
          lower.startsWith(`show ${alias}`) ||
          lower.startsWith(`navigate to ${alias}`)
        ) {
          return {
            intent: 'OPEN_SECTION',
            entities: { sectionKey: sec.key, sectionName: alias }
          };
        }
      }
    }

    if (lower.includes('go back') || lower.includes('back to editor')) {
      return { intent: 'OPEN_SECTION', entities: { sectionKey: 'personal', sectionName: 'Personal Info' } };
    }

    return null;
  }

  extractAIImprovement(lower, originalText) {
    // Tone or section check
    const isImprove = lower.includes('improve') || lower.includes('make my') || lower.includes('make this') || lower.includes('shorten') || lower.includes('rewrite') || lower.includes('polish');
    if (!isImprove) return null;

    let targetType = 'summary';
    let tone = 'impactful';

    if (lower.includes('project')) targetType = 'project';
    if (lower.includes('experience') || lower.includes('internship')) targetType = 'experience';
    if (lower.includes('summary') || lower.includes('bio') || lower.includes('about me')) targetType = 'summary';

    if (lower.includes('ats friendly') || lower.includes('ats')) tone = 'ats';
    if (lower.includes('shorten') || lower.includes('concise') || lower.includes('brief')) tone = 'concise';
    if (lower.includes('professional') || lower.includes('impactful') || lower.includes('stronger')) tone = 'impactful';

    return {
      intent: 'IMPROVE_CONTENT',
      originalText,
      entities: { targetType, tone }
    };
  }

  extractReadInfo(lower) {
    if (lower.startsWith('read my ') || lower.startsWith('read ') || lower.startsWith('tell me my ')) {
      let target = 'summary';
      if (lower.includes('skill')) target = 'skills';
      else if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') || lower.includes('name')) target = 'personal';
      else if (lower.includes('education') || lower.includes('college')) target = 'education';
      else if (lower.includes('project')) target = 'projects';
      return {
        intent: 'READ_RESUME_INFO',
        entities: { target }
      };
    }
    return null;
  }

  extractSkillToRemove(text) {
    const l = text.toLowerCase();
    if (l.includes('project') || l.includes('certification') || l.includes('certificate') || l.includes('education') || l.includes('experience') || l.includes('resume')) {
      return null;
    }
    // "Remove C from my skills", "Delete Python from skills", "Remove Java"
    let clean = text.replace(/^(remove|delete)\s+/i, '');
    clean = clean.replace(/\s+(from|in)\s+(my\s+)?skills(\s+section)?/i, '').trim();
    return clean || null;
  }

  extractSkillsToAdd(text, lower) {
    // Matches "Add Python to my skills", "Add Python, Java and SQL", "Include React, Node.js"
    const addPatterns = [
      /^(?:please\s+)?add\s+(.+?)(?:\s+to\s+(?:my\s+)?skills(?:\s+section)?)?$/i,
      /^(?:please\s+)?include\s+(.+?)(?:\s+(?:in|to)\s+(?:my\s+)?skills(?:\s+section)?)?$/i
    ];

    let candidate = null;
    for (const pat of addPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        // Exclude commands for project/education/certification
        const m = match[1].toLowerCase();
        if (m.includes('project') || m.includes('education') || m.includes('college') || m.includes('internship') || m.includes('experience') || m.includes('certification') || m.includes('achievement') || m.includes('award')) {
          return null;
        }
        candidate = match[1];
        break;
      }
    }

    if (!candidate) return null;

    // Strip trailing "to my skills", "in my skills"
    candidate = candidate.replace(/\s+(to|in)\s+(my\s+)?skills(\s+section)?$/i, '').trim();

    // Split on commas, "and", "&"
    const rawTokens = candidate
      .split(/,\s*|\s+and\s+|\s+&\s+/i)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !['to', 'my', 'skills', 'skill'].includes(s.toLowerCase()));

    return rawTokens.length > 0 ? rawTokens : null;
  }

  extractProjectIntent(text, lower) {
    if (lower === 'add a project' || lower === 'add project' || lower === 'create a project') {
      return {
        intent: 'START_ADD_PROJECT',
        originalText: text,
        question: 'Sure! What is the project name?'
      };
    }

    if (lower === 'show my projects' || lower === 'show projects' || lower === 'my projects' || lower === 'list my projects') {
      return {
        intent: 'OPEN_SECTION',
        entities: { sectionKey: 'projects', sectionName: 'Projects' }
      };
    }

    // "Remove my Student Management System project"
    const remProjMatch = text.match(/^(?:please\s+)?(?:remove|delete)\s+(?:my\s+)?(.+?)\s+project$/i);
    if (remProjMatch && remProjMatch[1]) {
      return {
        intent: 'REMOVE_PROJECT',
        originalText: text,
        entities: { title: remProjMatch[1].trim() }
      };
    }

    // "Add a project called AI Resume Builder" / "Add project named ..."
    const calledMatch = text.match(/^(?:please\s+)?add\s+(?:a\s+)?project\s+(?:called|named)\s+(.+)$/i);
    if (calledMatch && calledMatch[1]) {
      const title = calledMatch[1].trim();
      return {
        intent: 'PROJECT_NAME_PROVIDED',
        originalText: text,
        entities: { title },
        question: `Sure. What technologies did you use for "${title}"?`
      };
    }

    // "Add my Student Data Analytics project"
    // "Add my car driving game project"
    const addProjMatch = text.match(/^(?:please\s+)?add\s+(?:my\s+)?(.+?)\s+project$/i);
    if (addProjMatch && addProjMatch[1]) {
      const title = addProjMatch[1].trim();
      return {
        intent: 'PROJECT_NAME_PROVIDED',
        originalText: text,
        entities: { title },
        question: `Added "${title}". What technologies did you use for this project?`
      };
    }

    // "The technology used is Python, Pandas and Machine Learning"
    if (lower.startsWith('the technology used is ') || lower.startsWith('technologies are ') || lower.startsWith('technology is ')) {
      const tech = text.replace(/^(the\s+)?technolog(y|ies)\s+(used\s+)?(is|are)\s+/i, '').trim();
      return {
        intent: 'UPDATE_PROJECT_TECH',
        originalText: text,
        entities: { techStack: tech }
      };
    }

    // "My project is Student Data Analytics"
    if (lower.startsWith('my project is ') || lower.startsWith('the project is ')) {
      const title = text.replace(/^(my|the)\s+project\s+is\s+/i, '').trim();
      return {
        intent: 'PROJECT_NAME_PROVIDED',
        originalText: text,
        entities: { title },
        question: `Got it! What technologies did you use for "${title}"?`
      };
    }

    return null;
  }

  extractEducationIntent(text, lower) {
    if (lower === 'add education' || lower === 'add my education') {
      return {
        intent: 'START_ADD_EDUCATION',
        originalText: text,
        question: 'What degree or qualification are you adding (e.g. Bachelor of Computer Applications)?'
      };
    }

    // "Add BCA to my education"
    const addToEduMatch = text.match(/^(?:please\s+)?add\s+(.+?)\s+to\s+(?:my\s+)?education$/i);
    if (addToEduMatch && addToEduMatch[1]) {
      const degree = addToEduMatch[1].trim();
      return {
        intent: 'EDUCATION_DEGREE_PROVIDED',
        originalText: text,
        entities: { degree },
        question: `Added degree "${degree}". What is your college or university name?`
      };
    }

    // "I am studying BCA"
    const studyingMatch = text.match(/^(?:i\s+am|i'?m)\s+studying\s+(.+)$/i);
    if (studyingMatch && studyingMatch[1]) {
      const degree = studyingMatch[1].trim();
      return {
        intent: 'EDUCATION_DEGREE_PROVIDED',
        originalText: text,
        entities: { degree },
        question: `Noted "${degree}". What college or university are you attending?`
      };
    }

    // "Add my BCA education" / "Add Bachelor of Science"
    const degreeMatch = text.match(/^(?:please\s+)?add\s+(?:my\s+)?(.+?)\s+education$/i);
    if (degreeMatch && degreeMatch[1]) {
      const degree = degreeMatch[1].trim();
      return {
        intent: 'EDUCATION_DEGREE_PROVIDED',
        originalText: text,
        entities: { degree },
        question: `Added degree "${degree}". What is your college or university name?`
      };
    }

    // "Set my college to Vidyavahini..." / "My college is..."
    if (
      lower.startsWith('set my college to ') ||
      lower.startsWith('set my university to ') ||
      lower.startsWith('my college is ') ||
      lower.startsWith('my university is ') ||
      lower.startsWith('my school is ')
    ) {
      const inst = text.replace(/^(?:set\s+my|my)\s+(college|university|school|institution)\s+(?:to|is)\s+/i, '').trim();
      return {
        intent: 'UPDATE_EDUCATION_INSTITUTION',
        originalText: text,
        entities: { institution: inst }
      };
    }

    // "Set my CGPA to 8.2" / "My CGPA is 8.2" / "My GPA is 3.8"
    const cgpaMatch = text.match(/(?:(?:set\s+my|my)\s+)?(?:cgpa|gpa|percentage)\s+(?:to|is)\s+([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*[0-9]+)?)/i);
    if (cgpaMatch && cgpaMatch[1]) {
      return {
        intent: 'UPDATE_EDUCATION_GRADE',
        originalText: text,
        entities: { grade: `CGPA: ${cgpaMatch[1]}` }
      };
    }

    // "I'm graduating in 2028" / "Graduation year is 2028"
    const gradMatch = text.match(/(?:graduating\s+in|graduation\s+year\s+is)\s+(20\d\d)/i);
    if (gradMatch && gradMatch[1]) {
      return {
        intent: 'UPDATE_EDUCATION_YEAR',
        originalText: text,
        entities: { endDate: gradMatch[1] }
      };
    }

    return null;
  }

  extractExperienceIntent(text, lower) {
    if (lower === 'add my internship' || lower === 'add my internship experience' || lower === 'add experience' || lower === 'add work experience') {
      return {
        intent: 'START_ADD_EXPERIENCE',
        originalText: text,
        question: 'What is your job role and the company name (e.g. Software Engineering Intern at Tech Corp)?'
      };
    }

    if (lower === 'update my experience' || lower === 'edit my experience') {
      return {
        intent: 'OPEN_SECTION',
        entities: { sectionKey: 'experience', sectionName: 'Experience' }
      };
    }

    // "Add two years of Python experience" / "Add 2 years of React experience"
    const yrsMatch = text.match(/^(?:please\s+)?add\s+(.+?\s+experience)$/i);
    if (yrsMatch && yrsMatch[1]) {
      return {
        intent: 'EXPERIENCE_DETAILS_PROVIDED',
        originalText: text,
        entities: { role: yrsMatch[1].trim() }
      };
    }

    if (lower.startsWith('add experience as ') || lower.startsWith('add internship at ')) {
      const details = text.replace(/^add\s+(experience\s+as|internship\s+at)\s+/i, '').trim();
      return {
        intent: 'EXPERIENCE_DETAILS_PROVIDED',
        originalText: text,
        entities: { role: details }
      };
    }

    return null;
  }

  extractCertIntent(text, lower) {
    if (lower === 'show my certifications' || lower === 'show certifications') {
      return { intent: 'OPEN_SECTION', entities: { sectionKey: 'certifications', sectionName: 'Certifications' } };
    }

    if (lower.startsWith('remove ') && lower.includes('certification')) {
      const title = text.replace(/^remove\s+(my\s+)?/i, '').replace(/\s+certification$/i, '').trim();
      return { intent: 'REMOVE_CERTIFICATION', originalText: text, entities: { title } };
    }

    // "Add a certification called Data Analytics"
    const certCalledMatch = text.match(/^(?:please\s+)?add\s+(?:a\s+)?certification\s+(?:called|named)\s+(.+)$/i);
    if (certCalledMatch && certCalledMatch[1]) {
      return {
        intent: 'ADD_CERTIFICATION',
        originalText: text,
        entities: { title: certCalledMatch[1].trim() }
      };
    }

    const certMatch = text.match(/^(?:please\s+)?add\s+(?:my\s+)?(.+?)\s+certification$/i);
    if (certMatch && certMatch[1]) {
      return {
        intent: 'ADD_CERTIFICATION',
        originalText: text,
        entities: { title: certMatch[1].trim() }
      };
    }

    return null;
  }

  extractAchievementIntent(text, lower) {
    if (lower === 'show my achievements' || lower === 'show achievements') {
      return { intent: 'OPEN_SECTION', entities: { sectionKey: 'achievements', sectionName: 'Achievements' } };
    }

    const achMatch = text.match(/^(?:please\s+)?add\s+(?:my\s+|this\s+)?(.+?)\s+(?:achievement|award|honor)$/i);
    if (achMatch && achMatch[1]) {
      return {
        intent: 'ADD_ACHIEVEMENT',
        originalText: text,
        entities: { title: achMatch[1].trim() }
      };
    }

    if (lower.startsWith('add this achievement to my resume') || lower.startsWith('add achievement ')) {
      const title = text.replace(/^(add\s+this\s+achievement\s+to\s+my\s+resume|add\s+achievement)\s*/i, '').trim();
      return {
        intent: 'ADD_ACHIEVEMENT',
        originalText: text,
        entities: { title: title || 'Honors Recognition' }
      };
    }

    return null;
  }

  extractPersonalInfo(text, lower) {
    const updates = {};

    // 1. Full Name: "My name is Devika KS", "Set my name to Devika KS", "I am Devika KS"
    const nameMatch = text.match(/(?:my\s+name\s+is|set\s+my\s+name\s+to|change\s+my\s+name\s+to|i\s+am|this\s+is)\s+([A-Za-z\s.'-]+?)(?:\s+(?:and|\.|\,|$)|$)/i);
    if (nameMatch && nameMatch[1]) {
      const candidateName = nameMatch[1].trim();
      // Avoid false triggers like "I am a BCA student"
      if (!candidateName.toLowerCase().startsWith('a ') && !candidateName.toLowerCase().startsWith('an ') && candidateName.length > 2) {
        updates.fullName = candidateName;
      }
    }

    // 2. Professional / Student Title: "I'm a BCA student", "I am a BCA student", "My job title is Software Engineer"
    const titleMatch = text.match(/(?:(?:i'?m|i\s+am)\s+(?:a|an)\s+|my\s+(?:job\s+|professional\s+)?title\s+is\s+)(.+?)(?:\s+(?:and|\.|\,|$)|$)/i);
    if (titleMatch && titleMatch[1]) {
      updates.jobTitle = titleMatch[1].trim();
    }

    // 3. Email: "My email is devika@gmail.com", "Set my email to ...", "Email is ..."
    const emailMatch = text.match(/(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      updates.email = emailMatch[0];
    }

    // 4. Phone: "My phone number is 9876543210", "Phone is ..."
    const phoneMatch = text.match(/(?:phone(?:\s+number)?\s+(?:is|to)?\s*|\b)(\+?91[\s-]?)?([6-9]\d{4}[\s-]?\d{5}|\d{10})\b/);
    if (phoneMatch) {
      const digits = (phoneMatch[1] || '') + phoneMatch[2];
      updates.phone = digits.replace(/[^\d+]/g, '');
    }

    // 5. Location: "I'm from Tumkur", "Set my location to Tumkur", "Location is Tumkur", "I live in Tumkur"
    const locMatch = text.match(/(?:set\s+my\s+location\s+to|my\s+location\s+is|i'?m\s+from|i\s+live\s+in|location\s+is)\s+([A-Za-z\s,.-]+?)(?:\s+(?:and|\.|\,|$)|$)/i);
    if (locMatch && locMatch[1]) {
      updates.location = locMatch[1].trim();
    }

    return updates;
  }
}

// Export singleton
window.voiceCommandParser = new VoiceCommandParser();
