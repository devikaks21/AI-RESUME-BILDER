/**
 * ResumeAI — State Management & LocalStorage Persistence
 * Built for ALL students, freshers, job seekers, and graduates across all disciplines.
 * Supports Categorized Skills:
 * - Programming
 * - Web Development
 * - Data Analytics
 * - AI / ML
 * - Custom User-Created Categories
 */

const STORAGE_KEY = 'resumeai_app_state_v4';

// Universal Student Profiles Catalog with Categorized Skills
const STUDENT_PRESETS = {
  cs: {
    id: 'preset-cs',
    name: 'Computer Science & Software Engineering Student',
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: 'Alex Morgan',
      jobTitle: 'Computer Science Student • Aspiring Software Engineer',
      email: 'alex.morgan@university.edu',
      phone: '+91 98765 43210',
      location: 'New York, NY',
      github: 'https://github.com/alexmorgan-dev',
      linkedin: 'https://linkedin.com/in/alexmorgan',
      portfolio: 'https://alexmorgan.dev'
    },
    summary: 'Dedicated Computer Science student with a strong passion for full-stack software development, distributed systems, and algorithmic problem-solving. Proficient in Python, Java, JavaScript, and modern web frameworks. Proven track record of architecting scalable collaborative projects, contributing to open-source software, and quickly adapting to emerging tech stacks.',
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Metropolitan State University',
        location: 'New York, NY',
        startDate: '2024',
        endDate: '2028',
        grade: 'GPA: 3.8 / 4.0'
      },
      {
        id: 'edu-2',
        degree: 'High School Diploma (Honors STEM)',
        institution: 'Central High School',
        location: 'New York, NY',
        startDate: '2020',
        endDate: '2024',
        grade: 'Graduated with Honors'
      }
    ],
    skillCategories: [
      {
        id: 'cat-cs-1',
        name: 'Programming',
        skills: ['Python', 'Java', 'C', 'C++', 'JavaScript (ES6+)', 'TypeScript']
      },
      {
        id: 'cat-cs-2',
        name: 'Web Development',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'REST APIs']
      },
      {
        id: 'cat-cs-3',
        name: 'Data Analytics & Databases',
        skills: ['SQL (PostgreSQL)', 'MongoDB', 'Redis', 'Pandas Basics']
      },
      {
        id: 'cat-cs-4',
        name: 'AI / ML & Systems',
        skills: ['Machine Learning', 'Data Structures & Algorithms', 'Git & GitHub', 'Docker']
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Collaborative Code & Whiteboard IDE',
        techStack: 'React, Node.js, WebSockets, Redis, Docker',
        link: 'https://github.com/alexmorgan-dev/collab-ide',
        description: 'Architected a real-time collaborative coding sandbox supporting concurrent editing, syntax highlighting, and virtual execution across 4+ languages with low-latency WebSocket communication.'
      },
      {
        id: 'proj-2',
        title: 'Campus Course Review & Schedule Planner',
        techStack: 'TypeScript, Next.js, PostgreSQL, TailwindCSS',
        link: 'https://github.com/alexmorgan-dev/campus-planner',
        description: 'Engineered a student schedule optimization platform serving 1,200+ active peers during registration. Implemented automated conflict detection and peer review aggregation.'
      }
    ],
    experience: [
      {
        id: 'exp-1',
        role: 'Software Engineering Teaching Assistant',
        company: 'Department of Computer Science',
        location: 'On Campus',
        startDate: 'Sep 2025',
        endDate: 'Present',
        description: 'Mentored 60+ undergraduate students in data structures and object-oriented programming. Conducted weekly lab sessions and automated assignment grading pipelines using Python.'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        date: '2025',
        credentialUrl: 'https://aws.amazon.com/verification'
      }
    ],
    achievements: [
      {
        id: 'ach-1',
        title: '1st Place — Annual University Hackathon',
        description: 'Spearheaded a 4-person team building an accessible audio navigation web app within 36 hours.'
      },
      {
        id: 'ach-2',
        title: "Dean's Honor List Scholar",
        description: 'Recognized for consecutive semesters of academic excellence in the STEM faculty.'
      }
    ],
    customization: {
      template: 'modern',
      font: 'Inter',
      fontSize: 'normal',
      spacing: 'normal',
      accentColor: '#7C5CFF'
    }
  },

  data: {
    id: 'preset-data',
    name: 'Data Science & Analytics Student',
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: 'Jordan Taylor',
      jobTitle: 'Data Science Student • Junior Business & Data Analyst',
      email: 'jordan.taylor@college.edu',
      phone: '+91 98450 12345',
      location: 'Chicago, IL',
      github: 'https://github.com/jordantaylor-data',
      linkedin: 'https://linkedin.com/in/jordantaylor',
      portfolio: 'https://jordantaylor-analytics.io'
    },
    summary: 'Analytical and results-oriented Data Science undergraduate skilled in statistical analysis, Python data manipulation, SQL query optimization, and interactive dashboard creation. Passionate about transforming noisy unstructured data into actionable strategic insights.',
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Science in Data Analytics & Statistics',
        institution: 'Midwest State Institute of Technology',
        location: 'Chicago, IL',
        startDate: '2024',
        endDate: '2028',
        grade: 'GPA: 3.85 / 4.0'
      }
    ],
    skillCategories: [
      {
        id: 'cat-data-1',
        name: 'Programming',
        skills: ['Python', 'R', 'SQL (PostgreSQL, BigQuery)']
      },
      {
        id: 'cat-data-2',
        name: 'Data Analytics',
        skills: ['Pandas', 'NumPy', 'Power BI', 'Tableau', 'Advanced Excel (VBA)']
      },
      {
        id: 'cat-data-3',
        name: 'AI / ML',
        skills: ['Machine Learning', 'Scikit-learn', 'Matplotlib', 'Exploratory Data Analysis']
      },
      {
        id: 'cat-data-4',
        name: 'Web & Tools',
        skills: ['Streamlit', 'Git & GitHub', 'Jupyter Notebooks']
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Retail Customer Churn & Retention Analysis',
        techStack: 'Python, Pandas, Seaborn, Random Forest, Streamlit',
        link: 'https://github.com/jordantaylor-data/churn-analytics',
        description: 'Built a predictive customer retention pipeline analyzing 15,000+ consumer records. Achieved 84% model accuracy and deployed an interactive executive dashboard via Streamlit.'
      },
      {
        id: 'proj-2',
        title: 'Healthcare Patient Admission Forecasting',
        techStack: 'SQL, Python, Statsmodels, Power BI',
        link: 'https://github.com/jordantaylor-data/health-forecast',
        description: 'Designed a time-series forecasting model estimating weekly hospital bed utilization rates, reducing scheduling variance through automated data extraction.'
      }
    ],
    experience: [
      {
        id: 'exp-1',
        role: 'Data Analytics Intern',
        company: 'Apex Insights Consulting',
        location: 'Hybrid',
        startDate: 'May 2025',
        endDate: 'Aug 2025',
        description: 'Cleaned and synthesized quarterly marketing datasets using Python and SQL. Built 5 automated Tableau dashboards saving 10+ weekly reporting hours for the client strategy team.'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        title: 'Google Advanced Data Analytics Professional Certificate',
        issuer: 'Google Career Certificates',
        date: '2025',
        credentialUrl: 'https://coursera.org/verify/google-data'
      }
    ],
    achievements: [
      {
        id: 'ach-1',
        title: 'Finalist — National Collegiate Data Challenge',
        description: 'Analyzed urban transit mobility patterns and presented findings to municipal planning judges.'
      }
    ],
    customization: {
      template: 'modern',
      font: 'Plus Jakarta Sans',
      fontSize: 'normal',
      spacing: 'normal',
      accentColor: '#00D4FF'
    }
  },

  it: {
    id: 'preset-it',
    name: 'Information Technology & Applications Student (BCA/IT)',
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: 'Rohan Sharma',
      jobTitle: 'BCA Student • Web & Cloud Technologies Enthusiast',
      email: 'rohan.sharma@university.ac.in',
      phone: '+91 98123 45678',
      location: 'Bangalore, India',
      github: 'https://github.com/rohan-tech',
      linkedin: 'https://linkedin.com/in/rohan-sharma',
      portfolio: 'https://rohansharma.dev'
    },
    summary: 'Dedicated Bachelor of Computer Applications (BCA) student with hands-on experience in full-stack web development, relational database architecture, and network fundamentals. Passionate about developing modern software tools and cloud-native applications with a focus on clean, maintainable code.',
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Computer Applications (BCA)',
        institution: 'National Institute of Information Technology & Sciences',
        location: 'Bangalore, India',
        startDate: '2025',
        endDate: '2028',
        grade: 'CGPA: 8.6 / 10.0'
      }
    ],
    skillCategories: [
      {
        id: 'cat-it-1',
        name: 'Programming',
        skills: ['Python', 'Java', 'C', 'C++']
      },
      {
        id: 'cat-it-2',
        name: 'Web Development',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'PHP']
      },
      {
        id: 'cat-it-3',
        name: 'Data Analytics & Databases',
        skills: ['MySQL', 'PostgreSQL', 'Power BI Basics']
      },
      {
        id: 'cat-it-4',
        name: 'AI / ML & Networking',
        skills: ['Machine Learning Basics', 'Computer Networks', 'Cloud Fundamentals', 'Git']
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Automated Student Attendance & Grading Portal',
        techStack: 'React, Node.js, Express, MySQL',
        link: 'https://github.com/rohan-tech/attendance-system',
        description: 'Developed a comprehensive web management portal streamlining attendance records and grade tracking for university departments, reducing manual data entry errors by 90%.'
      },
      {
        id: 'proj-2',
        title: 'Campus E-Library & Digital Resource Repository',
        techStack: 'PHP, JavaScript, MySQL, Bootstrap',
        link: 'https://github.com/rohan-tech/e-library',
        description: 'Designed a searchable digital catalog managing 3,000+ technical publications and research papers with fine-grained access control.'
      }
    ],
    experience: [
      {
        id: 'exp-1',
        role: 'Web Development & IT Support Intern',
        company: 'Infowave Solutions',
        location: 'Bangalore, India',
        startDate: 'Jun 2026',
        endDate: 'Aug 2026',
        description: 'Developed responsive user interface components for client websites, resolved cross-browser compatibility issues, and optimized SQL database queries.'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        title: 'Oracle Certified Associate — Java SE Programmer',
        issuer: 'Oracle University',
        date: '2025',
        credentialUrl: 'https://oracle.com/verify'
      }
    ],
    achievements: [
      {
        id: 'ach-1',
        title: 'State Inter-Collegiate Coding Marathon Winner',
        description: 'Awarded 1st place in algorithmic speed coding competition across 40+ engineering colleges.'
      }
    ],
    customization: {
      template: 'classic',
      font: 'Inter',
      fontSize: 'normal',
      spacing: 'normal',
      accentColor: '#7C5CFF'
    }
  },

  business: {
    id: 'preset-business',
    name: 'Business & Management Student (BBA / Commerce)',
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: 'Emma Watson',
      jobTitle: 'Business Administration Student • Product & Operations Analyst',
      email: 'emma.watson@business.edu',
      phone: '+91 98901 23456',
      location: 'Boston, MA',
      github: '',
      linkedin: 'https://linkedin.com/in/emma-watson-biz',
      portfolio: 'https://emmawatson-portfolio.com'
    },
    summary: 'Motivated Business Administration undergraduate specializing in project management, strategic operations, and financial modeling. Strong communicator with demonstrated leadership in student associations and cross-functional team projects.',
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Business Administration (BBA) — Finance & Operations',
        institution: 'Boston Business College',
        location: 'Boston, MA',
        startDate: '2024',
        endDate: '2028',
        grade: 'GPA: 3.75 / 4.0'
      }
    ],
    skillCategories: [
      {
        id: 'cat-biz-1',
        name: 'Data Analytics & Finance',
        skills: ['Financial Modeling', 'Market Research', 'Google Analytics', 'SQL Basics']
      },
      {
        id: 'cat-biz-2',
        name: 'Management & Strategy',
        skills: ['Agile / Scrum', 'Project Planning', 'Client Communication']
      },
      {
        id: 'cat-biz-3',
        name: 'Productivity Software',
        skills: ['Advanced Excel (VLOOKUP, Pivot Tables)', 'PowerPoint Presentation', 'Power BI Basics']
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Startup Feasibility & Market Entry Strategy',
        techStack: 'Excel, Market Valuation Models, PowerPoint',
        link: '',
        description: 'Conducted comprehensive market sizing and competitor benchmarking for a sustainable consumer packaging startup, delivering an investor pitch deck adopted by university incubator.'
      }
    ],
    experience: [
      {
        id: 'exp-1',
        role: 'Operations & Strategy Intern',
        company: 'Beacon Strategic Partners',
        location: 'Boston, MA',
        startDate: 'Jun 2025',
        endDate: 'Aug 2025',
        description: 'Audited internal workflow bottlenecks across 3 departments, formulating recommendations that reduced operational reporting turnaround time by 25%.'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        title: 'Certified Associate in Project Management (CAPM)',
        issuer: 'Project Management Institute (PMI)',
        date: '2025',
        credentialUrl: 'https://pmi.org/verify'
      }
    ],
    achievements: [
      {
        id: 'ach-1',
        title: 'President — University Student Management Association',
        description: 'Led an executive committee of 12 peers organizing guest lectures and networking forums for 400+ attendees.'
      }
    ],
    customization: {
      template: 'minimal',
      font: 'Plus Jakarta Sans',
      fontSize: 'normal',
      spacing: 'normal',
      accentColor: '#10B981'
    }
  },

  blank: {
    id: 'preset-blank',
    name: 'Blank Resume (Start from Scratch)',
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      github: '',
      linkedin: '',
      portfolio: ''
    },
    summary: '',
    education: [],
    skillCategories: [
      { id: 'cat-blank-1', name: 'Programming', skills: [] },
      { id: 'cat-blank-2', name: 'Web Development', skills: [] },
      { id: 'cat-blank-3', name: 'Data Analytics', skills: [] },
      { id: 'cat-blank-4', name: 'AI / ML', skills: [] }
    ],
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
    customization: {
      template: 'modern',
      font: 'Inter',
      fontSize: 'normal',
      spacing: 'normal',
      accentColor: '#7C5CFF'
    }
  }
};

