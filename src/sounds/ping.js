export default async function ping() {
  const audioCtx = new window.AudioContext();
  const oscillator = audioCtx.createOscillator();
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  const convolver = audioCtx.createConvolver();
  convolver.buffer = createImpulseResponse(audioCtx, 0.3, 0);
  oscillator.connect(gain).connect(convolver).connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
}

function createImpulseResponse(audioCtx, duration, decay) {
  const rate = audioCtx.sampleRate;
  const length = rate * duration;
  const impulse = audioCtx.createBuffer(2, length, rate);
  for (let i = 0; i < 2; i++) {
    const channel = impulse.getChannelData(i);
    for (let j = 0; j < length; j++) {
      channel[j] = Math.random() * Math.pow(1 - j / length, decay);
    }
  }

  return impulse;
}
