/**
 * Web Audio API Acoustic Feedback
 * Classical subtle tactile clicks and harmonic chimes (No external sound files required)
 */

class ClassicalAcoustics {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.init();
  }

  init() {
    const toggleBtn = document.getElementById('sound-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      this.enabled = !this.enabled;
      toggleBtn.innerHTML = this.enabled 
        ? '<i class="fa-solid fa-volume-high"></i>' 
        : '<i class="fa-solid fa-volume-xmark"></i>';
      toggleBtn.title = this.enabled ? 'Mute Tactile Acoustics' : 'Enable Tactile Acoustics';
      
      if (this.enabled) {
        this.playChime(587.33); // D5
      }
    });
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Subtle mechanical tick for buttons / switches
  playTick(pitch = 800) {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio not permitted without interaction
    }
  }

  // Classical glass harmonic chime for milestones / reveals
  playChime(frequency = 523.25) { // C5
    if (!this.enabled) return;
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio fallback
    }
  }
}

// Global instance
window.classicalAudio = new ClassicalAcoustics();
