import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Crosshair,
  Gauge,
  Zap,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import {
  playBatCrackSound,
  playGloveCatchSound,
  playCrowdRoarSound,
  playCrowdGaspSound,
} from '../audioEffects';

interface BaseballCatchOverlayProps {
  photoTitle: string;
  onClose: () => void;
}

export interface BatterPreset {
  id: string;
  batterName: string;
  batterTeam: string;
  exitVelocityMph: number;
  launchAngleDeg: number;
  projectedDistFt: number;
  apexFt: number;
  flightDurationSec: number;
  targetOffset: { x: number; y: number }; // normalized -0.5 to 0.5 relative to center
  hitDescription: string;
}

export const BATTER_PRESETS: BatterPreset[] = [
  {
    id: 'trout-moonshot',
    batterName: 'Mike Trout #27',
    batterTeam: 'LA Angels',
    exitVelocityMph: 109.8,
    launchAngleDeg: 29,
    projectedDistFt: 438,
    apexFt: 98,
    flightDurationSec: 2.8,
    targetOffset: { x: 0.05, y: -0.05 }, // landing near center-right bleachers
    hitDescription: 'Towering 438-foot moonshot skyrocketing directly into your section!',
  },
  {
    id: 'ohtani-laser',
    batterName: 'Shohei Ohtani #17',
    batterTeam: 'LA Dodgers',
    exitVelocityMph: 115.2,
    launchAngleDeg: 22,
    projectedDistFt: 442,
    apexFt: 76,
    flightDurationSec: 2.2,
    targetOffset: { x: 0.22, y: 0.1 }, // screams down the right-field line
    hitDescription: '115.2 MPH screaming laser missile smoking into the lower seats!',
  },
  {
    id: 'judge-blast',
    batterName: 'Aaron Judge #99',
    batterTeam: 'NY Yankees',
    exitVelocityMph: 113.6,
    launchAngleDeg: 34,
    projectedDistFt: 465,
    apexFt: 118,
    flightDurationSec: 3.2,
    targetOffset: { x: -0.18, y: -0.15 }, // left field upper deck
    hitDescription: 'Colossal 465-foot upper deck bomb soaring into the stadium twilight!',
  },
  {
    id: 'grand-slam',
    batterName: 'Walk-Off Grand Slam',
    batterTeam: 'Bottom 9th &bull; Full Count',
    exitVelocityMph: 111.4,
    launchAngleDeg: 28,
    projectedDistFt: 425,
    apexFt: 92,
    flightDurationSec: 2.6,
    targetOffset: { x: -0.02, y: 0.04 },
    hitDescription: 'High drama walk-off grand slam heading straight for your hands!',
  },
];

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
}

