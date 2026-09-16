import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  playBaseballApproachSound,
  playBaseballGlassCrackSound,
  playTapCrackSound,
  playWaterSplashSound,
  playFreezeSound,
  playWarpSound,
  playChimeSound,
  playCyberPulseSound,
  playWindRushSound,
  playGlassRepairSound,
} from '../audioEffects';
import {
  ThreeBaseballCanvas,
  PITCH_PRESETS,
} from './ThreeBaseballCanvas';
import { CesarDogPlayOverlay } from './CesarDogPlayOverlay';
import { BaseballCatchOverlay } from './BaseballCatchOverlay';
import {
  Wrench,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  RotateCcw,
  Gauge,
  Crosshair,
  Clock,
  Zap,
} from 'lucide-react';

export type AnimationType =
  | 'baseball-crack'
  | 'puppy-bounce'
  | 'ocean-splash'
  | 'alpine-frost'
  | 'cafe-steam'
  | 'city-pulse'
  | 'autumn-leaves'
  | 'cosmic-warp';

interface PhotoEffectOverlayProps {
  effectType: AnimationType | null;
  photoTitle: string;
  onClose: () => void;
}

interface ExtraCrack {
  id: number;
  x: number;
  y: number;
  paths: string[];
}

interface GlassShard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  size: number;
  points: [number, number][];
  opacity: number;
  color: string;
}

interface WaterDrop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  splatter: boolean;
  dripLength: number;
  maxDrip: number;
  opacity: number;
}

interface AutumnLeaf {
  x: number;
  y: number;
  z: number;
  vz: number;
  vx: number;
  vy: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  size: number;
  color: string;
}

interface WarpStar {
  x: number;
  y: number;
  z: number;
  pz: number;
  speed: number;
  color: string;
}

