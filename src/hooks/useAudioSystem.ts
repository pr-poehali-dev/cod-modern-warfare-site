import { useEffect, useRef, useCallback } from 'react';

const createBeepSound = (ctx: AudioContext, freq: number, duration: number, type: OscillatorType = 'square', volume = 0.3) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

const createNoiseSound = (ctx: AudioContext, duration: number, volume = 0.15) => {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.8;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  source.start(ctx.currentTime);
  source.stop(ctx.currentTime + duration);
};

export const useAudioSystem = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playActivationSound = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    createNoiseSound(ctx, 0.2, 0.2);
    setTimeout(() => createBeepSound(ctx, 440, 0.15, 'square', 0.2), 100);
    setTimeout(() => createBeepSound(ctx, 880, 0.15, 'square', 0.25), 250);
    setTimeout(() => createBeepSound(ctx, 1320, 0.3, 'square', 0.3), 400);
    setTimeout(() => {
      createBeepSound(ctx, 660, 0.1, 'square', 0.15);
      createBeepSound(ctx, 1320, 0.1, 'square', 0.15);
    }, 750);
    setTimeout(() => createNoiseSound(ctx, 0.1, 0.1), 900);
    setTimeout(() => createBeepSound(ctx, 2200, 0.5, 'sine', 0.2), 1000);
  }, [getCtx]);

  const playRadioNoise = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const variant = Math.floor(Math.random() * 4);

    if (variant === 0) {
      createNoiseSound(ctx, 0.3, 0.12);
      setTimeout(() => createBeepSound(ctx, 1200, 0.08, 'square', 0.1), 200);
      setTimeout(() => createNoiseSound(ctx, 0.2, 0.08), 400);
    } else if (variant === 1) {
      createBeepSound(ctx, 800, 0.05, 'square', 0.08);
      setTimeout(() => createBeepSound(ctx, 800, 0.05, 'square', 0.08), 150);
      setTimeout(() => createBeepSound(ctx, 800, 0.05, 'square', 0.08), 300);
      setTimeout(() => createNoiseSound(ctx, 0.4, 0.1), 500);
    } else if (variant === 2) {
      createNoiseSound(ctx, 0.6, 0.15);
      setTimeout(() => createBeepSound(ctx, 1600, 0.1, 'sawtooth', 0.06), 300);
    } else {
      createBeepSound(ctx, 440, 0.05, 'square', 0.05);
      setTimeout(() => createBeepSound(ctx, 880, 0.05, 'square', 0.05), 100);
      setTimeout(() => createNoiseSound(ctx, 0.15, 0.08), 250);
      setTimeout(() => createBeepSound(ctx, 660, 0.05, 'square', 0.05), 500);
    }
  }, [getCtx]);

  const startPeriodicNoise = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      playRadioNoise();
    }, 20000);
  }, [playRadioNoise]);

  const stopPeriodicNoise = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPeriodicNoise();
    };
  }, [stopPeriodicNoise]);

  return { playActivationSound, playRadioNoise, startPeriodicNoise, stopPeriodicNoise };
};
