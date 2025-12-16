import React, { useEffect, useRef } from 'react';
import { WorldState } from '../types';

interface AmbientSoundProps {
  worldState: WorldState;
  isMuted: boolean;
}

const AmbientSound: React.FC<AmbientSoundProps> = ({ worldState, isMuted }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
          const gainNode = audioContextRef.current.createGain();
          gainNode.connect(audioContextRef.current.destination);
          gainNodeRef.current = gainNode;
        }
      }
    };
    initAudio();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Handle Mute/Volume
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const targetGain = isMuted ? 0 : 0.05; // Keep volume very low (background)
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.5);
      
      if (!isMuted && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  }, [isMuted]);

  // Handle World State Changes (Sound Synthesis)
  useEffect(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    const ctx = audioContextRef.current;
    
    // Cleanup old sounds
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch(e){}
    });
    oscillatorsRef.current = [];

    if (noiseNodeRef.current) {
      try { noiseNodeRef.current.stop(); noiseNodeRef.current.disconnect(); } catch(e){}
      noiseNodeRef.current = null;
    }

    if (isMuted) return;

    // Create new soundscape based on state
    const createOscillator = (freq: number, type: OscillatorType, detune: number = 0) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(gainNodeRef.current!);
      osc.start();
      oscillatorsRef.current.push(osc);
    };

    // Brown Noise Generator (Wind/Fire rumble)
    const createNoise = () => {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Compensate for gain
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(gainNodeRef.current!);
        noise.start();
        noiseNodeRef.current = noise;
    };
    let lastOut = 0;

    switch (worldState) {
      case 'BONFIRE':
        // Warm, low hum + crackle
        createOscillator(55, 'sine', -5); // Low A
        createOscillator(110, 'triangle', 5); // A2
        createNoise(); // "Fire" rumble
        break;
      
      case 'ECLIPSE':
        // Dissonant, scary
        createOscillator(40, 'sawtooth', 0); // Very low rumble
        createOscillator(60, 'sawtooth', 100); // Dissonance
        createOscillator(200, 'sine', Math.random() * 100); // Unsettling warble
        break;

      case 'ASTRAL':
        // Ethereal, high pitch
        createOscillator(220, 'sine', 0);
        createOscillator(440, 'sine', 2);
        createOscillator(880, 'sine', -2);
        break;

      case 'PHYSICAL':
      default:
        // Dark ambience, wind
        createOscillator(60, 'sine', 0); // Deep drone
        createNoise(); // "Wind"
        break;
    }

  }, [worldState, isMuted]);

  return null; // Logic only component
};

export default AmbientSound;