export function PhotoEffectOverlay({
  effectType,
  photoTitle,
  onClose,
}: PhotoEffectOverlayProps) {
  // Mode selection for baseball effect
  const [baseballMode, setBaseballMode] = useState<'stands-catch' | 'windshield-shatter'>('stands-catch');

  // Pitch & Cinema Settings
  const [pitchKey, setPitchKey] = useState<string>('fastball');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [interactiveAimMode, setInteractiveAimMode] = useState<boolean>(false);
  const [customAimTarget, setCustomAimTarget] = useState<{ x: number; y: number } | null>(null);

  // Animation Life-Cycle
  const [pitchCounter, setPitchCounter] = useState<number>(0);
  const [phase, setPhase] = useState<'incoming' | 'impact' | 'settled' | 'repaired'>('incoming');
  const [flash, setFlash] = useState<boolean>(false);
  const [shakeIntensity, setShakeIntensity] = useState<number>(0);

  // Glass Cracking System
  const [extraCracks, setExtraCracks] = useState<ExtraCrack[]>([]);
  const [glassIntegrity, setGlassIntegrity] = useState<number>(65);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const shardEmitterRef = useRef<((x: number, y: number, count?: number) => void) | null>(null);

  const currentPitch = PITCH_PRESETS[pitchKey] || PITCH_PRESETS.fastball;

  // Launch Pitch Execution
  useEffect(() => {
    if (!effectType) return;

    if (effectType === 'baseball-crack') {
      setPhase('incoming');
      setFlash(false);
      setShakeIntensity(0);

      if (!isAudioMuted) {
        const flightSec = currentPitch.flightDuration / playbackSpeed;
        playBaseballApproachSound(flightSec, currentPitch.speedMph / 100);
      }
    } else if (effectType === 'ocean-splash') {
      if (!isAudioMuted) playWaterSplashSound();
      setPhase('settled');
    } else if (effectType === 'alpine-frost') {
      if (!isAudioMuted) playFreezeSound();
      setPhase('settled');
    } else if (effectType === 'cosmic-warp') {
      if (!isAudioMuted) playWarpSound();
      setPhase('settled');
    } else if (effectType === 'puppy-bounce') {
      if (!isAudioMuted) playChimeSound();
      setPhase('settled');
    } else if (effectType === 'city-pulse') {
      if (!isAudioMuted) playCyberPulseSound();
      setPhase('settled');
    } else if (effectType === 'autumn-leaves') {
      if (!isAudioMuted) playWindRushSound();
      setPhase('settled');
    } else {
      setPhase('settled');
    }
  }, [effectType, pitchCounter, pitchKey, playbackSpeed]);

  // Handle Three.js Baseball Impact Callback
  const handleBaseballImpact = () => {
    setPhase('impact');
    setFlash(true);
    setShakeIntensity(1);

    if (!isAudioMuted) {
      playBaseballGlassCrackSound();
    }

    // Spawn initial shockwave shards at center / target
    const targetX = customAimTarget ? customAimTarget.x : window.innerWidth / 2;
    const targetY = customAimTarget ? customAimTarget.y : window.innerHeight / 2;
    shardEmitterRef.current?.(targetX, targetY, 80);

    setTimeout(() => setFlash(false), 120);

    setTimeout(() => {
      setShakeIntensity(0);
      setPhase('settled');
    }, 550);
  };

  // Re-Pitch Ball
  const handleRepitch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhase('incoming');
    setCustomAimTarget(null);
    setPitchCounter((prev) => prev + 1);
  };

  // Repair Screen
  const handleRepairScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAudioMuted) playGlassRepairSound();
    setPhase('repaired');
    setExtraCracks([]);
    setGlassIntegrity(100);
    setTimeout(() => {
      setPhase('incoming');
      setPitchCounter((prev) => prev + 1);
    }, 400);
  };

  // User Clicks on Screen: either Crack Glass More OR Throw Ball at Spot
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If aiming mode is active, set aim target and throw ball!
    if (interactiveAimMode && phase !== 'incoming') {
      setCustomAimTarget({ x: e.clientX, y: e.clientY });
      setPhase('incoming');
      setPitchCounter((prev) => prev + 1);
      setInteractiveAimMode(false);
      return;
    }

    // If already cracked, clicking adds extra cracks and breaks glass further!
    if (effectType === 'baseball-crack' && (phase === 'settled' || phase === 'impact')) {
      const clickX = e.clientX;
      const clickY = e.clientY;

      if (!isAudioMuted) {
        playTapCrackSound();
      }

      // Generate realistic spiderweb fracture branches
      const branches: string[] = [];
      const numRays = Math.floor(Math.random() * 4) + 6;
      for (let i = 0; i < numRays; i++) {
        const baseAngle = (i / numRays) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        let curX = clickX;
        let curY = clickY;
        let path = `M ${curX} ${curY}`;

        const segments = Math.floor(Math.random() * 3) + 3;
        const totalDist = Math.random() * 180 + 80;
        const stepDist = totalDist / segments;

        for (let s = 1; s <= segments; s++) {
          const angle = baseAngle + (Math.random() - 0.5) * 0.6;
          curX += Math.cos(angle) * stepDist;
          curY += Math.sin(angle) * stepDist;
          path += ` L ${Math.round(curX)} ${Math.round(curY)}`;
        }
        branches.push(path);
      }

      setExtraCracks((prev) => [
        ...prev.slice(-12), // keep last 12 dynamic clicks
        { id: Date.now(), x: clickX, y: clickY, paths: branches },
      ]);

      // Reduce integrity
      setGlassIntegrity((prev) => Math.max(0, prev - 10));

      // Emit localized glass shards
      shardEmitterRef.current?.(clickX, clickY, 16);
    }
  };

  // 60FPS Canvas Particle Physics Loop
  useEffect(() => {
    if (!effectType) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const shards: GlassShard[] = [];
    const waterDrops: WaterDrop[] = [];
    const leaves: AutumnLeaf[] = [];
    const warpStars: WarpStar[] = [];

    // Particle Emitter for Glass Shards
    shardEmitterRef.current = (originX: number, originY: number, count: number = 50) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 20 + 4;
        const size = Math.random() * 22 + 6;

        const p1: [number, number] = [0, -size];
        const p2: [number, number] = [
          size * (0.5 + Math.random() * 0.5),
          size * (0.6 + Math.random() * 0.4),
        ];
        const p3: [number, number] = [
          -size * (0.5 + Math.random() * 0.5),
          size * (0.5 + Math.random() * 0.5),
        ];

        shards.push({
          x: originX + (Math.random() - 0.5) * 30,
          y: originY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 6 + 2),
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.4,
          size,
          points: [p1, p2, p3],
          opacity: 0.95,
          color:
            Math.random() > 0.4
              ? 'rgba(235, 248, 255, 0.95)'
              : 'rgba(180, 220, 255, 0.85)',
        });
      }
    };

    // Initialize other effects
    if (effectType === 'ocean-splash') {
      for (let i = 0; i < 70; i++) {
        waterDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 16 + 5,
          speed: Math.random() * 2 + 0.5,
          splatter: Math.random() > 0.3,
          dripLength: 0,
          maxDrip: Math.random() * 140 + 40,
          opacity: Math.random() * 0.4 + 0.5,
        });
      }
    }

    if (effectType === 'autumn-leaves') {
      const leafColors = ['#d97706', '#ea580c', '#dc2626', '#b45309', '#f59e0b', '#78350f'];
      for (let i = 0; i < 60; i++) {
        leaves.push({
          x: (Math.random() - 0.5) * width * 1.5,
          y: (Math.random() - 0.5) * height * 1.5,
          z: Math.random() * 1000 + 100,
          vz: -(Math.random() * 12 + 8),
          vx: Math.sin(i) * 3 + (Math.random() - 0.5) * 4,
          vy: Math.cos(i) * 2 + Math.random() * 3 + 1,
          rotX: Math.random() * Math.PI * 2,
          rotY: Math.random() * Math.PI * 2,
          rotZ: Math.random() * Math.PI * 2,
          vRotX: (Math.random() - 0.5) * 0.08,
          vRotY: (Math.random() - 0.5) * 0.08,
          vRotZ: (Math.random() - 0.5) * 0.06,
          size: Math.random() * 28 + 18,
          color: leafColors[Math.floor(Math.random() * leafColors.length)],
        });
      }
    }

    if (effectType === 'cosmic-warp') {
      const starColors = ['#ffffff', '#bae6fd', '#e0e7ff', '#c084fc', '#fbcfe8'];
      for (let i = 0; i < 300; i++) {
        warpStars.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * 1200 + 50,
          pz: 0,
          speed: Math.random() * 30 + 35,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Shards
      if (shards.length > 0) {
        for (let i = shards.length - 1; i >= 0; i--) {
          const shard = shards[i];
          shard.x += shard.vx;
          shard.y += shard.vy;
          shard.vy += 0.48; // realistic gravity
          shard.rotation += shard.vRot;
          shard.opacity -= 0.008;

          if (shard.opacity <= 0 || shard.y > height + 60) {
            shards.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(shard.x, shard.y);
          ctx.rotate(shard.rotation);
          ctx.fillStyle = shard.color;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(shard.points[0][0], shard.points[0][1]);
          ctx.lineTo(shard.points[1][0], shard.points[1][1]);
          ctx.lineTo(shard.points[2][0], shard.points[2][1]);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Render Ocean Drops
      if (effectType === 'ocean-splash') {
        ctx.save();
        for (const drop of waterDrops) {
          ctx.beginPath();
          ctx.arc(drop.x, drop.y + drop.dripLength, drop.radius, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            drop.x - drop.radius * 0.3,
            drop.y + drop.dripLength - drop.radius * 0.3,
            drop.radius * 0.1,
            drop.x,
            drop.y + drop.dripLength,
            drop.radius
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${drop.opacity * 0.85})`);
          grad.addColorStop(0.6, `rgba(180, 230, 255, ${drop.opacity * 0.4})`);
          grad.addColorStop(1, `rgba(50, 120, 190, ${drop.opacity * 0.8})`);
          ctx.fillStyle = grad;
          ctx.fill();

          if (drop.dripLength < drop.maxDrip) {
            drop.dripLength += drop.speed;
          }
        }
        ctx.restore();
      }

      // Render Autumn Leaves
      if (effectType === 'autumn-leaves') {
        ctx.save();
        const fov = 400;
        const cx = width / 2;
        const cy = height / 2;

        for (const leaf of leaves) {
          leaf.z += leaf.vz;
          leaf.rotX += leaf.vRotX;
          leaf.rotY += leaf.vRotY;
          leaf.rotZ += leaf.vRotZ;

          const angle = Math.atan2(leaf.y, leaf.x) + 0.035;
          const dist = Math.hypot(leaf.x, leaf.y);
          leaf.x = Math.cos(angle) * dist;
          leaf.y = Math.sin(angle) * dist;

          if (leaf.z <= 20) {
            leaf.z = 1100;
            leaf.x = (Math.random() - 0.5) * width * 1.5;
            leaf.y = (Math.random() - 0.5) * height * 1.5;
          }

          const scale = fov / (fov + leaf.z);
          const px = cx + leaf.x * scale;
          const py = cy + leaf.y * scale;
          const pSize = leaf.size * scale;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(leaf.rotZ);
          ctx.scale(Math.cos(leaf.rotX), Math.sin(leaf.rotY));

          ctx.beginPath();
          ctx.moveTo(0, -pSize);
          ctx.bezierCurveTo(pSize * 0.8, -pSize * 0.5, pSize * 0.9, pSize * 0.3, 0, pSize);
          ctx.bezierCurveTo(-pSize * 0.9, pSize * 0.3, -pSize * 0.8, -pSize * 0.5, 0, -pSize);
          ctx.fillStyle = leaf.color;
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      // Render Warp Stars
      if (effectType === 'cosmic-warp') {
        ctx.save();
        const cx = width / 2;
        const cy = height / 2;

        for (const star of warpStars) {
          star.pz = star.z;
          star.z -= star.speed;

          if (star.z <= 1) {
            star.z = 1200;
            star.pz = 1200;
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
          }

          const k = 400 / star.z;
          const px = cx + star.x * k;
          const py = cy + star.y * k;

          const pk = 400 / star.pz;
          const prevX = cx + star.x * pk;
          const prevY = cy + star.y * pk;

          const alpha = Math.min(1, (1200 - star.z) / 400);

          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = Math.max(1, (1 - star.z / 1200) * 5);
          ctx.globalAlpha = alpha;
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [effectType]);

  if (!effectType) return null;

  // ROUTE 1: Cesar the Golden Retriever - Full Interactive Dog Playground
  if (effectType === 'puppy-bounce') {
    return <CesarDogPlayOverlay onClose={onClose} />;
  }

  // ROUTE 2: Baseball Catch in the Bleachers (Default Mode)
  if (effectType === 'baseball-crack' && baseballMode === 'stands-catch') {
    return (
      <div className="fixed inset-0 z-50">
        <BaseballCatchOverlay photoTitle={photoTitle} onClose={onClose} />
        {/* Toggle button to switch to 3D WebGL Camera Lens Shatter */}
        <div className="fixed top-3 right-24 sm:right-28 z-50 pointer-events-auto">
          <button
            onClick={() => setBaseballMode('windshield-shatter')}
            className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-105"
            title="Switch to 3D WebGL Camera Lens Shatter"
          >
            <span>💥 SHATTER LENS MODE</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="photo-interactive-fx-layer"
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center select-none"
      onClick={handleScreenClick}
    >
      {/* 1. Top Cinematic CinemaScope Bar with Live Telemetry & Quick Controls */}
      <motion.div
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        exit={{ y: -120 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="absolute top-0 left-0 right-0 h-12 sm:h-16 bg-black/95 z-50 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-white/90">
              CINEMASCOPE 2.39:1 &bull; {photoTitle.toUpperCase()}
            </span>
            <span className="text-[9px] font-mono text-cyan-400/80">
              STATCAST 3D ENGINE &bull; 60 FPS WEBGL PBR
            </span>
          </div>
        </div>

        {/* Top Controls: Audio, Mode Switch, Dismiss */}
        <div className="flex items-center gap-2">
          {effectType === 'baseball-crack' && (
            <button
              onClick={() => setBaseballMode('stands-catch')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Switch to Stadium Bleachers Catch Game"
            >
              <span>🏟️ STANDS CATCH GAME</span>
            </button>
          )}

          {effectType === 'baseball-crack' && (
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="hidden sm:inline text-[10px]">
                {isAudioMuted ? 'MUTED' : 'AUDIO ON'}
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-red-500/30"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-[10px] font-bold">EXIT CINEMA</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Anamorphic Flash and Screen Shake Container */}
      <div
        className={`absolute inset-0 transition-transform duration-75 ${
          shakeIntensity > 0 ? 'animate-screen-shake' : ''
        }`}
      >
        {/* Background Backdrop Tint with Ambient Vignette */}
        <div className="absolute inset-0 bg-[#040612]/85 backdrop-blur-[6px]" />

        {/* Anamorphic Lens Flare Line (Horizontal Blue Streak) */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 blur-[1px] pointer-events-none" />

        {/* Impact White Flash */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-tr from-white via-cyan-100 to-white z-40 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* High-Performance Canvas Particles (Shards, Water Drops, Leaves, Warp Stars) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-30 pointer-events-none w-full h-full"
        />

        {/* ========================================================================= */}
        {/* EFFECT 1: TRUE 3D WEBGL BASEBALL MASTERPIECE                              */}
        {/* ========================================================================= */}
        {effectType === 'baseball-crack' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Real WebGL Three.js 3D Baseball */}
            <ThreeBaseballCanvas
              key={`three-baseball-${pitchCounter}-${pitchKey}`}
              pitchType={pitchKey}
              playbackSpeed={playbackSpeed}
              isImpacted={phase === 'impact' || phase === 'settled'}
              onImpact={handleBaseballImpact}
              interactiveTarget={customAimTarget}
            />

            {/* Aerodynamic Speed Rings during incoming phase */}
            {phase === 'incoming' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 0.7, scale: 1.4 }}
                transition={{ duration: currentPitch.flightDuration / playbackSpeed }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-[500px] h-[500px] rounded-full border border-cyan-400/20 animate-ping" />
              </motion.div>
            )}

            {/* SPIDERWEB GLASS FRACTURE OVERLAYS */}
            {(phase === 'impact' || phase === 'settled') && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 1. Main Epicenter Shatter Pattern */}
                <svg
                  viewBox="0 0 1000 1000"
                  className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <radialGradient id="glass-frost" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(0,0,0,0.85)" />
                      <stop offset="45%" stopColor="rgba(255,255,255,0.3)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                    </radialGradient>
                  </defs>

                  {/* Impact Crater Hole & Concentric Tension Rings */}
                  <circle cx="500" cy="500" r="95" fill="url(#glass-frost)" />
                  <circle
                    cx="500"
                    cy="500"
                    r="90"
                    stroke="#ffffff"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="16 8 32 6"
                  />
                  <circle
                    cx="500"
                    cy="500"
                    r="140"
                    stroke="rgba(255,255,255,0.75)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="25 15 45 20"
                  />
                  <circle
                    cx="500"
                    cy="500"
                    r="220"
                    stroke="rgba(200,235,255,0.6)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray="35 25 70 30"
                  />
                  <circle
                    cx="500"
                    cy="500"
                    r="340"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="50 35 120 40"
                  />
                  <circle
                    cx="500"
                    cy="500"
                    r="480"
                    stroke="rgba(180,225,255,0.3)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="80 50 160 60"
                  />

                  {/* High-Resolution Radial Lightning Fissures */}
                  <g stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.95">
                    <path d="M 500 500 L 580 410 L 640 430 L 760 310 L 890 340 L 1000 240" />
                    <path d="M 760 310 L 820 190 L 920 160 L 1000 110" />
                    <path d="M 580 410 L 670 290 L 710 160 L 750 0" />
                    <path d="M 500 500 L 530 380 L 510 240 L 540 120 L 520 0" />
                    <path d="M 500 500 L 410 420 L 330 380 L 260 260 L 170 230 L 80 120 L 0 80" />
                    <path d="M 410 420 L 430 310 L 380 190 L 340 0" />
                    <path d="M 260 260 L 210 140 L 160 0" />
                    <path d="M 500 500 L 400 480 L 270 470 L 150 420 L 0 390" />
                    <path d="M 500 500 L 420 560 L 320 610 L 250 720 L 170 810 L 90 920 L 0 980" />
                    <path d="M 320 610 L 210 630 L 110 680 L 0 710" />
                    <path d="M 420 560 L 450 690 L 390 820 L 350 1000" />
                    <path d="M 250 720 L 280 870 L 230 1000" />
                    <path d="M 500 500 L 570 570 L 660 640 L 740 760 L 840 850 L 960 960 L 1000 1000" />
                    <path d="M 660 640 L 780 620 L 890 670 L 1000 650" />
                    <path d="M 570 570 L 560 710 L 630 840 L 670 1000" />
                    <path d="M 740 760 L 780 890 L 820 1000" />

                    {/* Connecting Micro Fissures */}
                    <path d="M 580 410 L 530 380 L 410 420" strokeWidth="2" stroke="rgba(255,255,255,0.7)" />
                    <path d="M 400 480 L 420 560 L 570 570" strokeWidth="2" stroke="rgba(255,255,255,0.7)" />
                    <path d="M 640 430 L 660 640" strokeWidth="1.5" stroke="rgba(255,255,255,0.6)" />
                    <path d="M 330 380 L 270 470 L 320 610" strokeWidth="1.5" stroke="rgba(255,255,255,0.6)" />
                  </g>

                  {/* Refraction edge glints */}
                  <g stroke="rgba(125, 211, 252, 0.85)" strokeWidth="1.5" fill="none">
                    <path d="M 502 502 L 762 312 L 1002 242" />
                    <path d="M 498 502 L 258 722 L 92 922" />
                  </g>
                </svg>

                {/* 2. User-Generated Dynamic Tap Cracks */}
                {extraCracks.map((crack) => (
                  <svg
                    key={crack.id}
                    className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  >
                    <circle
                      cx={crack.x}
                      cy={crack.y}
                      r="12"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="rgba(255,255,255,0.3)"
                    />
                    {crack.paths.map((p, idx) => (
                      <path
                        key={idx}
                        d={p}
                        stroke="#ffffff"
                        strokeWidth={idx % 2 === 0 ? '2' : '1.5'}
                        fill="none"
                        strokeLinecap="round"
                        opacity={0.9}
                      />
                    ))}
                  </svg>
                ))}
              </div>
            )}

            {/* Click-to-Crack Hint Prompt */}
            {phase === 'settled' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-20 sm:top-24 z-40 pointer-events-none"
              >
                <div className="bg-black/80 border border-cyan-400/40 px-4 py-1.5 rounded-full text-cyan-300 font-mono text-[11px] shadow-lg backdrop-blur-md flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>
                    {interactiveAimMode
                      ? '🎯 CLICK ANYWHERE TO PITCH BALL DIRECTLY AT THAT SPOT'
                      : '💥 CLICK / TAP ANYWHERE ON SCREEN TO CRACK THE GLASS MORE!'}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* EFFECT 3: PACIFIC COAST SUNSET (CINEMATIC TIDAL SWELL)                    */}
        {/* ========================================================================= */}
        {effectType === 'ocean-splash' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Dynamic Sunset Coastal Horizon */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#082f49] via-[#0284c7]/40 to-transparent" />

            {/* Surging Oceanic Wave Barrel */}
            <motion.div
              initial={{ y: '100%', scaleY: 0.8 }}
              animate={{ y: ['100%', '8%', '45%', '12%'], scaleY: [0.8, 1.1, 0.95, 1.05] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 left-0 right-0 h-[85vh] bg-gradient-to-t from-[#0369a1] via-[#38bdf8]/80 to-[#bae6fd]/30 rounded-t-[50%_30%] flex flex-col justify-start shadow-[0_-20px_60px_rgba(56,189,248,0.5)]"
            >
              {/* White Frothy Sea Foam Crest */}
              <div className="h-10 w-full bg-gradient-to-r from-white/90 via-cyan-100 to-white/90 blur-[2px] rounded-t-[50%_30%]" />
              <div className="h-4 w-full bg-white/60 blur-[6px] -mt-2" />
            </motion.div>

            {/* Shimmering Sun Rays Refraction */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl animate-pulse" />

            {/* Ocean Telemetry Pill */}
            <div className="absolute bottom-12 bg-sky-950/80 border border-sky-400/40 px-5 py-2 rounded-full text-sky-200 font-mono text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>PACIFIC SWELL &bull; 8.4 FT GROUND TIDE &bull; CLICK TO SPLASH</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EFFECT 4: ALPINE MOUNTAIN PEAKS (SUB-ZERO BLIZZARD FROST)                 */}
        {/* ========================================================================= */}
        {effectType === 'alpine-frost' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Ice Frost Creeping Edges with crystalline vignettes */}
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 border-[32px] sm:border-[48px] border-cyan-100/70 shadow-[inset_0_0_120px_rgba(186,230,253,0.9)] backdrop-blur-[3px]"
            />

            {/* Floating Ice Crystals & Snowflake Swirls */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(14,116,144,0.3)_100%)]" />

            {/* Frost Breath Fog */}
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-80 h-80 rounded-full bg-cyan-200/20 blur-3xl"
            />

            {/* Alpine Telemetry Pill */}
            <div className="absolute bottom-12 bg-[#082f49]/85 border border-cyan-400/40 px-5 py-2 rounded-full text-cyan-200 font-mono text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
              <span>❄️</span>
              <span>ALPINE GLACIER &bull; -14&deg;C CRYO CRYSTALLIZATION</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EFFECT 5: COZY CAFE (VOLUMETRIC ESPRESSO STEAM & ROAST AROMA)             */}
        {/* ========================================================================= */}
        {effectType === 'cafe-steam' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Warm Amber Ambient Glow */}
            <div className="absolute inset-0 bg-radial from-amber-600/25 via-amber-950/15 to-transparent" />

            {/* Volumetric Curling Steam Wisps */}
            {[0, 1, 2, 3].map((idx) => (
              <motion.div
                key={idx}
                initial={{ y: 250, opacity: 0, scale: 0.5 }}
                animate={{
                  y: -350,
                  opacity: [0, 0.7, 0.3, 0],
                  scale: [0.5, 1.6, 2.5],
                  x: [0, (idx % 2 === 0 ? 1 : -1) * 70, (idx % 2 === 0 ? -1 : 1) * 110],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4.2,
                  delay: idx * 0.9,
                  ease: 'easeOut',
                }}
                className="absolute w-48 h-96 rounded-full bg-gradient-to-t from-transparent via-amber-100/15 to-transparent blur-3xl"
              />
            ))}

            {/* Cafe Telemetry Pill */}
            <div className="absolute bottom-12 bg-[#291708]/85 border border-amber-500/40 px-5 py-2 rounded-full text-amber-200 font-mono text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
              <span>☕</span>
              <span>ETHIOPIAN YIRGACHEFFE &bull; 93&deg;C FRESH POUR-OVER AROMA</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EFFECT 6: CITY SKYLINE (NEO-TOKYO CYBERPUNK PULSE)                        */}
        {/* ========================================================================= */}
        {effectType === 'city-pulse' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Neon Perspective Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d420_1px,transparent_1px),linear-gradient(to_bottom,#d946ef20_1px,transparent_1px)] bg-[size:3rem_3rem]" />

            {/* Equalizer Audio Towers Pulsing */}
            <div className="absolute bottom-20 left-10 right-10 flex items-end justify-between h-36 opacity-70">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ['15%', `${Math.random() * 80 + 20}%`, '20%'] }}
                  transition={{ duration: 0.3 + (i % 5) * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-2 sm:w-3 bg-gradient-to-t from-cyan-500 via-fuchsia-500 to-white rounded-t-sm shadow-[0_0_12px_rgba(217,70,239,0.8)]"
                />
              ))}
            </div>

            {/* Anamorphic Laser Sweep */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.5, 1], opacity: [0, 1, 0.7] }}
              transition={{ duration: 0.8 }}
              className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_40px_#06b6d4]"
            />

            {/* Telemetry Pill */}
            <div className="absolute bottom-12 bg-[#0a0f1d]/85 border border-fuchsia-500/40 px-5 py-2 rounded-full text-fuchsia-200 font-mono text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
              <span>NEO-TOKYO PULSE &bull; 132 BPM SYNTHWAVE AUDIO MATRIX</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EFFECT 7: AUTUMN FOREST (CANOPY GUST & WHIRLWIND)                         */}
        {/* ========================================================================= */}
        {effectType === 'autumn-leaves' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Warm Golden Hour Sun Rays */}
            <div className="absolute inset-0 bg-radial from-amber-500/20 via-orange-950/10 to-transparent" />

            {/* Autumn Telemetry Pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-12 bg-[#291708]/85 border border-amber-600/40 px-6 py-2.5 rounded-full text-amber-200 font-mono text-xs shadow-xl backdrop-blur-md flex items-center gap-2"
            >
              <span>🍁</span>
              <span>CANOPY GUST VORTEX &bull; 45 MPH CRISP WOODLAND GALE</span>
            </motion.div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EFFECT 8: COSMIC WARP SPEED (GRAVITATIONAL ACCRETION)                     */}
        {/* ========================================================================= */}
        {effectType === 'cosmic-warp' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Relativistic Accretion Lensing Ring */}
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.08, 1] }}
              transition={{ rotate: { duration: 15, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
              className="w-72 h-72 rounded-full border-4 border-dashed border-cyan-400/60 shadow-[0_0_100px_rgba(56,189,248,0.8)]"
            />
            <div className="absolute w-32 h-32 rounded-full bg-indigo-600/40 blur-2xl animate-pulse" />

            {/* Cosmic Telemetry Pill */}
            <div className="absolute bottom-12 bg-black/85 border border-indigo-500/40 px-5 py-2 rounded-full text-indigo-200 font-mono text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>WARP SPEED FACTOR 9.2 &bull; EVENT HORIZON SINGULARITY</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Cinema Masterpiece Control Deck */}
      {effectType === 'baseball-crack' && (
        <motion.div
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 bg-[#090d18]/95 border-t border-white/10 z-50 px-4 py-3 flex flex-col gap-2.5 backdrop-blur-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Row: Pitch Selector & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full">
            {/* Pitch Type Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mr-1 hidden sm:inline">
                PITCH:
              </span>
              {Object.entries(PITCH_PRESETS).map(([key, config]) => {
                const active = pitchKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setPitchKey(key);
                      setPhase('incoming');
                      setPitchCounter((prev) => prev + 1);
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                      active
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30 font-black'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <span>{config.name}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-sans ${
                        active ? 'bg-black/20 text-slate-900' : 'bg-white/10 text-cyan-400'
                      }`}
                    >
                      {config.speedMph} MPH
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Playback Speed (Real-Time vs Slow Motion) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mr-1 hidden sm:inline">
                SPEED:
              </span>
              {[
                { label: '1.0x LIVE', val: 1.0 },
                { label: '0.25x SLOW', val: 0.25 },
                { label: '0.05x MATRIX', val: 0.05 },
              ].map((spd) => (
                <button
                  key={spd.val}
                  onClick={() => setPlaybackSpeed(spd.val)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                    playbackSpeed === spd.val
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                  }`}
                >
                  {spd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row: Actions & Telemetry Readouts */}
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full pt-1 border-t border-white/5 text-xs font-mono">
            {/* Live Pitch Telemetry */}
            <div className="flex items-center gap-4 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  <strong className="text-white">{currentPitch.speedMph}</strong> MPH
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  <strong className="text-white">{currentPitch.spinRpm}</strong> RPM
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <ShieldAlert
                  className={`w-3.5 h-3.5 ${
                    glassIntegrity > 40 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                />
                <span>
                  GLASS INTEGRITY:{' '}
                  <strong
                    className={
                      glassIntegrity > 40 ? 'text-emerald-400' : 'text-red-400'
                    }
                  >
                    {glassIntegrity}%
                  </strong>
                </span>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInteractiveAimMode(!interactiveAimMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  interactiveAimMode
                    ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/40 animate-pulse'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                }`}
                title="Click anywhere on screen to pitch ball at that location"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-300" />
                <span>{interactiveAimMode ? 'AIMING...' : 'AIM PITCH'}</span>
              </button>

              <button
                onClick={handleRepitch}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-600/30 border border-cyan-400/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>PITCH AGAIN</span>
              </button>

              <button
                onClick={handleRepairScreen}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/30 border border-blue-400/40"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>REPAIR LENS</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
