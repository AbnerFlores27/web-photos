import { useEffect, useState } from 'react';
import {
  playBaseballGlassCrackSound,
  playWaterSplashSound,
  playFreezeSound,
  playWarpSound,
  playChimeSound,
} from '../audioEffects';
import { Sparkles, X, Wrench, Volume2 } from 'lucide-react';

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

export function PhotoEffectOverlay({
  effectType,
  photoTitle,
  onClose,
}: PhotoEffectOverlayProps) {
  const [phase, setPhase] = useState<'incoming' | 'impact' | 'settled'>('incoming');
  const [screenShake, setScreenShake] = useState(false);

  useEffect(() => {
    if (!effectType) return;

    setPhase('incoming');
    setScreenShake(false);

    if (effectType === 'baseball-crack') {
      // Baseball flies from small in distance to huge in 700ms
      const impactTimer = setTimeout(() => {
        setPhase('impact');
        setScreenShake(true);
        playBaseballGlassCrackSound();

        // Stop shaking after 500ms, keep cracked screen
        setTimeout(() => {
          setScreenShake(false);
          setPhase('settled');
        }, 500);
      }, 700);

      return () => clearTimeout(impactTimer);
    } else if (effectType === 'ocean-splash') {
      playWaterSplashSound();
      setPhase('settled');
    } else if (effectType === 'alpine-frost') {
      playFreezeSound();
      setPhase('settled');
    } else if (effectType === 'cosmic-warp') {
      playWarpSound();
      setPhase('settled');
    } else if (effectType === 'puppy-bounce') {
      playChimeSound();
      setPhase('settled');
    } else {
      setPhase('settled');
    }
  }, [effectType]);

  if (!effectType) return null;

  return (
    <div
      id="photo-interactive-fx-layer"
      className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center cursor-pointer select-none transition-colors duration-200 ${
        screenShake ? 'animate-screen-shake' : ''
      }`}
      onClick={onClose}
      style={{
        backgroundColor:
          effectType === 'baseball-crack' && phase !== 'incoming'
            ? 'rgba(0, 0, 0, 0.45)'
            : 'rgba(0, 0, 0, 0.65)',
        backdropFilter:
          effectType === 'baseball-crack' && phase !== 'incoming'
            ? 'blur(2px)'
            : 'blur(8px)',
      }}
    >
      {/* 1. BASEBALL & CRACKED SCREEN EFFECT (Mike Trout & Stadium) */}
      {effectType === 'baseball-crack' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
          {/* Phase 1: Incoming baseball flying from deep in field toward user screen */}
          {phase === 'incoming' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center border-2 border-red-500/80 animate-baseball-approach"
                style={{
                  boxShadow: '0 0 50px 10px rgba(255, 255, 255, 0.9), 0 0 100px rgba(239, 68, 68, 0.7)',
                }}
              >
                {/* Baseball red seam stitching */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                  <circle cx="50" cy="50" r="48" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                  {/* Left curve stitching */}
                  <path
                    d="M 28 6 A 40 40 0 0 0 28 94"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3.5"
                    strokeDasharray="4 3"
                  />
                  {/* Right curve stitching */}
                  <path
                    d="M 72 6 A 40 40 0 0 1 72 94"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3.5"
                    strokeDasharray="4 3"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Phase 2 & 3: IMPACT! Shattered cracked glass overlay */}
          {phase !== 'incoming' && (
            <>
              {/* Giant realistic spiderweb cracked glass pattern across entire viewport */}
              <svg
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full opacity-95 animate-in zoom-in-110 duration-150"
              >
                {/* Center Impact Hole */}
                <circle cx="500" cy="500" r="65" fill="rgba(0,0,0,0.7)" stroke="#ffffff" strokeWidth="4" />
                <circle cx="500" cy="500" r="110" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeDasharray="18 12" />
                <circle cx="500" cy="500" r="180" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="30 15" />
                <circle cx="500" cy="500" r="280" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="45 20" />
                <circle cx="500" cy="500" r="420" fill="none" stroke="#64748b" strokeWidth="1.2" strokeDasharray="60 30" />

                {/* Heavy Radial Fracture Cracks Splitting the Screen */}
                <g stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.95">
                  <path d="M 500 500 L 120 0 L 80 50" />
                  <path d="M 500 500 L 450 0 L 410 70" />
                  <path d="M 500 500 L 820 0 L 890 80" />
                  <path d="M 500 500 L 1000 210 L 930 290" />
                  <path d="M 500 500 L 1000 580 L 880 640" />
                  <path d="M 500 500 L 920 1000 L 820 900" />
                  <path d="M 500 500 L 580 1000 L 530 880" />
                  <path d="M 500 500 L 180 1000 L 250 890" />
                  <path d="M 500 500 L 0 740 L 90 690" />
                  <path d="M 500 500 L 0 380 L 120 410" />
                  <path d="M 500 500 L 0 90 L 70 140" />
                </g>

                {/* Fine Secondary Web Cracks */}
                <g stroke="#cbd5e1" strokeWidth="1.6" fill="none" opacity="0.85">
                  <path d="M 420 420 L 320 310 L 210 360" />
                  <path d="M 580 430 L 710 330 L 790 390" />
                  <path d="M 570 560 L 720 680 L 830 620" />
                  <path d="M 430 580 L 310 720 L 200 680" />
                  <path d="M 480 380 L 540 280 L 630 290" />
                  <path d="M 380 490 L 220 520 L 180 460" />
                  <path d="M 640 480 L 790 530 L 830 470" />
                  <path d="M 490 640 L 440 780 L 380 820" />
                </g>

                {/* Scattered Sharp Shards */}
                <polygon points="460,450 490,430 475,470" fill="rgba(255,255,255,0.7)" stroke="#ffffff" />
                <polygon points="530,460 560,440 545,480" fill="rgba(255,255,255,0.7)" stroke="#ffffff" />
                <polygon points="470,530 490,560 450,550" fill="rgba(255,255,255,0.7)" stroke="#ffffff" />
                <polygon points="540,520 570,550 530,560" fill="rgba(255,255,255,0.7)" stroke="#ffffff" />
              </svg>

              {/* The baseball embedded directly in the broken glass hole */}
              <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-slate-300 animate-in zoom-in-50 duration-200">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <radialGradient id="ballShade" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="70%" stopColor="#f1f5f9" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="url(#ballShade)" />
                  {/* Left Stitches */}
                  <path
                    d="M 28 6 A 40 40 0 0 0 28 94"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3.5"
                    strokeDasharray="4 3"
                  />
                  {/* Right Stitches */}
                  <path
                    d="M 72 6 A 40 40 0 0 1 72 94"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3.5"
                    strokeDasharray="4 3"
                  />
                </svg>

                {/* Red Seam Detail */}
                <div className="absolute inset-0 rounded-full border-4 border-red-500/20 pointer-events-none" />
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. PUPPY BOUNCE EFFECT */}
      {effectType === 'puppy-bounce' && (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          <div className="text-center animate-in zoom-in-75 duration-300">
            <div className="text-7xl sm:text-9xl animate-bounce">🎾</div>
            <div className="text-4xl sm:text-6xl flex justify-center gap-4 mt-4 animate-pulse">
              <span>🐾</span>
              <span>💛</span>
              <span>🐾</span>
            </div>
            <p className="mt-4 text-xl sm:text-2xl font-black text-amber-300 drop-shadow-lg">
              Good Boy Energy Incoming!
            </p>
          </div>
        </div>
      )}

      {/* 3. COASTAL SUNSET WATER SPLASH */}
      {effectType === 'ocean-splash' && (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          {/* Water droplets overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-amber-500/20 to-transparent" />
          <div className="text-center relative z-10 animate-in zoom-in-90 duration-300">
            <div className="text-8xl sm:text-9xl animate-pulse">🌊</div>
            <p className="mt-4 text-2xl font-black text-blue-200 drop-shadow-md">
              Pacific Saltwater Mist &amp; Golden Wave
            </p>
          </div>
        </div>
      )}

      {/* 4. ALPINE MOUNTAIN FROST */}
      {effectType === 'alpine-frost' && (
        <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
          {/* Frost border vignette */}
          <div
            className="absolute inset-0 border-[28px] sm:border-[44px] border-cyan-100/60 rounded-3xl"
            style={{ filter: 'blur(10px)' }}
          />
          <div className="text-center relative z-10">
            <div className="text-8xl animate-spin" style={{ animationDuration: '10s' }}>
              ❄️
            </div>
            <p className="mt-4 text-2xl font-black text-cyan-200 drop-shadow-lg">
              Sub-Zero Alpine Freeze &bull; High Altitude Wind
            </p>
          </div>
        </div>
      )}

      {/* 5. COZY CAFE STEAM */}
      {effectType === 'cafe-steam' && (
        <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl sm:text-9xl animate-pulse">☕</div>
            <p className="mt-4 text-2xl font-black text-amber-200 drop-shadow-lg">
              Fresh Artisan Roast &bull; Aromatic Steam
            </p>
          </div>
        </div>
      )}

      {/* 6. CITY LIGHTS NEON PULSE */}
      {effectType === 'city-pulse' && (
        <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
          <div className="text-center relative z-10">
            <div className="text-8xl sm:text-9xl">⚡</div>
            <p className="mt-4 text-2xl font-black text-indigo-200 drop-shadow-lg">
              Metropolitan Pulse &bull; Midnight Blue Hour
            </p>
          </div>
        </div>
      )}

      {/* 7. AUTUMN FOREST LEAVES */}
      {effectType === 'autumn-leaves' && (
        <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl sm:text-9xl animate-bounce">🍁</div>
            <p className="mt-4 text-2xl font-black text-amber-400 drop-shadow-lg">
              Woodland Canopy Sunbeam Gust
            </p>
          </div>
        </div>
      )}

      {/* 8. COSMIC STAR WARP */}
      {effectType === 'cosmic-warp' && (
        <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl sm:text-9xl animate-pulse">✨</div>
            <p className="mt-4 text-2xl font-black text-purple-300 drop-shadow-lg">
              Interstellar Warp Velocity &bull; Bortle Class 1
            </p>
          </div>
        </div>
      )}

      {/* Floating Control Banner at Bottom (Interactive Repair / Dismiss) */}
      <div
        className="absolute bottom-6 sm:bottom-10 z-30 pointer-events-auto flex items-center gap-3 bg-[#0d0d2b]/95 border border-white/20 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-white text-xs sm:text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 font-bold text-[#4da3ff]">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>Interactive Effect: {photoTitle}</span>
        </div>

        <button
          id="repair-screen-btn"
          onClick={onClose}
          className="ml-2 px-3.5 py-1.5 bg-[#4da3ff] hover:bg-[#328bf5] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {effectType === 'baseball-crack' ? (
            <>
              <Wrench className="w-3.5 h-3.5" />
              <span>Repair Screen</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Done</span>
            </>
          )}
        </button>

        <button
          id="close-fx-btn"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-lg cursor-pointer"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
