/**
 * ResumeAI — Speech Service (Speech-To-Text & Text-To-Speech)
 * Reusable, privacy-friendly Web Speech API wrapper with robust feature detection,
 * error handling, and multi-language readiness.
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.voiceResponsesEnabled = true;
    this.currentLanguage = 'en-US';
    this.supportedLanguages = [
      { code: 'en-US', name: 'English (US / India)', supported: true },
      { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ - Coming Soon)', supported: false },
      { code: 'hi-IN', name: 'Hindi (हिन्दी - Coming Soon)', supported: false }
    ];

    // Detect browser capabilities
    this.SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    this.hasSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Load saved voice response preference
    try {
      const savedPref = localStorage.getItem('resumeai_voice_responses_enabled');
      if (savedPref !== null) {
        this.voiceResponsesEnabled = savedPref === 'true';
      }
    } catch (e) {
      // localStorage may be disabled
    }
  }

  isRecognitionSupported() {
    return Boolean(this.SpeechRecognitionAPI);
  }

  isSynthesisSupported() {
    return Boolean(this.hasSynthesis);
  }

  getLanguageList() {
    return this.supportedLanguages;
  }

  setLanguage(langCode) {
    const lang = this.supportedLanguages.find(l => l.code === langCode);
    if (!lang) {
      return { success: false, message: 'Language not found.' };
    }
    if (!lang.supported) {
      return {
        success: false,
        message: `${lang.name} voice model is currently in development. English is active.`
      };
    }
    this.currentLanguage = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
    return { success: true, message: `Switched language to ${lang.name}.` };
  }

  toggleVoiceResponses(enable) {
    this.voiceResponsesEnabled = enable;
    try {
      localStorage.setItem('resumeai_voice_responses_enabled', String(enable));
    } catch (e) {}
    if (!enable) {
      this.stopSpeaking();
    }
    return this.voiceResponsesEnabled;
  }

  /* ==========================================================================
     Speech Recognition (Speech-To-Text)
     ========================================================================== */
  startListening({ onInterim, onFinal, onError, onStart, onEnd } = {}) {
    if (!this.isRecognitionSupported()) {
      if (typeof onError === 'function') {
        onError({
          type: 'unsupported',
          message: 'Voice recognition is not supported in this browser. You can continue using keyboard input.'
        });
      }
      return false;
    }

    // If already active, stop before restarting
    if (this.isListening) {
      this.stopListening();
    }

    // Stop assistant speaking before listening to avoid echo
    this.stopSpeaking();

    try {
      this.recognition = new this.SpeechRecognitionAPI();
      this.recognition.lang = this.currentLanguage;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.continuous = false; // Only record single phrase per interaction (privacy first)

      let finalTranscript = '';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (typeof onStart === 'function') onStart();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (interimTranscript && typeof onInterim === 'function') {
          onInterim(interimTranscript);
        }

        if (finalTranscript && typeof onFinal === 'function') {
          onFinal(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        let friendlyMessage = 'Sorry, I could not understand that. Please try again.';

        if (event.error === 'not-allowed') {
          friendlyMessage = 'Microphone permission was denied. You can continue using keyboard input.';
        } else if (event.error === 'no-speech') {
          friendlyMessage = "I didn't hear anything. Click the microphone and speak again.";
        } else if (event.error === 'network') {
          friendlyMessage = 'Network error while contacting speech recognition service.';
        } else if (event.error === 'aborted') {
          return; // User clicked stop deliberately
        }

        if (typeof onError === 'function') {
          onError({ type: event.error, message: friendlyMessage });
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (typeof onEnd === 'function') onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('SpeechRecognition start failed:', err);
      this.isListening = false;
      if (typeof onError === 'function') {
        onError({
          type: 'start_failed',
          message: 'Unable to start microphone recording. Please verify browser permissions.'
        });
      }
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  /* ==========================================================================
     Speech Synthesis (Text-To-Speech)
     ========================================================================== */
  speak(text, { onStart, onEnd } = {}) {
    if (!this.voiceResponsesEnabled || !this.hasSynthesis) {
      return false;
    }

    if (!text || typeof text !== 'string') return false;

    // Strip emojis or extra punctuation for smoother speech
    const cleanText = text
      .replace(/[✦🤖🎙️🎤⚡🚀💼📜🏆📊🎯📁👁️✓✕⚠️]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = this.currentLanguage;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferredVoice = voices.find(v => 
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) &&
          v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (typeof onStart === 'function') onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (typeof onEnd === 'function') onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        if (typeof onEnd === 'function') onEnd();
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Speech synthesis speak failed:', e);
      this.isSpeaking = false;
      return false;
    }
  }

  stopSpeaking() {
    if (this.hasSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
  }
}

// Export singleton
window.speechService = new SpeechService();
