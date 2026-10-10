/**
 * BRUVA Coffee - Ambient Soundscape Controller
 * Generates subtle, soothing harmonic cafe/steam ambient sound using Web Audio API.
 * Muted by default; activated only upon explicit user toggle.
 */

export function initAmbientAudio() {
  const toggleBtn = document.querySelector('.sound-toggle-btn');
  if (!toggleBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let masterGain = null;
  let oscillators = [];
  let noiseNode = null;

  function createAtmosphericSound() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Warm deep harmonic base tones (South Indian coffee house warmth: low pentatonic frequencies)
    const baseFreqs = [110, 164.81, 220, 329.63];
    oscillators = baseFreqs.map((freq, i) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      oscGain.gain.setValueAtTime(0.02 / (i + 1), audioCtx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      return osc;
    });

    // Soft pink noise filter (subtle soothing coffee steam / roast atmosphere)
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.05;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to make it warm and soft
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.012, audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    whiteNoise.start();

    noiseNode = whiteNoise;
  }

  function startSound() {
    if (!audioCtx) {
      createAtmosphericSound();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Fade in gently
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 1.2);

    isPlaying = true;
    toggleBtn.classList.add('playing');
    toggleBtn.setAttribute('aria-pressed', 'true');
    const label = toggleBtn.querySelector('.sound-label');
    if (label) label.textContent = 'SOUND ON';
  }

  function stopSound() {
    if (!audioCtx) return;

    // Fade out smoothly
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);

    setTimeout(() => {
      isPlaying = false;
      toggleBtn.classList.remove('playing');
      toggleBtn.setAttribute('aria-pressed', 'false');
      const label = toggleBtn.querySelector('.sound-label');
      if (label) label.textContent = 'SOUND OFF';
    }, 800);
  }

  toggleBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound();
    }
  });
}
