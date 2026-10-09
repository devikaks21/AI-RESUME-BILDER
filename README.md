# ResumeAI — Intelligent Resume Builder & AI Voice Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](#)
[![Tech: Vanilla JS & CSS](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-F7DF1E.svg)](#)
[![Web Speech API](https://img.shields.io/badge/Voice%20Assistant-Web%20Speech%20API-7C5CFF.svg)](#)

A modern, premium, fully responsive **AI Resume Builder** web application designed for college students, fresh graduates, developers, data analysts, and job seekers. Built with a sleek dark-first SaaS aesthetic, intelligent content suggestions, interactive live A4 preview, built-in ATS audit checker, and a hands-free **ResumeAI Voice Assistant**.

---

## 🌟 Key Features

### 🎨 1. Premium SaaS Interface
- **Dark-First Modern Design**: Deep charcoal/black backgrounds (`#07090D`), subtle purple/cyan neon gradients, refined borders, and glassmorphism cards.
- **Micro-Interactions**: Smooth hover effects, subtle glows, and responsive transitions.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile screens.

### 📄 2. Live Interactive A4 Resume Preview
- Real-time side-by-side rendering — edits appear on the A4 canvas instantaneously.
- Accurate print/page layout mimicking physical paper dimensions.
- Live section toggles (Show/Hide sections with one click).

### 👔 3. Professional ATS-Friendly Templates
Switch between multiple curated templates in real time:
- **Modern Tech**: High-contrast, clean layout tailored for software engineers and tech roles.
- **Minimalist**: Clean, distraction-free typography focused on clarity.
- **Classic Executive**: Elegant traditional layout with serif accents suitable for corporate & managerial applications.
- **Compact Engineering**: High-density format ideal for candidates with extensive technical experience.
- **Creative Portfolio**: Vibrant accent elements designed for designers, UI/UX, and marketing professionals.
- **Academic CV**: Multi-page structured format suited for research and academic profiles.

### 🏷️ 4. Categorized Skills System
- Group skills into distinct, custom categories (e.g., *Programming*, *Web Development*, *Data Analytics*, *AI / ML*, *Cloud & DevOps*).
- Add, edit, or remove skill tags dynamically.
- Clean tag layout without forcing arbitrary percentage/proficiency sliders.

### 🤖 5. Built-in AI Content Assistant
- **Bullet Point Rephraser**: Rewrites standard project and job descriptions into high-impact, action-verb-driven statements.
- **Metric Booster**: Suggests quantifiable outcomes (e.g., *“improved latency by 35%”*).
- **Summary Generator**: Crafts role-specific professional summaries based on your profile details.

### 📊 6. Real-Time ATS Completeness & Score Checker
- Dynamic 0–100% resume score calculation.
- Live checklist tracking missing sections (Contact info, Summary, Skills, Projects, Experience).
- Actionable suggestions to improve ATS readability before sending applications.

### 🎙️ 7. ResumeAI Voice Assistant
An integrated floating voice assistant with speech recognition and synthesis:
- **Hands-Free Editing**: Speak natural commands to populate forms, add skills, or add projects.
- **Voice Navigation**: Jump between sections (*"Go to skills"*, *"Open projects"*).
- **Voice Actions**: Switch templates, preview resume, audit ATS score, or trigger PDF download.
- **Audio Feedback**: Text-to-speech confirmation reads back actions and summary details.

### 💾 8. Client-Side Persistence & PDF Export
- Auto-saves all changes in browser `localStorage`.
- Multiple resume versions management (Create, duplicate, switch, delete).
- Native vector PDF export with specialized print stylesheets (`@media print`).

---

## 🎙️ Voice Assistant Commands

Click the microphone button at the bottom-right or press the shortcut to start voice control:

| Category | Example Voice Commands |
|---|---|
| **Personal Info** | *"My name is Jane Doe"*<br>*"My email is jane@example.com"*<br>*"My phone number is +91 98765 43210"*<br>*"My title is Full Stack Developer"* |
| **Skills** | *"Add skill Python to Programming"*<br>*"Add skill React to Web Development"*<br>*"Add skill Pandas to Data Analytics"*<br>*"Remove skill C++"* |
| **Experience** | *"Add experience Software Engineer at Google"*<br>*"Add experience Frontend Intern at Startup"* |
| **Education** | *"Add education Bachelor of Technology at Delhi University"* |
| **Projects** | *"Add project ResumeAI using JavaScript and CSS"* |
| **Navigation** | *"Go to skills"*<br>*"Open education section"*<br>*"Show projects"*<br>*"Go to personal info"* |
| **Templates** | *"Change template to Modern Tech"*<br>*"Switch to Minimalist template"*<br>*"Use Executive template"* |
| **Actions** | *"Check my resume"* (Runs ATS audit)<br>*"Download resume"* (Triggers PDF export)<br>*"Read my summary aloud"*<br>*"Clear resume"* |

---

## 📁 Project Structure

```text
AI RESUME BUILDER/
│
├── index.html               # Main application markup & landing view
├── README.md                # Project documentation
│
├── css/
│   ├── main.css             # Design system tokens, typography, CSS reset
│   ├── landing.css          # Landing hero, features, and pricing sections
│   ├── builder.css          # Form editor, multi-step inputs, skill tags
│   ├── preview.css          # Live A4 resume templates styling
│   ├── voice-assistant.css  # Voice widget, modal drawer, audio animations
│   └── print.css            # PDF export & media print layout rules
│
└── js/
    ├── app.js               # Application coordinator & event delegation
    ├── state.js             # Central resume state manager & localStorage
    ├── live-preview.js      # Template rendering engine (A4 canvas)
    ├── ai-assistant.js      # AI bullet polisher & smart suggestion engine
    ├── checker.js           # ATS score calculation & completeness auditor
    ├── speech.js            # Web Speech API recognition & synthesis wrapper
    ├── voiceCommands.js     # Natural language intent parser (49+ commands)
    ├── voiceAssistant.js    # Voice assistant UI & state orchestrator
    └── export-pdf.js        # High-definition vector PDF export
```

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser with ECMAScript 6+ support:
  - Google Chrome (Recommended for Web Speech API)
  - Microsoft Edge
  - Mozilla Firefox
  - Apple Safari

### Running Locally

1. Clone or download the repository to your computer:
   ```bash
   git clone https://github.com/yourusername/ai-resume-builder.git
   cd ai-resume-builder
   ```

2. Start a local HTTP server:
   - **Using Python 3:**
     ```bash
     python -m http.server 8080
     ```
   - **Using Node.js:**
     ```bash
     npx serve -l 8080
     ```

3. Open your browser and navigate to:
   ```text
   http://localhost:8080
   ```

---

## 📱 Running on Mobile Devices

Because mobile browsers (iOS Safari, Chrome for Android) enforce strict security for microphone access, opening the web app on your phone requires an **HTTPS** connection:

### Option A: Cloudflare Tunnel (Quickest, Zero Config)
Run a free instant tunnel:
```bash
cloudflared.exe tunnel --url http://localhost:8080
```
Open the generated `https://xxxx.trycloudflare.com` link on your phone.

### Option B: Local Wi-Fi (Form & Preview Only)
1. Ensure your PC and phone are connected to the same Wi-Fi.
2. Find your PC's local IP address (`ipconfig` on Windows or `ifconfig` on macOS/Linux).
3. Open `http://<YOUR_LOCAL_IP>:8080` in your phone's browser.

---

## 🛡️ Privacy & Data Ownership

- **100% Client-Side**: All resume data, drafts, and edits remain strictly within your browser's `localStorage`.
- **Zero Third-Party Tracking**: No user tracking, no backend database collection, and no forced logins.
- **Export Freedom**: Download your raw data or export clean vector PDFs at any time.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal, educational, and commercial use.