class ResumeState {
  constructor() {
    this.resumes = [];
    this.activeResumeId = null;
    this.currentResume = null;
    this.loadState();
  }

  ensureSkillCategories(resume) {
    if (!resume) return;
    if (!resume.skillCategories || !Array.isArray(resume.skillCategories) || resume.skillCategories.length === 0) {
      if (resume.skills && Array.isArray(resume.skills) && resume.skills.length > 0) {
        resume.skillCategories = [
          { id: 'cat-m-1', name: 'Programming', skills: ['Python', 'Java', 'C'] },
          { id: 'cat-m-2', name: 'Web Development', skills: ['HTML', 'CSS', 'JavaScript'] },
          { id: 'cat-m-3', name: 'Data Analytics', skills: ['Pandas', 'NumPy', 'Power BI'] },
          { id: 'cat-m-4', name: 'AI / ML', skills: ['Machine Learning', 'Scikit-learn'] }
        ];
      } else {
        resume.skillCategories = [
          { id: 'cat-1', name: 'Programming', skills: ['Python', 'Java', 'C'] },
          { id: 'cat-2', name: 'Web Development', skills: ['HTML', 'CSS', 'JavaScript'] },
          { id: 'cat-3', name: 'Data Analytics', skills: ['Pandas', 'NumPy', 'Power BI'] },
          { id: 'cat-4', name: 'AI / ML', skills: ['Machine Learning', 'Scikit-learn'] }
        ];
      }
    }
    // Also keep resume.skills in sync as flat array for backwards compatibility
    resume.skills = this.getAllSkills(resume);
  }

