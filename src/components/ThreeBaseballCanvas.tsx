import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface PitchConfig {
  name: string;
  speedMph: number;
  spinRpm: number;
  spinAxis: [number, number, number]; // [x, y, z] rotation vector
  breakX: number; // lateral movement in feet
  breakY: number; // vertical movement in feet
  flightDuration: number; // in seconds
  description: string;
}

export const PITCH_PRESETS: Record<string, PitchConfig> = {
  fastball: {
    name: '4-Seam Fastball',
    speedMph: 102.4,
    spinRpm: 2480,
    spinAxis: [1, 0, 0],
    breakX: -0.2,
    breakY: 0.4,
    flightDuration: 0.58,
    description: 'Blazing 102+ MPH rising heater with 2,480 RPM backspin.',
  },
  slider: {
    name: 'Biting Slider',
    speedMph: 89.2,
    spinRpm: 2650,
    spinAxis: [0.3, 0.9, 0.2],
    breakX: 1.4,
    breakY: -0.6,
    flightDuration: 0.72,
    description: 'Late sharp lateral bite that sweeps across the lens.',
  },
  curveball: {
    name: '12-6 Curveball',
    speedMph: 78.5,
    spinRpm: 2820,
    spinAxis: [-1, 0.1, 0],
    breakX: 0.1,
    breakY: -1.8,
    flightDuration: 0.86,
    description: 'Massive rainbow arc that drops off the table into the glass.',
  },
  knuckleball: {
    name: 'Flutter Knuckleball',
    speedMph: 66.8,
    spinRpm: 45, // near zero spin creates chaotic turbulence
    spinAxis: [0.1, 0.2, 0.05],
    breakX: 0.8,
    breakY: -0.4,
    flightDuration: 1.05,
    description: 'Unpredictable butterfly flutter driven by aerodynamic wake vortexes.',
  },
};

/**
 * Creates an ultra-realistic procedural 2048x1024 equirectangular baseball texture.
 * Contains off-white leather grain, Delaware river mud scuff, red double-stitched seams,
 * Rawlings logo, and official MLB specifications stamp.
 */
