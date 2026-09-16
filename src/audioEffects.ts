// Cinematic Web Audio sound design for "Absolute Cinema" experiences

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Solid Ash/Maple Wood Bat Crack (Sharp high-energy transient with stadium reverb)
 */
export function playBatCrackSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 1. Initial sharp wood snap
  const snapOsc = ctx.createOscillator();
  const snapGain = ctx.createGain();
  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime(1100, now);
  snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
  snapGain.gain.setValueAtTime(0.9, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  snapOsc.connect(snapGain);
  snapGain.connect(ctx.destination);
  snapOsc.start(now);
  snapOsc.stop(now + 0.06);

  // 2. Heavy core impact thud (bat body vibration)
  const thudOsc = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thudOsc.type = 'sine';
  thudOsc.frequency.setValueAtTime(260, now);
  thudOsc.frequency.exponentialRampToValueAtTime(55, now + 0.12);
  thudGain.gain.setValueAtTime(1.0, now);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  thudOsc.connect(thudGain);
  thudGain.connect(ctx.destination);
  thudOsc.start(now);
  thudOsc.stop(now + 0.16);

  // 3. Wood grain acoustic shockwave
  const bufferSize = Math.floor(ctx.sampleRate * 0.12);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800, now);
  filter.Q.setValueAtTime(4.0, now);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.12);
}

/**
 * Deep Leather Baseball Glove Pocket Catch ("THWACK!")
 */
export function playGloveCatchSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Leather slap high-mid slap
  const slapOsc = ctx.createOscillator();
  const slapGain = ctx.createGain();
  slapOsc.type = 'sawtooth';
  slapOsc.frequency.setValueAtTime(680, now);
  slapOsc.frequency.exponentialRampToValueAtTime(140, now + 0.035);
  slapGain.gain.setValueAtTime(0.75, now);
  slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  slapOsc.connect(slapGain);
  slapGain.connect(ctx.destination);
  slapOsc.start(now);
  slapOsc.stop(now + 0.05);

  // Deep pocket thump (sub-bass leather cushion)
  const pocketOsc = ctx.createOscillator();
  const pocketGain = ctx.createGain();
  pocketOsc.type = 'sine';
  pocketOsc.frequency.setValueAtTime(180, now);
  pocketOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
  pocketGain.gain.setValueAtTime(0.95, now);
  pocketGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  pocketOsc.connect(pocketGain);
  pocketGain.connect(ctx.destination);
  pocketOsc.start(now);
  pocketOsc.stop(now + 0.24);

  // Ball spin friction inside leather webbing
  const bufSize = Math.floor(ctx.sampleRate * 0.08);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const bufData = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    bufData[i] = Math.random() * 2 - 1;
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buf;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(900, now);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.4, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(nGain);
  nGain.connect(ctx.destination);
  noiseSource.start(now);
  noiseSource.stop(now + 0.08);
}

/**
 * Stadium Bleachers Crowd Roar & Cheering
 */
export function playCrowdRoarSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const duration = 2.4;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.setValueAtTime(1.8, now);
  filter.frequency.setValueAtTime(650, now);
  filter.frequency.linearRampToValueAtTime(950, now + 0.6);
  filter.frequency.exponentialRampToValueAtTime(500, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.exponentialRampToValueAtTime(0.65, now + 0.25);
  gain.gain.linearRampToValueAtTime(0.55, now + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
}

/**
 * Crowd Disappointed Gasp ("Ohhh!")
 */
export function playCrowdGaspSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const duration = 1.2;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(250, now + duration * 0.8);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.005, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
}

/**
 * Cheerful Golden Retriever Bark ("Woof!")
 */
export function playDogBarkSound(isDouble: boolean = true) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const makeBark = (timeOffset: number, pitchMult: number = 1.0) => {
    const t = now + timeOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280 * pitchMult, t);
    osc.frequency.exponentialRampToValueAtTime(540 * pitchMult, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(160 * pitchMult, t + 0.14);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    // Mouth formant filter
    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(750, t);
    formant.Q.setValueAtTime(3.0, t);

    osc.connect(formant);
    formant.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  };

  makeBark(0, 1.0);
  if (isDouble) {
    makeBark(0.22, 1.08);
  }
}

/**
 * Cute Squeaky Tennis Ball
 */
export function playTennisBallSqueakSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.linearRampToValueAtTime(2600, now + 0.06);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.13);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.linearRampToValueAtTime(0.45, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * Dog Belly Rub Happiness Groan / Purr
 */
export function playBellyRubHappySound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(130 + Math.random() * 30, now);
  osc.frequency.linearRampToValueAtTime(170, now + 0.15);
  osc.frequency.linearRampToValueAtTime(120, now + 0.35);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.42);
}

/**
 * Dog Catching a Treat (Crunch)
 */
export function playTreatCrunchSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Snap & crunch noise burst
  const dur = 0.15;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.Q.setValueAtTime(2.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + dur);
}

