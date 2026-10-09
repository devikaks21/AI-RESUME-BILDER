/**
 * ResumeAI — PDF Export & Data Backup Utility
 * Generates print-ready A4 PDF documents and handles JSON import/export
 */

class ResumeExporter {
  constructor() {
    this.isExporting = false;
  }

  async exportPDF() {
    if (this.isExporting) return;
    this.isExporting = true;

    const paper = document.getElementById('resumePreviewPaper');
    if (!paper) {
      this.isExporting = false;
      return;
    }

    if (window.showToast) {
      window.showToast('Preparing your high-resolution PDF...', 'info');
    }

    const currentResume = window.resumeState.currentResume;
    const cleanName = ((currentResume.personal && currentResume.personal.fullName) || 'Resume')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${cleanName}_Resume.pdf`;

    // Check if html2pdf is available via window.html2pdf
    if (typeof window.html2pdf === 'function') {
      try {
        // Temporarily reset any scaling transform
        const prevTransform = paper.style.transform;
        paper.style.transform = 'none';

        const opt = {
          margin: [8, 8, 8, 8],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await window.html2pdf().set(opt).from(paper).save();

        paper.style.transform = prevTransform;
        if (window.showToast) {
          window.showToast('PDF downloaded successfully!', 'success');
        }
      } catch (err) {
        console.error('html2pdf generation error, falling back to print dialog:', err);
        window.print();
      }
    } else {
      // Direct high-fidelity browser print fallback
      window.print();
    }

    this.isExporting = false;
  }

  exportJSON() {
    const data = window.resumeState.currentResume;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.name || 'resume').replace(/[^a-zA-Z0-9]/g, '_')}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast('Resume JSON data exported!', 'success');
    }
  }

  importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && parsed.personal) {
          parsed.id = 'resume-' + Date.now();
          parsed.updatedAt = new Date().toISOString();
          window.resumeState.resumes.unshift(parsed);
          window.resumeState.activeResumeId = parsed.id;
          window.resumeState.currentResume = parsed;
          window.resumeState.saveState();

          if (window.appController) {
            window.appController.populateFormFields();
          }
          if (window.livePreviewEngine) {
            window.livePreviewEngine.render();
          }
          if (window.resumeChecker) {
            window.resumeChecker.updateScore();
          }
          if (window.showToast) {
            window.showToast('Resume imported successfully!', 'success');
          }
        } else {
          alert('Invalid resume file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  }
}

// Export singleton
window.resumeExporter = new ResumeExporter();