export function generateRealisticBaseballTexture(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const width = 2048;
  const height = 1024;

  // 1. Color Texture Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 2. Bump Map Canvas for physical depth
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Base off-white leather background
  ctx.fillStyle = '#f8f6f0';
  ctx.fillRect(0, 0, width, height);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, width, height);

  // Add realistic micro leather grain & pore noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const bumpData = bumpCtx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const bData = bumpData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.8));

    // subtle bump variation
    const bVal = 128 + noise * 1.8;
    bData[i] = bVal;
    bData[i + 1] = bVal;
    bData[i + 2] = bVal;
  }
  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  // Authentically rubbed Delaware River Mud gradient (standard MLB preparation)
  const mudGrad = ctx.createRadialGradient(width * 0.35, height * 0.5, 50, width * 0.35, height * 0.5, 450);
  mudGrad.addColorStop(0, 'rgba(180, 150, 120, 0.22)');
  mudGrad.addColorStop(0.6, 'rgba(210, 190, 165, 0.12)');
  mudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = mudGrad;
  ctx.fillRect(0, 0, width, height);

  const mudGrad2 = ctx.createRadialGradient(width * 0.8, height * 0.4, 40, width * 0.8, height * 0.4, 380);
  mudGrad2.addColorStop(0, 'rgba(160, 135, 105, 0.18)');
  mudGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = mudGrad2;
  ctx.fillRect(0, 0, width, height);

  // Mathematical Baseball Seam Path
  // In equirectangular UV projection:
  // Theta (longitude) in [-PI, PI] -> X in [0, width]
  // Phi (latitude) in [-PI/2, PI/2] -> Y in [0, height]
  // Classical Seam parametric equation on unit sphere:
  // x = cos(t) + d * cos(3t), y = sin(t) - d * sin(3t), z = 2*sqrt(d*(1-d))*sin(2t) (normalized)
  const d = 0.38;
  const numStitches = 108 * 2; // MLB regulation is 108 double stitches (216 total stitches)
  const seamPoints: { x: number; y: number; nx: number; ny: number }[] = [];

  const steps = 1400;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const sx = Math.cos(t) + d * Math.cos(3 * t);
    const sy = Math.sin(t) - d * Math.sin(3 * t);
    const sz = 2 * Math.sqrt(d * (1 - d)) * Math.sin(2 * t);
    const len = Math.hypot(sx, sy, sz);
    const nx = sx / len;
    const ny = sy / len;
    const nz = sz / len;

    // Convert (nx, ny, nz) to UV equirectangular
    const u = (Math.atan2(ny, nx) + Math.PI) / (Math.PI * 2);
    const v = Math.acos(Math.max(-1, Math.min(1, nz))) / Math.PI;

    const px = u * width;
    const py = v * height;
    seamPoints.push({ x: px, y: py, nx, ny });
  }

  // Draw the depressed seam groove on bump map and color map
  bumpCtx.strokeStyle = '#202020';
  bumpCtx.lineWidth = 10;
  bumpCtx.lineCap = 'round';
  bumpCtx.lineJoin = 'round';

  ctx.strokeStyle = 'rgba(200, 185, 170, 0.45)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  for (let i = 1; i < seamPoints.length; i++) {
    const p1 = seamPoints[i - 1];
    const p2 = seamPoints[i];
    // prevent wraparound line jumps at texture edge
    if (Math.abs(p1.x - p2.x) < width * 0.4) {
      bumpCtx.beginPath();
      bumpCtx.moveTo(p1.x, p1.y);
      bumpCtx.lineTo(p2.x, p2.y);
      bumpCtx.stroke();

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  // Draw the 108 Red Stitches (V-stitches) with stitch holes and authentic red thread sheen
  for (let s = 0; s < numStitches; s++) {
    const t = (s / numStitches) * Math.PI * 2;
    const sx = Math.cos(t) + d * Math.cos(3 * t);
    const sy = Math.sin(t) - d * Math.sin(3 * t);
    const sz = 2 * Math.sqrt(d * (1 - d)) * Math.sin(2 * t);
    const len = Math.hypot(sx, sy, sz);
    const nx = sx / len;
    const ny = sy / len;
    const nz = sz / len;

    // Tangent along curve
    const dt = 0.002;
    const t2 = t + dt;
    const sx2 = Math.cos(t2) + d * Math.cos(3 * t2);
    const sy2 = Math.sin(t2) - d * Math.sin(3 * t2);
    const sz2 = 2 * Math.sqrt(d * (1 - d)) * Math.sin(2 * t2);
    const len2 = Math.hypot(sx2, sy2, sz2);
    const tx = (sx2 / len2 - nx) / dt;
    const ty = (sy2 / len2 - ny) / dt;
    const tz = (sz2 / len2 - nz) / dt;

    // Normal vector perpendicular to surface and tangent
    const px = ty * nz - tz * ny;
    const py = tz * nx - tx * nz;
    const pz = tx * ny - ty * nx;
    const pLen = Math.hypot(px, py, pz) || 1;

    // UV coordinates of stitch center
    const u = (Math.atan2(ny, nx) + Math.PI) / (Math.PI * 2);
    const v = Math.acos(Math.max(-1, Math.min(1, nz))) / Math.PI;
    const cx = u * width;
    const cy = v * height;

    // Draw V-stitch angled perpendicular to seam
    const stitchLength = 16;
    const perpAngle = Math.atan2(py / pLen, px / pLen);
    const slant = (s % 2 === 0 ? 1 : -1) * 0.45;

    const angle = perpAngle + slant;
    const x1 = cx - Math.cos(angle) * stitchLength;
    const y1 = cy - Math.sin(angle) * stitchLength;
    const x2 = cx + Math.cos(angle) * stitchLength;
    const y2 = cy + Math.sin(angle) * stitchLength;

    // Stitch holes (tiny dark depressions where needle punched through leather)
    ctx.fillStyle = '#6b1c1c';
    ctx.beginPath();
    ctx.arc(x1, y1, 2.5, 0, Math.PI * 2);
    ctx.arc(x2, y2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Red thread stitch body
    ctx.strokeStyle = '#c52222';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Highlight thread glint (light reflection on waxed red cotton thread)
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x1 + 0.8, y1 - 0.8);
    ctx.lineTo(x2 + 0.8, y2 - 0.8);
    ctx.stroke();

    // Bump map for raised stitches
    bumpCtx.strokeStyle = '#ffffff';
    bumpCtx.lineWidth = 5;
    bumpCtx.lineCap = 'round';
    bumpCtx.beginPath();
    bumpCtx.moveTo(x1, y1);
    bumpCtx.lineTo(x2, y2);
    bumpCtx.stroke();
  }

  // Official MLB Specifications Blue Stamps
  ctx.save();
  ctx.fillStyle = 'rgba(15, 30, 90, 0.75)';
  ctx.textAlign = 'center';

  // Center panel stamp
  const stampX = width * 0.25;
  const stampY = height * 0.5;
  ctx.font = 'bold 22px serif';
  ctx.fillText('★ OFFICIAL BALL ★', stampX, stampY - 30);
  ctx.font = 'bold 30px serif';
  ctx.fillText('MAJOR LEAGUE BASEBALL', stampX, stampY);
  ctx.font = 'italic 18px cursive, serif';
  ctx.fillText('Robert D. Manfred Jr.', stampX, stampY + 28);
  ctx.font = '14px sans-serif';
  ctx.fillText('COMMISSIONER', stampX, stampY + 46);

  // Rawlings trademark on opposite hemisphere
  const rawlingsX = width * 0.75;
  const rawlingsY = height * 0.5;
  ctx.font = '900 36px serif';
  ctx.fillText('Rawlings', rawlingsX, rawlingsY - 10);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('CUSHIONED CORK CENTER', rawlingsX, rawlingsY + 20);
  ctx.font = 'bold 13px monospace';
  ctx.fillText('RO-MLB  •  5 OZ  •  9 IN', rawlingsX, rawlingsY + 40);
  ctx.restore();

  // Create Three.js Textures
  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;

  return { colorMap, bumpMap };
}