export function playBaseballApproachSound(durationSec: number = 0.75, pitchFactor: number = 1.0) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const dur = Math.max(0.2, durationSec);
  const bufferSize = Math.floor(ctx.sampleRate * (dur + 0.1));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.setValueAtTime(3.2, now);
  filter.frequency.setValueAtTime(160 * pitchFactor, now);
  filter.frequency.exponentialRampToValueAtTime(1550 * pitchFactor, now + dur * 0.9);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.8, now + dur * 0.85);
  gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + dur + 0.05);
}

/**
 * Interactive Tap/Click sound when user cracks glass further
 */
export function playTapCrackSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Sharp snap
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sawtooth';
  const freq = 1200 + Math.random() * 800;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
  oscGain.gain.setValueAtTime(0.4, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);

  // Micro shard clink
  const clink = ctx.createOscillator();
  const clinkGain = ctx.createGain();
  clink.type = 'sine';
  const cFreq = 3200 + Math.random() * 2400;
  clink.frequency.setValueAtTime(cFreq, now + 0.01);
  clink.frequency.exponentialRampToValueAtTime(cFreq * 0.8, now + 0.07);
  clinkGain.gain.setValueAtTime(0.2, now + 0.01);
  clinkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  clink.connect(clinkGain);
  clinkGain.connect(ctx.destination);
  clink.start(now + 0.01);
  clink.stop(now + 0.09);
}

/**
 * Absolute Cinema: Triple-layer explosive bat crack, sub-bass shockwave, and crystalline glass shatter
 */
export function playBaseballGlassCrackSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 1. Violent bat-to-ball wood crack (hard transient)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(65, now + 0.09);

  oscGain.gain.setValueAtTime(0.9, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.11);

  // 2. Cinematic Sub-Bass Impact Punch (40Hz body-feeling rumble)
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(95, now);
  sub.frequency.exponentialRampToValueAtTime(32, now + 0.45);

  subGain.gain.setValueAtTime(1.0, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 0.52);

  // 3. Multi-stage high-frequency tempered glass explosion
  const bufferSize = ctx.sampleRate * 0.65;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const glassFilter = ctx.createBiquadFilter();
  glassFilter.type = 'highpass';
  glassFilter.frequency.setValueAtTime(2600, now + 0.02);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.setValueAtTime(0.95, now + 0.02);
  noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.55);

  noise.connect(glassFilter);
  glassFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now + 0.02);
  noise.stop(now + 0.6);

  // 4. Staggered falling crystalline shards (tinkling clinks)
  const shardPitches = [3400, 4800, 2900, 5600, 3900];
  shardPitches.forEach((freq, idx) => {
    const delay = 0.08 + idx * 0.06;
    const clink = ctx.createOscillator();
    const clinkGain = ctx.createGain();
    clink.type = 'sine';
    clink.frequency.setValueAtTime(freq, now + delay);
    clink.frequency.exponentialRampToValueAtTime(freq * 0.7, now + delay + 0.1);

    clinkGain.gain.setValueAtTime(0.18, now + delay);
    clinkGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

    clink.connect(clinkGain);
    clinkGain.connect(ctx.destination);
    clink.start(now + delay);
    clink.stop(now + delay + 0.13);
  });
}

/**
 * Ocean tidal surge & salty splash
 */
export function playWaterSplashSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Ocean swell rumble
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(70, now);
  sub.frequency.exponentialRampToValueAtTime(30, now + 0.6);
  subGain.gain.setValueAtTime(0.5, now);
  subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 0.75);

  // Water spray splash
  const bufferSize = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.frequency.exponentialRampToValueAtTime(450, now + 0.5);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.65, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.6);
}

/**
 * Cryogenic blizzard freezing sound
 */
export function playFreezeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Ice cracking / crystallization
  [1800, 2900, 4200].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + i * 0.08 + 0.2);

    gain.gain.setValueAtTime(0.2, now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.26);
  });

  // Howling cold wind
  const bufferSize = ctx.sampleRate * 0.7;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(1100, now + 0.5);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.7);
}

/**
 * Interstellar hyperspace warp sound
 */
export function playWarpSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.6);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.55, now + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.75);
}

/**
 * Warm melodic chime for the golden retriever puppy
 */
export function playChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Major pentatonic chime cascade: C5, E5, G5, C6
  const freqs = [523.25, 659.25, 783.99, 1046.5];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0.25, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.5);
  });
}

/**
 * Cyberpunk neon surge sound
 */
export function playCyberPulseSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.45);
}

/**
 * Wind vortex rush for autumn foliage
 */
export function playWindRushSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.exponentialRampToValueAtTime(1600, now + 0.3);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.6);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.65);
}

/**
 * Satisfying glass repair sound
 */
export function playGlassRepairSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const freqs = [350, 480, 720, 1100];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, now + i * 0.05);
    osc.frequency.exponentialRampToValueAtTime(freq, now + i * 0.05 + 0.15);

    gain.gain.setValueAtTime(0.15, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.25);
  });
}
