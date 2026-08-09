const VoiceModule = {
  recognition: null,

  init(onTextCaptured) {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.onresult = (e) => onTextCaptured(e.results[0][0].transcript);
    }
  },

  startMic() {
    if (this.recognition) this.recognition.start();
  },

  openLiveOverlay() {
    document.getElementById('liveVoiceOverlay').classList.remove('hidden');
  },

  closeLiveOverlay() {
    document.getElementById('liveVoiceOverlay').classList.add('hidden');
  }
};