interface ThreeBaseballCanvasProps {
  key?: React.Key;
  pitchType: string;
  playbackSpeed: number; // 1.0 = normal, 0.25 = bullet time
  isImpacted: boolean;
  onImpact: () => void;
  interactiveTarget?: { x: number; y: number } | null;
}

export function ThreeBaseballCanvas({
  pitchType,
  playbackSpeed,
  isImpacted,
  onImpact,
  interactiveTarget,
}: ThreeBaseballCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onImpactRef = useRef(onImpact);
  onImpactRef.current = onImpact;

  const pitchConfig = PITCH_PRESETS[pitchType] || PITCH_PRESETS.fastball;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8); // Lens plane is at Z = 1.0

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Dynamic 3-Point Stadium Lighting
    // 1. High Key Floodlight (stadium tower)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyLight.position.set(6, 12, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // 2. Cool Anamorphic Rim Light (stadium blue backlight)
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 2.2);
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    // 3. Ambient Stadium Turf Fill Light
    const ambientLight = new THREE.AmbientLight(0x203040, 1.4);
    scene.add(ambientLight);

    // Create 3D Realistic Baseball
    const { colorMap, bumpMap } = generateRealisticBaseballTexture();
    const geometry = new THREE.SphereGeometry(1.0, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      map: colorMap,
      bumpMap: bumpMap,
      bumpScale: 0.045,
      roughness: 0.68,
      metalness: 0.04,
    });

    const baseballMesh = new THREE.Mesh(geometry, material);
    baseballMesh.castShadow = true;
    scene.add(baseballMesh);

    // Air condensation shockwave ring when ball breaks sound barrier
    const ringGeo = new THREE.RingGeometry(1.1, 1.35, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const shockwaveRing = new THREE.Mesh(ringGeo, ringMat);
    shockwaveRing.position.set(0, 0, -0.2);
    baseballMesh.add(shockwaveRing);

    // Flight Dynamics State
    let startTime = performance.now();
    let hasImpacted = false;

    // Pitch start and destination in 3D space
    // Mound is 60 feet 6 inches away (Z = -90 in world units)
    const startZ = -100;
    const endZ = 1.35; // Impact lens plane

    const targetX = interactiveTarget ? (interactiveTarget.x / width - 0.5) * 8 : pitchConfig.breakX * 0.8;
    const targetY = interactiveTarget ? -(interactiveTarget.y / height - 0.5) * 6 : pitchConfig.breakY * 0.8;

    const startX = 0.5; // right-handed pitcher release point
    const startY = 1.2;

    const flightDurationMs = (pitchConfig.flightDuration * 1000) / playbackSpeed;

    let animId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / flightDurationMs);

      if (!hasImpacted) {
        // Aerodynamic flight curve (combining release trajectory + Magnus curve break)
        // Non-linear easeIn acceleration towards viewer
        const easeProgress = Math.pow(progress, 1.65);
        const curZ = startZ + (endZ - startZ) * easeProgress;

        // Break occurs predominantly in the last 40% of pitch
        const breakFactor = Math.pow(progress, 2.5);
        const curX = startX + (targetX - startX) * progress + (pitchConfig.breakX * 1.2) * breakFactor;
        const curY = startY + (targetY - startY) * progress + (pitchConfig.breakY * 1.2) * breakFactor;

        baseballMesh.position.set(curX, curY, curZ);

        // Realistic RPM rotational tumble
        const spinSpeed = (pitchConfig.spinRpm / 60) * Math.PI * 2 * (elapsed / 1000) * playbackSpeed;
        baseballMesh.rotation.x = spinSpeed * pitchConfig.spinAxis[0];
        baseballMesh.rotation.y = spinSpeed * pitchConfig.spinAxis[1];
        baseballMesh.rotation.z = spinSpeed * pitchConfig.spinAxis[2];

        // Shockwave vapor cone pulses at high velocities
        shockwaveRing.scale.setScalar(1.0 + Math.sin(elapsed * 0.02) * 0.15);
        shockwaveRing.lookAt(camera.position);

        if (progress >= 1) {
          hasImpacted = true;
          baseballMesh.position.set(targetX, targetY, endZ);
          // Elastic compression on glass impact: flatten Z by 18%
          baseballMesh.scale.set(1.08, 1.08, 0.82);
          shockwaveRing.visible = false;
          onImpactRef.current();
        }
      } else {
        // Lodged in broken glass: subtle micro-wobble tension
        const wobble = Math.sin((currentTime - startTime) * 0.01) * 0.015;
        baseballMesh.rotation.z += wobble * 0.1;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      colorMap.dispose();
      bumpMap.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [pitchType, playbackSpeed, interactiveTarget]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