export function BaseballCatchOverlay({ photoTitle, onClose }: BaseballCatchOverlayProps) {
  const [selectedBatterIndex, setSelectedBatterIndex] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Play Sequence State: 'pitching' | 'crack' | 'flying' | 'caught' | 'missed'
  const [playState, setPlayState] = useState<'pitching' | 'crack' | 'flying' | 'caught' | 'missed'>(
    'pitching'
  );
  const [playCounter, setPlayCounter] = useState<number>(0);

  // Glove Position (pixels)
  const [glovePos, setGlovePos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Ball 2D Screen Position during flight
  const [ballPos, setBallPos] = useState<{ x: number; y: number; scale: number; rotation: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.45,
    scale: 0.08,
    rotation: 0,
  });

  // Exact Landing Point on screen
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Catch stats
  const [catchStreak, setCatchStreak] = useState<number>(0);
  const [totalCatches, setTotalCatches] = useState<number>(0);
  const [reactionTimeMs, setReactionTimeMs] = useState<number>(0);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const flightAnimRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);
  const hasResolvedRef = useRef<boolean>(false);

  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiPiecesRef = useRef<ConfettiPiece[]>([]);
  const confettiAnimRef = useRef<number | null>(null);

  const currentBatter = BATTER_PRESETS[selectedBatterIndex];

  // Mouse & Touch Glove Tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setGlovePos({ x: e.clientX, y: e.clientY });
  };

  // Launch Play Sequence
  useEffect(() => {
    setPlayState('pitching');
    hasResolvedRef.current = false;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Calculate screen landing target based on preset offset
    const landingX = w / 2 + currentBatter.targetOffset.x * w;
    const landingY = h * 0.55 + currentBatter.targetOffset.y * h;
    setTargetPoint({ x: landingX, y: landingY });

    // 1. Pitch sequence (0.6s windup)
    const pitchTimer = setTimeout(() => {
      // 2. Bat Crack!
      setPlayState('crack');
      setIsFlashActive(true);
      if (!isAudioMuted) playBatCrackSound();
      setTimeout(() => setIsFlashActive(false), 140);

      // 3. Ball launches into flight
      setTimeout(() => {
        setPlayState('flying');
        flightStartTimeRef.current = performance.now();
        startBallFlight(landingX, landingY);
      }, 100);
    }, 600);

    return () => {
      clearTimeout(pitchTimer);
      if (flightAnimRef.current) cancelAnimationFrame(flightAnimRef.current);
    };
  }, [playCounter, selectedBatterIndex]);

  // Ball Flight Ballistics
  const startBallFlight = (destX: number, destY: number) => {
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.44; // home plate at distance
    const totalDurationMs = currentBatter.flightDurationSec * 1000;

    const loop = (now: number) => {
      const elapsed = now - flightStartTimeRef.current;
      const progress = Math.min(1, elapsed / totalDurationMs);

      // Arc apex: rises up into stadium lights, then descends into bleachers
      // Parabolic vertical offset: 4 * progress * (1 - progress)
      const arcHeight = window.innerHeight * 0.38;
      const arcY = -Math.sin(progress * Math.PI) * arcHeight;

      // Accelerate towards camera (exponential scale growth from distant speck to giant 120px ball)
      const easeDist = Math.pow(progress, 2.2);
      const curX = originX + (destX - originX) * progress;
      const curY = originY + (destY - originY) * progress + arcY;
      const curScale = 0.08 + (1.2 - 0.08) * easeDist;
      const curRot = progress * 1440; // realistic spin revolutions

      setBallPos({
        x: curX,
        y: curY,
        scale: curScale,
        rotation: curRot,
      });

      // Arrival moment (within last 3% of trajectory)
      if (progress >= 0.98 && !hasResolvedRef.current) {
        hasResolvedRef.current = true;
        resolveCatch(destX, destY);
        return;
      }

      if (progress < 1) {
        flightAnimRef.current = requestAnimationFrame(loop);
      }
    };

    flightAnimRef.current = requestAnimationFrame(loop);
  };

  // Check if user caught the ball with the glove
  const resolveCatch = (destX: number, destY: number) => {
    // Distance between glove center and ball landing point
    const dx = glovePos.x - destX;
    const dy = glovePos.y - destY;
    const dist = Math.hypot(dx, dy);

    // Generous, rewarding catch radius (110px accommodates glove webbing + touch screens)
    const catchRadius = 115;

    if (dist <= catchRadius) {
      // SUCCESS: CATCH!
      setPlayState('caught');
      setBallPos((prev) => ({ ...prev, x: glovePos.x, y: glovePos.y, scale: 1.05 }));
      setCatchStreak((prev) => prev + 1);
      setTotalCatches((prev) => prev + 1);
      setReactionTimeMs(Math.round(180 + Math.random() * 120));

      if (!isAudioMuted) {
        playGloveCatchSound();
        setTimeout(() => playCrowdRoarSound(), 80);
      }
      triggerConfetti();
    } else {
      // MISSED: Off the bleacher seats
      setPlayState('missed');
      setCatchStreak(0);
      if (!isAudioMuted) {
        playCrowdGaspSound();
      }
    }
  };

  // Immediate Click/Tap on Screen: Attempt instant dive catch!
  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playState !== 'flying') return;
    setGlovePos({ x: e.clientX, y: e.clientY });

    // If ball is in deep descent (last 40% of flight), tap allows diving catch
    const elapsed = performance.now() - flightStartTimeRef.current;
    const progress = elapsed / (currentBatter.flightDurationSec * 1000);

    if (progress >= 0.65 && !hasResolvedRef.current) {
      hasResolvedRef.current = true;
      if (flightAnimRef.current) cancelAnimationFrame(flightAnimRef.current);
      resolveCatch(targetPoint.x, targetPoint.y);
    }
  };

  // Confetti Particle Explosion
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f59e0b', '#38bdf8', '#ef4444', '#10b981', '#ffffff', '#ec4899'];
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 18 + 8;
      pieces.push({
        id: i,
        x: targetPoint.x,
        y: targetPoint.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
      });
    }
    confettiPiecesRef.current = pieces;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        if (p.y > canvas.height + 40) pieces.splice(i, 1);
      }

      if (pieces.length > 0) {
        confettiAnimRef.current = requestAnimationFrame(render);
      }
    };
    confettiAnimRef.current = requestAnimationFrame(render);
  };

  // Next Pitch
  const handleNextPitch = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlayCounter((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      id="baseball-catch-stadium-arena"
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between select-none bg-slate-950 cursor-crosshair"
      onPointerMove={handlePointerMove}
      onClick={handleScreenTap}
    >
      {/* 1. Header Toolbar */}
      <div
        className="w-full bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 z-50 flex items-center justify-between text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div>
            <h2 className="text-sm sm:text-base font-bold font-mono tracking-wide text-amber-300 flex items-center gap-2">
              <span>🏟️ STADIUM STANDS CATCH &bull; {currentBatter.batterName}</span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40">
                LIVE GAMEPLAY
              </span>
            </h2>
            <p className="text-[11px] text-slate-300 font-sans">{currentBatter.hitDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold transition-colors cursor-pointer border border-red-500/40 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>EXIT</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Stadium Environment: Outfield Bleachers View */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Sky with Twilight Stadium Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#064e3b]" />

        {/* Stadium Floodlight Towers */}
        <div className="absolute top-4 left-10 w-24 h-40 pointer-events-none opacity-85">
          <div className="w-20 h-10 bg-amber-100/90 rounded-t-md shadow-[0_0_80px_rgba(254,240,138,0.9)] flex items-center justify-around px-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-7 bg-white rounded-full blur-[1px]" />
            ))}
          </div>
          <div className="w-2.5 h-28 bg-slate-600 mx-auto" />
        </div>

        <div className="absolute top-4 right-10 w-24 h-40 pointer-events-none opacity-85">
          <div className="w-20 h-10 bg-amber-100/90 rounded-t-md shadow-[0_0_80px_rgba(254,240,138,0.9)] flex items-center justify-around px-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-7 bg-white rounded-full blur-[1px]" />
            ))}
          </div>
          <div className="w-2.5 h-28 bg-slate-600 mx-auto" />
        </div>

        {/* Distant Grandstands & Crowd */}
        <div className="absolute top-[28%] left-0 right-0 h-32 bg-[#1e293b]/70 border-b border-amber-500/30 pointer-events-none flex items-center justify-around opacity-40">
          <div className="w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:8px_8px]" />
        </div>

        {/* Emerald Outfield Grass & Infield Diamond at Distance */}
        <div className="absolute top-[38%] left-0 right-0 h-44 bg-gradient-to-b from-[#065f46] to-[#047857] pointer-events-none shadow-inner flex items-center justify-center">
          {/* Home Plate & Infield Clay Diamond in Distance */}
          <div className="relative w-36 h-28 bg-[#9a3412]/80 border-2 border-white/60 transform rotate-45 shadow-md flex items-center justify-center">
            <div className="w-16 h-16 bg-[#047857] rounded-sm" />
            {/* Batter Figure */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-8 bg-white rounded-full shadow-lg" />
          </div>
        </div>

        {/* Outfield Wall with Distance Marker */}
        <div className="absolute top-[58%] left-0 right-0 h-16 bg-gradient-to-b from-[#15803d] via-[#166534] to-[#14532d] border-t-4 border-yellow-400 shadow-xl flex items-center justify-center pointer-events-none">
          <span className="text-yellow-300 font-mono font-black text-xl tracking-widest drop-shadow">
            ★ 400 FT &bull; ANGEL STADIUM ★
          </span>
        </div>

        {/* Foreground: Bleacher Seats & Stadium Railing where YOU are sitting */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-slate-900 via-slate-800 to-transparent pointer-events-none border-t-2 border-slate-700/50">
          {/* Yellow Stadium Safety Railing */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 shadow-md" />
          <div className="flex justify-around pt-6 opacity-35">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-14 h-20 bg-blue-900 rounded-t-xl border border-blue-700 shadow" />
            ))}
          </div>
        </div>

        {/* Bat Impact Flash */}
        {isFlashActive && (
          <div className="absolute inset-0 bg-white/80 z-40 pointer-events-none transition-opacity duration-100" />
        )}

        {/* Canvas for Confetti */}
        <canvas ref={confettiCanvasRef} className="absolute inset-0 z-30 pointer-events-none" />

        {/* 3. DYNAMIC LANDING TARGET RETICLE */}
        {(playState === 'flying' || playState === 'crack') && (
          <div
            className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: targetPoint.x, top: targetPoint.y }}
          >
            {/* Pulsing Concentric Rings */}
            <div className="relative w-36 h-36 flex items-center justify-center animate-spin">
              <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-red-400/60 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full border-2 border-amber-300/80" />
              <div className="absolute w-16 h-16 rounded-full border-2 border-red-500 bg-red-500/20" />
              <Crosshair className="w-8 h-8 text-amber-400" />
            </div>
            {/* Catch Zone Label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold shadow">
              🎯 BALL LANDING HERE
            </div>
          </div>
        )}

        {/* 4. THE 3D BALL FLYING THROUGH THE AIR */}
        {(playState === 'flying' || playState === 'caught' || playState === 'missed') && (
          <div
            className="absolute z-30 pointer-events-none transition-transform duration-75"
            style={{
              left: ballPos.x,
              top: ballPos.y,
              transform: `translate(-50%, -50%) scale(${ballPos.scale}) rotate(${ballPos.rotation}deg)`,
            }}
          >
            {/* Baseball Sphere Graphic */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#ffffff] via-[#f5f5f4] to-[#d6d3d1] shadow-[0_12px_24px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(0,0,0,0.3)] border border-slate-200 flex items-center justify-center">
              {/* Red Seams with Stitches */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" fill="none">
                <path
                  d="M 28 15 C 48 38, 48 62, 28 85"
                  stroke="#dc2626"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="4 3"
                />
                <path
                  d="M 72 15 C 52 38, 52 62, 72 85"
                  stroke="#dc2626"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="4 3"
                />
              </svg>
              {/* Rawlings MLB stamp in center */}
              <div className="text-[7px] font-serif font-black text-blue-900 tracking-tighter uppercase opacity-80">
                RAWLINGS
              </div>
            </div>
          </div>
        )}

        {/* 5. PLAYER'S FIELDING GLOVE (FOLLOWS CURSOR / TOUCH) */}
        <div
          className="absolute z-35 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: glovePos.x, top: glovePos.y }}
        >
          {/* Realistic Rawlings Leather Baseball Glove SVG */}
          <div className="relative w-28 h-28 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              {/* Glove Palm / Body (Rich Tan Leather) */}
              <path
                d="M 20 50 C 15 25, 35 10, 50 15 C 65 10, 85 25, 80 50 C 85 75, 70 92, 50 92 C 30 92, 15 75, 20 50 Z"
                fill="url(#glove-leather)"
                stroke="#78350f"
                strokeWidth="2.5"
              />
              {/* Leather Fingers Webbing */}
              <path
                d="M 32 15 L 34 40 M 44 12 L 44 42 M 56 12 L 56 42 M 68 15 L 66 40"
                stroke="#451a03"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Cross Laces on Web */}
              <path
                d="M 32 25 L 68 25 M 34 35 L 66 35"
                stroke="#b45309"
                strokeWidth="2.5"
                strokeDasharray="3 2"
              />
              {/* Glove Pocket / Palm indentation */}
              <circle cx="50" cy="58" r="18" fill="#5c2409" opacity="0.65" />
              {/* Rawlings Red Patch */}
              <rect x="42" y="80" width="16" height="8" rx="2" fill="#dc2626" />
              <text x="50" y="86" fontSize="5" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                RAWLINGS
              </text>

              <defs>
                <radialGradient id="glove-leather" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="70%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
                </radialGradient>
              </defs>
            </svg>

            {/* Target Alignment Crosshair in Center of Pocket */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border border-amber-300/80 bg-amber-400/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 6. OUTCOME MODALS: CATCH vs MISS */}
        <AnimatePresence>
          {playState === 'caught' && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#0f172a]/95 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-center max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/50 mx-auto flex items-center justify-center text-3xl mb-3 animate-bounce">
                🏆
              </div>
              <h3 className="text-xl font-black font-mono text-amber-300 uppercase tracking-wider">
                SPECTACULAR CATCH!
              </h3>
              <p className="text-sm font-semibold text-white mt-1">
                You caught {currentBatter.batterName}’s {currentBatter.projectedDistFt} FT Home Run!
              </p>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2 mt-4 bg-white/5 p-3 rounded-2xl border border-white/10 text-xs font-mono">
                <div>
                  <span className="text-slate-400">EXIT VELO:</span>
                  <div className="text-amber-300 font-bold">{currentBatter.exitVelocityMph} MPH</div>
                </div>
                <div>
                  <span className="text-slate-400">DISTANCE:</span>
                  <div className="text-amber-300 font-bold">{currentBatter.projectedDistFt} FT</div>
                </div>
                <div>
                  <span className="text-slate-400">REACTION TIME:</span>
                  <div className="text-emerald-400 font-bold">{reactionTimeMs} MS</div>
                </div>
                <div>
                  <span className="text-slate-400">CATCH STREAK:</span>
                  <div className="text-cyan-400 font-bold">{catchStreak} IN A ROW 🔥</div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleNextPitch}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black font-mono text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>NEXT BATTER UP</span>
                </button>
              </div>
            </motion.div>
          )}

          {playState === 'missed' && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#0f172a]/95 border-2 border-red-500/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-center max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400/50 mx-auto flex items-center justify-center text-3xl mb-3">
                ⚾💨
              </div>
              <h3 className="text-xl font-black font-mono text-red-400 uppercase tracking-wider">
                OFF THE BLEACHERS!
              </h3>
              <p className="text-sm font-semibold text-slate-200 mt-1">
                The ball bounced off the stadium seats just out of reach!
              </p>

              <div className="mt-4 text-xs font-mono text-slate-400 bg-white/5 p-3 rounded-2xl border border-white/10">
                Move your glove over the red landing target to make the catch!
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleNextPitch}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black font-mono text-xs transition-all cursor-pointer shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>TRY AGAIN &bull; SWING</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Control Deck: Batter Presets & Catch Leaderboard */}
      <div
        className="w-full bg-[#080d1a]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-50 flex flex-col gap-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
          {/* Batter Switch Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mr-1 hidden sm:inline">
              SELECT HIT:
            </span>
            {BATTER_PRESETS.map((b, idx) => {
              const active = selectedBatterIndex === idx;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBatterIndex(idx);
                    setPlayCounter((prev) => prev + 1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 font-black'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <span>{b.batterName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                      active ? 'bg-black/20 text-slate-900' : 'bg-white/10 text-amber-300'
                    }`}
                  >
                    {b.projectedDistFt} FT
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action & Score Telemetry */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>
                CATCHES: <strong className="text-white">{totalCatches}</strong>
              </span>
              {catchStreak > 1 && (
                <span className="text-orange-400 flex items-center gap-0.5">
                  <Flame className="w-3 h-3" />
                  {catchStreak}x
                </span>
              )}
            </div>

            <button
              onClick={handleNextPitch}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-600/30 border border-cyan-400/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>BATTER UP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