  getAllSkills(resume = this.currentResume) {
    if (!resume) return [];
    if (resume.skillCategories && Array.isArray(resume.skillCategories)) {
      const all = [];
      resume.skillCategories.forEach(c => {
        if (Array.isArray(c.skills)) all.push(...c.skills);
      });
      return all;
    }
    return resume.skills || [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.resumes = parsed.resumes || [];
        this.activeResumeId = parsed.activeResumeId || (this.resumes[0] ? this.resumes[0].id : null);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }

    // Default to universal Computer Science student preset if empty
    if (!this.resumes || this.resumes.length === 0) {
      const defaultCopy = JSON.parse(JSON.stringify(STUDENT_PRESETS.cs));
      this.resumes = [defaultCopy];
      this.activeResumeId = defaultCopy.id;
      this.saveState();
    }

    this.currentResume = this.resumes.find(r => r.id === this.activeResumeId) || this.resumes[0];
    this.ensureSkillCategories(this.currentResume);
    this.resumes.forEach(r => this.ensureSkillCategories(r));
  }

  saveState() {
    try {
      if (this.currentResume) {
        this.ensureSkillCategories(this.currentResume);
        this.currentResume.updatedAt = new Date().toISOString();
        const idx = this.resumes.findIndex(r => r.id === this.currentResume.id);
        if (idx !== -1) {
          this.resumes[idx] = this.currentResume;
        } else {
          this.resumes.push(this.currentResume);
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        resumes: this.resumes,
        activeResumeId: this.activeResumeId
      }));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  loadPreset(presetKey) {
    const template = STUDENT_PRESETS[presetKey] || STUDENT_PRESETS.cs;
    const newResume = JSON.parse(JSON.stringify(template));
    newResume.id = 'resume-' + Date.now();
    newResume.updatedAt = new Date().toISOString();
    this.ensureSkillCategories(newResume);
    this.resumes.unshift(newResume);
    this.activeResumeId = newResume.id;
    this.currentResume = newResume;
    this.saveState();
    return newResume;
  }

  createNewResume(name = 'New Student Resume') {
    const newResume = JSON.parse(JSON.stringify(STUDENT_PRESETS.blank));
    newResume.id = 'resume-' + Date.now();
    newResume.name = name;
    newResume.updatedAt = new Date().toISOString();
    this.ensureSkillCategories(newResume);
    this.resumes.unshift(newResume);
    this.activeResumeId = newResume.id;
    this.currentResume = newResume;
    this.saveState();
    return newResume;
  }

  duplicateResume(resumeId) {
    const target = this.resumes.find(r => r.id === resumeId);
    if (!target) return null;
    const duplicated = JSON.parse(JSON.stringify(target));
    duplicated.id = 'resume-' + Date.now();
    duplicated.name = `${target.name} (Copy)`;
    duplicated.updatedAt = new Date().toISOString();
    this.ensureSkillCategories(duplicated);
    this.resumes.unshift(duplicated);
    this.saveState();
    return duplicated;
  }

  deleteResume(resumeId) {
    if (this.resumes.length <= 1) {
      this.loadPreset('cs');
      return;
    }
    this.resumes = this.resumes.filter(r => r.id !== resumeId);
    if (this.activeResumeId === resumeId) {
      this.activeResumeId = this.resumes[0].id;
      this.currentResume = this.resumes[0];
    }
    this.ensureSkillCategories(this.currentResume);
    this.saveState();
  }

  setActiveResume(resumeId) {
    const target = this.resumes.find(r => r.id === resumeId);
    if (target) {
      this.activeResumeId = resumeId;
      this.currentResume = target;
      this.ensureSkillCategories(this.currentResume);
      this.saveState();
    }
  }

  resetToSample() {
    this.currentResume = JSON.parse(JSON.stringify(STUDENT_PRESETS.cs));
    this.currentResume.id = 'resume-' + Date.now();
    this.ensureSkillCategories(this.currentResume);
    const idx = this.resumes.findIndex(r => r.id === this.activeResumeId);
    if (idx !== -1) {
      this.resumes[idx] = this.currentResume;
    } else {
      this.resumes.push(this.currentResume);
    }
    this.saveState();
  }
}

// Export singleton
window.STUDENT_PRESETS = STUDENT_PRESETS;
window.resumeState = new ResumeState();
