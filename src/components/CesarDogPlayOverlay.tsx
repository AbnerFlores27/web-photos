import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
  Trophy,
  Smile,
  Hand,
  CircleDot,
} from 'lucide-react';
import {
  playDogBarkSound,
  playTennisBallSqueakSound,
  playBellyRubHappySound,
  playTreatCrunchSound,
} from '../audioEffects';

interface CesarDogPlayOverlayProps {
  onClose: () => void;
}

interface FloatingEffect {
  id: number;
  x: number;
  y: number;
  type: 'heart' | 'sparkle' | 'paw' | 'bliss';
  color: string;
}

export function CesarDogPlayOverlay({ onClose }: CesarDogPlayOverlayProps) {
  // Modes: 'fetch' | 'belly-rub'
  const [activeMode, setActiveMode] = useState<'fetch' | 'belly-rub'>('fetch');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Cesar State
  const [cesarState, setCesarState] = useState<
    'idle' | 'watching' | 'running_to_ball' | 'has_ball' | 'returning' | 'belly_bliss' | 'eating_treat'
  >('idle');

  // Cesar Position & Look
  const [cesarPos, setCesarPos] = useState<{ x: number; y: number }>({ x: 50, y: 65 }); // in %
  const [cesarFacingLeft, setCesarFacingLeft] = useState<boolean>(false);
  const [tailWagSpeed, setTailWagSpeed] = useState<number>(0.5); // seconds per cycle

  // Tennis Ball Physics State
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 78 }); // in %
  const [ballVisible, setBallVisible] = useState<boolean>(true);
  const [isBallHeldByCesar, setIsBallHeldByCesar] = useState<boolean>(false);
  const [isThrowing, setIsThrowing] = useState<boolean>(false);

  // Belly Rub Stats
  const [rubHappiness, setRubHappiness] = useState<number>(35);
  const [rubStreak, setRubStreak] = useState<number>(0);
  const [floatingEffects, setFloatingEffects] = useState<FloatingEffect[]>([]);

  // Overall Stats
  const [fetchCount, setFetchCount] = useState<number>(0);
  const [treatCount, setTreatCount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Cesar is ready to play! Throw the tennis ball anywhere on the grass!'
  );

  const arenaRef = useRef<HTMLDivElement>(null);
  const lastRubTimeRef = useRef<number>(0);

  // Initial greeting bark
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAudioMuted) playDogBarkSound(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [isAudioMuted]);

  // Mode Switch Handler
  const handleSwitchMode = (mode: 'fetch' | 'belly-rub') => {
    setActiveMode(mode);
    if (mode === 'belly-rub') {
      setCesarState('belly_bliss');
      setStatusMessage('Gently rub or swipe across Cesar’s belly and chest for pure puppy bliss!');
      setTailWagSpeed(0.2);
      if (!isAudioMuted) playBellyRubHappySound();
    } else {
      setCesarState('idle');
      setStatusMessage('Click or drag anywhere on the grass to throw the ball for Cesar!');
      setTailWagSpeed(0.5);
    }
  };

  // Throw Tennis Ball
  const handleThrowBall = (targetXPercent: number, targetYPercent: number) => {
    if (isThrowing || cesarState === 'running_to_ball' || cesarState === 'returning') return;

    setIsThrowing(true);
    setIsBallHeldByCesar(false);
    setBallVisible(true);

    if (!isAudioMuted) playTennisBallSqueakSound();

    // Target coordinates clamped to grass bounds
    const clampedX = Math.max(10, Math.min(90, targetXPercent));
    const clampedY = Math.max(40, Math.min(85, targetYPercent));

    setBallPos({ x: clampedX, y: clampedY });
    setStatusMessage('Cesar spots the ball! GO GET IT BOY! 🐾');
    setCesarState('watching');
    setCesarFacingLeft(clampedX < cesarPos.x);

    // Cesar starts running to ball after a quick react delay
    setTimeout(() => {
      setCesarState('running_to_ball');
      setTailWagSpeed(0.18);
      // Run to near ball
      const offset = clampedX < 50 ? 5 : -5;
      setCesarPos({ x: clampedX + offset, y: clampedY - 4 });

      // After arrival, Cesar picks up ball
      setTimeout(() => {
        setCesarState('has_ball');
        setIsBallHeldByCesar(true);
        if (!isAudioMuted) {
          playDogBarkSound(false);
        }
        setStatusMessage('Cesar got the ball! Bringing it back to you! 🎾✨');

        // Cesar trots back to player
        setTimeout(() => {
          setCesarState('returning');
          setCesarFacingLeft(false);
          setCesarPos({ x: 50, y: 65 });

          // Drops ball
          setTimeout(() => {
            setCesarState('idle');
            setIsBallHeldByCesar(false);
            setBallPos({ x: 50, y: 78 });
            setIsThrowing(false);
            setFetchCount((prev) => prev + 1);
            setRubHappiness((prev) => Math.min(100, prev + 15));
            setStatusMessage('Cesar dropped the ball at your feet! Throw it again! 🐶');
            if (!isAudioMuted) playDogBarkSound(true);
          }, 1200);
        }, 800);
      }, 1400);
    }, 350);
  };

  // Arena Click Handling in Fetch Mode
  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeMode !== 'fetch') return;
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    // Only throw if clicked on the play grass area
    if (yPct > 35) {
      handleThrowBall(xPct, yPct);
    }
  };

  // Interactive Belly Rub MouseMove / TouchMove
  const handleBellyRubMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeMode !== 'belly-rub') return;
    const now = performance.now();
    if (now - lastRubTimeRef.current < 60) return;
    lastRubTimeRef.current = now;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    setRubHappiness((prev) => Math.min(100, prev + 2));
    setRubStreak((prev) => prev + 1);

    // Audio feedback every few ticks
    if (Math.random() > 0.65 && !isAudioMuted) {
      playBellyRubHappySound();
    }

    // Spawn floating heart or paw print
    const colors = ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7', '#38bdf8'];
    const newEffect: FloatingEffect = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY,
      type: Math.random() > 0.4 ? 'heart' : 'sparkle',
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setFloatingEffects((prev) => [...prev.slice(-20), newEffect]);
  };

  // Give Treat Action
  const handleGiveTreat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cesarState === 'eating_treat') return;

    setCesarState('eating_treat');
    setStatusMessage('Cesar catches the crunchy golden biscuit in mid-air! 🦴😋');
    if (!isAudioMuted) {
      setTimeout(() => playTreatCrunchSound(), 300);
      setTimeout(() => playDogBarkSound(false), 900);
    }

    setTreatCount((prev) => prev + 1);
    setRubHappiness((prev) => Math.min(100, prev + 20));

    setTimeout(() => {
      if (activeMode === 'belly-rub') {
        setCesarState('belly_bliss');
      } else {
        setCesarState('idle');
      }
      setStatusMessage('Cesar licks his chops happily! Good boy Cesar!');
    }, 1500);
  };

  return (
    <div
      ref={arenaRef}
      id="cesar-dog-play-arena"
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b from-[#7dd3fc] via-[#bae6fd] to-[#15803d]"
      onClick={handleArenaClick}
      onMouseMove={handleBellyRubMove}
      onTouchMove={handleBellyRubMove}
    >
      {/* 1. Header Toolbar */}
      <div
        className="w-full bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3 z-50 flex items-center justify-between text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <div>
            <h2 className="text-sm sm:text-base font-bold font-serif tracking-wide text-amber-200 flex items-center gap-2">
              <span>🐾 Cesar the Golden Retriever</span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PLAYTIME
              </span>
            </h2>
            <p className="text-[11px] text-slate-300 font-sans">{statusMessage}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold transition-colors cursor-pointer border border-red-500/40 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>CLOSE</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Sunny Grass Park Environment */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Sunny Sky & Fluffy Clouds */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Sun with golden rays */}
          <div className="absolute top-6 right-12 w-28 h-28 rounded-full bg-amber-300/80 blur-xl animate-pulse" />
          <div className="absolute top-8 right-14 w-20 h-20 rounded-full bg-yellow-100 shadow-[0_0_50px_rgba(253,224,71,0.9)]" />

          {/* Drifting Clouds */}
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: '110vw' }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="absolute top-12 left-0 w-44 h-16 bg-white/70 rounded-full blur-[1px]"
          />
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: '110vw' }}
            transition={{ duration: 60, delay: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute top-24 left-0 w-64 h-20 bg-white/60 rounded-full blur-[2px]"
          />

          {/* Distant Hills */}
          <div className="absolute top-[32%] left-0 right-0 h-28 bg-gradient-to-t from-[#4ade80]/60 to-transparent rounded-[100%_100%_0_0]" />
          <div className="absolute top-[36%] left-0 right-0 h-32 bg-gradient-to-t from-[#22c55e]/80 to-transparent rounded-[120%_80%_0_0]" />
        </div>

        {/* Lush Green Lawn Ground */}
        <div className="absolute top-[42%] bottom-0 left-0 right-0 bg-gradient-to-b from-[#15803d] via-[#166534] to-[#14532d] shadow-[inset_0_20px_40px_rgba(0,0,0,0.25)]">
          {/* Grass texture blades */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* TENNIS BALL */}
        {ballVisible && !isBallHeldByCesar && (
          <motion.div
            animate={{
              left: `${ballPos.x}%`,
              top: `${ballPos.y}%`,
              rotate: [0, 360, 720],
              scale: isThrowing ? [1, 1.3, 0.9, 1] : 1,
            }}
            transition={{
              left: { duration: 0.9, ease: 'easeOut' },
              top: { duration: 0.9, ease: 'easeOut' },
              scale: { duration: 0.9 },
              rotate: { duration: 0.9, ease: 'linear' },
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing"
            onClick={(e) => {
              e.stopPropagation();
              handleThrowBall(ballPos.x + (Math.random() - 0.5) * 40, ballPos.y - 20);
            }}
          >
            {/* Tennis ball shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/40 rounded-full blur-[2px]" />
            {/* Tennis ball body */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#d9f99d] via-[#bef264] to-[#65a30d] shadow-lg border border-lime-200 flex items-center justify-center animate-bounce">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                <path d="M 28 15 C 48 38, 48 62, 28 85" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                <path d="M 72 15 C 52 38, 52 62, 72 85" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </motion.div>
        )}

        {/* CESAR THE GOLDEN RETRIEVER PUPPY */}
        <motion.div
          animate={{
            left: `${cesarPos.x}%`,
            top: `${cesarPos.y}%`,
            scaleX: cesarFacingLeft ? -1 : 1,
          }}
          transition={{
            left: { duration: cesarState === 'running_to_ball' ? 1.2 : 0.8, ease: 'easeInOut' },
            top: { duration: cesarState === 'running_to_ball' ? 1.2 : 0.8, ease: 'easeInOut' },
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (activeMode === 'belly-rub') {
              handleBellyRubMove(e);
            } else {
              handleSwitchMode('belly-rub');
            }
          }}
        >
          {/* Soft Ground Shadow */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-10 bg-black/35 rounded-full blur-[6px]" />

          {/* SVG Character: Cesar */}
          <div className="relative w-64 h-56">
            {/* Wagging Tail */}
            <motion.div
              animate={{
                rotate:
                  cesarState === 'belly_bliss'
                    ? [-25, 25, -25]
                    : cesarState === 'running_to_ball'
                    ? [-35, 35, -35]
                    : [-15, 15, -15],
              }}
              transition={{
                duration: tailWagSpeed,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute left-6 top-20 origin-bottom-right"
            >
              <div className="w-14 h-24 bg-gradient-to-t from-[#d97706] via-[#f59e0b] to-[#fde68a] rounded-full shadow-md transform -rotate-45" />
            </motion.div>

            {/* Back Legs */}
            {cesarState === 'belly_bliss' ? (
              // Happy Kicking Back Leg in Belly Rub Mode
              <motion.div
                animate={{ rotate: [-20, 15, -20] }}
                transition={{ duration: 0.15, repeat: Infinity }}
                className="absolute left-16 top-12 w-8 h-20 bg-[#d97706] rounded-full origin-bottom"
              >
                <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-[#f59e0b]" />
                {/* Cute Paw Pads */}
                <div className="absolute top-1 left-2 w-4 h-3 bg-[#451a03] rounded-full" />
              </motion.div>
            ) : (
              <div className="absolute left-14 top-28 flex gap-4">
                <div className="w-8 h-18 bg-[#d97706] rounded-full shadow-inner" />
                <div className="w-8 h-18 bg-[#b45309] rounded-full shadow-inner" />
              </div>
            )}

            {/* Golden Retriever Body */}
            <div
              className={`absolute left-16 top-16 w-36 h-26 rounded-[45%_55%_45%_55%] shadow-lg border-2 border-[#fef08a]/30 ${
                cesarState === 'belly_bliss'
                  ? 'bg-gradient-to-tr from-[#d97706] via-[#fbbf24] to-[#fef08a] transform rotate-12'
                  : 'bg-gradient-to-br from-[#fef08a] via-[#f59e0b] to-[#b45309]'
              }`}
            >
              {/* Belly Rub Highlight Area */}
              {activeMode === 'belly-rub' && (
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute inset-2 rounded-full border-2 border-dashed border-white/60 bg-white/10 flex items-center justify-center text-white/90 text-[10px] font-bold"
                >
                  <Hand className="w-4 h-4 mr-1 text-amber-200 animate-bounce" />
                  <span>RUB HERE</span>
                </motion.div>
              )}
            </div>

            {/* Front Legs */}
            {cesarState === 'belly_bliss' ? (
              <div className="absolute left-32 top-8 flex gap-3">
                <div className="w-7 h-16 bg-[#fbbf24] rounded-full transform -rotate-30 shadow-md">
                  <div className="w-6 h-6 rounded-full bg-[#451a03] absolute -top-1 left-0.5 opacity-80" />
                </div>
                <div className="w-7 h-16 bg-[#f59e0b] rounded-full transform -rotate-15 shadow-md">
                  <div className="w-6 h-6 rounded-full bg-[#451a03] absolute -top-1 left-0.5 opacity-80" />
                </div>
              </div>
            ) : (
              <div className="absolute left-36 top-28 flex gap-3">
                <div className="w-8 h-18 bg-[#fbbf24] rounded-full shadow-inner" />
                <div className="w-8 h-18 bg-[#f59e0b] rounded-full shadow-inner" />
              </div>
            )}

            {/* Dog Head */}
            <div className="absolute right-4 top-6 w-28 h-28 z-30">
              {/* Floppy Golden Ears */}
              <motion.div
                animate={{
                  rotate:
                    cesarState === 'running_to_ball'
                      ? [-12, 12, -12]
                      : cesarState === 'belly_bliss'
                      ? [-5, 5, -5]
                      : [-2, 2, -2],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="absolute -top-2 -left-2 w-12 h-20 bg-gradient-to-b from-[#d97706] to-[#92400e] rounded-full shadow-md transform -rotate-12"
              />
              <motion.div
                animate={{
                  rotate:
                    cesarState === 'running_to_ball'
                      ? [12, -12, 12]
                      : cesarState === 'belly_bliss'
                      ? [5, -5, 5]
                      : [2, -2, 2],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="absolute -top-2 right-4 w-12 h-20 bg-gradient-to-b from-[#b45309] to-[#78350f] rounded-full shadow-md transform rotate-12"
              />

              {/* Head Base */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#fef08a] via-[#f59e0b] to-[#b45309] shadow-md border border-[#fef08a]/40">
                {/* Eyes */}
                <div className="absolute top-7 left-4 flex gap-6 z-10">
                  {/* Left Eye */}
                  <div className="w-4 h-4 rounded-full bg-[#291708] border border-amber-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white -translate-y-0.5 -translate-x-0.5" />
                  </div>
                  {/* Right Eye */}
                  <div className="w-4 h-4 rounded-full bg-[#291708] border border-amber-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white -translate-y-0.5 -translate-x-0.5" />
                  </div>
                </div>

                {/* Snout & Nose */}
                <div className="absolute bottom-2 left-6 w-16 h-12 bg-[#fde68a] rounded-full shadow-inner flex flex-col items-center justify-center">
                  {/* Black Leather Nose */}
                  <div className="w-6 h-4 bg-[#1c1917] rounded-full shadow-sm" />

                  {/* Mouth / Smile */}
                  {cesarState === 'belly_bliss' || cesarState === 'idle' ? (
                    <div className="w-8 h-4 border-b-3 border-[#78350f] rounded-full mt-0.5 flex justify-center">
                      {/* Happy Pink Tongue panting */}
                      <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                        className="w-4 h-6 bg-[#f43f5e] rounded-b-full shadow-sm"
                      />
                    </div>
                  ) : null}

                  {/* Ball Held in Mouth */}
                  {isBallHeldByCesar && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-lime-400 border border-white shadow-md flex items-center justify-center animate-pulse">
                      <CircleDot className="w-4 h-4 text-green-800" />
                    </div>
                  )}

                  {/* Bone Held in Mouth during treat */}
                  {cesarState === 'eating_treat' && (
                    <div className="absolute -bottom-1 -right-2 text-xl animate-bounce">🦴</div>
                  )}
                </div>

                {/* Blue Collar with Golden Tag */}
                <div className="absolute -bottom-1 left-2 w-20 h-4 bg-sky-600 rounded-full border border-sky-400 flex items-center justify-center shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-200 text-[8px] font-black text-amber-950 flex items-center justify-center shadow">
                    C
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Heart & Sparkle Particle Overlay */}
        <AnimatePresence>
          {floatingEffects.map((eff) => (
            <motion.div
              key={eff.id}
              initial={{ opacity: 1, scale: 0.4, y: eff.y, x: eff.x }}
              animate={{ opacity: 0, scale: 1.5, y: eff.y - 80, x: eff.x + (Math.random() - 0.5) * 40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute pointer-events-none z-50 text-2xl drop-shadow-md"
              style={{ color: eff.color }}
            >
              {eff.type === 'heart' ? '💖' : eff.type === 'sparkle' ? '✨' : '🐾'}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Interactive Dock: Modes, Stats & Treat Dispenser */}
      <div
        className="w-full bg-[#0a101d]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-50 flex flex-col gap-2.5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchMode('fetch')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeMode === 'fetch'
                  ? 'bg-lime-500 text-slate-950 border-lime-300 shadow-lg shadow-lime-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
              }`}
            >
              <span className="text-base">🎾</span>
              <span>THROW & FETCH</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
                {fetchCount}
              </span>
            </button>

            <button
              onClick={() => handleSwitchMode('belly-rub')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeMode === 'belly-rub'
                  ? 'bg-rose-500 text-white border-rose-300 shadow-lg shadow-rose-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-200 fill-rose-200" />
              <span>BELLY RUBS</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                {rubStreak}x
              </span>
            </button>

            <button
              onClick={handleGiveTreat}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer border border-amber-500/40 flex items-center gap-1.5 shadow-sm"
            >
              <span className="text-base">🦴</span>
              <span>GIVE TREAT ({treatCount})</span>
            </button>
          </div>

          {/* Cesar Happiness Gauge */}
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Smile className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 gap-4">
                <span>CESAR HAPPINESS</span>
                <span className="text-amber-300 font-bold">{rubHappiness}%</span>
              </div>
              <div className="w-32 sm:w-44 h-2 bg-black/40 rounded-full overflow-hidden mt-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full"
                  animate={{ width: `${rubHappiness}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
