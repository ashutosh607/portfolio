import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';

// ============================================================================
// WORD SEQUENCE CONFIGURATION
// ============================================================================
const INTRO_WORDS = [
  { text: 'IMAGINE.', color: '#F5F1EB', isFinal: false },
  { text: 'DESIGN.', color: '#F5F1EB', isFinal: false },
  { text: 'DEVELOP.', color: '#F5F1EB', isFinal: false },
  { text: 'CREATE.', color: '#F5F1EB', isFinal: false },
  { text: 'SHINOBI.', color: '#B73D32', isFinal: true },
];

// Four progressive tonal stages per palette as dust ages and cools into ash
const IVORY_TONES = [
  '245, 241, 235', // Fresh glyph ivory (#F5F1EB)
  '224, 216, 204', // Warm drifting parchment dust
  '176, 167, 154', // Weathered ash
  '112, 104, 94',  // Fading shadow ash
];

const CRIMSON_TONES = [
  '183, 61, 50',   // Fresh muted crimson (#B73D32)
  '202, 74, 60',   // Cinnabar dust mote
  '138, 42, 33',   // Deep crimson ash
  '84, 26, 21',    // Dark ember ash
];

const ALPHA_STEPS = 20;
const EROSION_BINS = 256;

// Fast deterministic 2D value/gradient noise for organic erosion fronts
function hash2D(ix, iy, seed) {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function smoothNoise2D(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy, seed);
  const b = hash2D(ix + 1, iy, seed);
  const c = hash2D(ix, iy + 1, seed);
  const d = hash2D(ix + 1, iy + 1, seed);

  const v = a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  return v * 2 - 1; // [-1, 1]
}

function fbm2D(x, y, seed) {
  return (
    smoothNoise2D(x, y, seed) * 0.65 +
    smoothNoise2D(x * 2.35, y * 2.35, seed + 101) * 0.35
  );
}

// Measure & draw tracked editorial text onto a 2D canvas context
function measureTrackedText(ctx, text, trackingPx) {
  let totalWidth = 0;
  const advances = new Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const w = ctx.measureText(text[i]).width;
    advances[i] = w;
    totalWidth += w;
    if (i < text.length - 1) totalWidth += trackingPx;
  }
  return { totalWidth, advances };
}

function drawTrackedText(ctx, text, centerX, centerY, trackingPx) {
  const { totalWidth, advances } = measureTrackedText(ctx, text, trackingPx);
  let cursorX = centerX - totalWidth * 0.5;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cursorX, centerY);
    cursorX += advances[i] + trackingPx;
  }
}

export default function LoadingScreen({ onComplete }) {
  const { active, progress } = useProgress();
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [isUnveiling, setIsUnveiling] = useState(false);

  const overlayRef = useRef(null);
  const backdropRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const glyphCanvasRefs = useRef([]);

  const timelineRef = useRef(null);
  const rafRef = useRef(null);
  const wordsDataRef = useRef([]);
  const isWaitingForAssetsRef = useRef(false);
  const isFinishedRef = useRef(false);

  // Live loading state refs so GSAP callbacks never read stale closures
  const assetsReadyRef = useRef(false);
  useEffect(() => {
    if (!active && progress >= 100) {
      assetsReadyRef.current = true;
    } else if (progress >= 100) {
      assetsReadyRef.current = true;
    }
    // If timeline paused on SHINOBI waiting for essential assets, resume immediately
    if (assetsReadyRef.current && isWaitingForAssetsRef.current && timelineRef.current) {
      isWaitingForAssetsRef.current = false;
      timelineRef.current.play();
    }
  }, [active, progress]);

  // Safety timeout: never allow failed or stalled nonessential 3D assets to block the portfolio
  useEffect(() => {
    const safetyTimer = window.setTimeout(() => {
      assetsReadyRef.current = true;
      if (isWaitingForAssetsRef.current && timelineRef.current) {
        isWaitingForAssetsRef.current = false;
        timelineRef.current.play();
      }
    }, 7600);
    return () => window.clearTimeout(safetyTimer);
  }, []);

  // Discreet Skip Intro handler
  const handleSkipIntro = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    setIsUnveiling(true);
    const overlay = overlayRef.current;
    if (overlay) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.42,
        ease: 'power2.inOut',
        onComplete: () => {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setIsUnmounted(true);
          onComplete?.();
        },
      });
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsUnmounted(true);
      onComplete?.();
    }
  }, []);

  // Main Cinematic Dust Intro Setup & Animation Loop
  useEffect(() => {
    if (isUnmounted) return undefined;

    let cancelled = false;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect device capability for adaptive particle density & DPR capping
    const getDeviceSpecs = () => {
      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 720;
      const cores = navigator.hardwareConcurrency || 8;
      const memory = navigator.deviceMemory || 8;
      const isMobile = vw <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      const isLowPower = isMobile || cores <= 4 || memory <= 4;
      const dpr = Math.min(window.devicePixelRatio || 1, isLowPower ? 1.5 : 2.0);
      return { vw, vh, isMobile, isLowPower, dpr };
    };

    // Build rasterized glyph canvas, 256-bin progressive erosion map, and physical dust particles
    const buildWordArtifact = (wordCfg, wordIdx, specs) => {
      const { vw, vh, isMobile, isLowPower, dpr } = specs;
      const canvasEl = glyphCanvasRefs.current[wordIdx];
      if (!canvasEl) return null;

      // Responsive editorial font sizing
      let fontSize = isMobile
        ? Math.min(Math.max(vw * 0.088, 28), 46)
        : Math.min(Math.max(vw * 0.062, 50), 86);

      const fontSpec = (size) => `700 ${size}px "Cinzel", "Cormorant Garamond", Georgia, serif`;
      const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      ctx.font = fontSpec(fontSize);
      let trackingPx = fontSize * 0.16;
      let { totalWidth } = measureTrackedText(ctx, wordCfg.text, trackingPx);

      // Ensure widest word comfortably fits viewport with breathing room on the right for drifting dust
      const maxAllowedWidth = vw * (isMobile ? 0.78 : 0.74);
      if (totalWidth > maxAllowedWidth) {
        fontSize = Math.floor(fontSize * (maxAllowedWidth / totalWidth));
        trackingPx = fontSize * 0.16;
        ctx.font = fontSpec(fontSize);
        totalWidth = measureTrackedText(ctx, wordCfg.text, trackingPx).totalWidth;
      }

      const padX = Math.ceil(fontSize * 0.45);
      const padY = Math.ceil(fontSize * 0.42);
      const cssWidth = Math.ceil(totalWidth + padX * 2);
      const cssHeight = Math.ceil(fontSize * 1.45 + padY * 2);

      const pixelW = Math.max(1, Math.ceil(cssWidth * dpr));
      const pixelH = Math.max(1, Math.ceil(cssHeight * dpr));

      canvasEl.width = pixelW;
      canvasEl.height = pixelH;
      canvasEl.style.width = `${cssWidth}px`;
      canvasEl.style.height = `${cssHeight}px`;

      const wordLeft = Math.round((vw - cssWidth) * 0.5);
      const wordTop = Math.round((vh - cssHeight) * 0.5);
      canvasEl.style.left = `${wordLeft}px`;
      canvasEl.style.top = `${wordTop}px`;

      // Rasterize crisp typography onto word's dedicated canvas
      ctx.save();
      ctx.clearRect(0, 0, pixelW, pixelH);
      ctx.scale(dpr, dpr);
      ctx.font = fontSpec(fontSize);
      ctx.fillStyle = wordCfg.color;
      drawTrackedText(ctx, wordCfg.text, cssWidth * 0.5, cssHeight * 0.5, trackingPx);
      ctx.restore();

      const imageData = ctx.getImageData(0, 0, pixelW, pixelH);
      const data = imageData.data;

      // 1. Find tight opaque bounding box of the rendered letterforms
      let minPx = pixelW;
      let maxPx = 0;
      let minPy = pixelH;
      let maxPy = 0;

      for (let py = 0; py < pixelH; py++) {
        const rowOffset = py * pixelW;
        for (let px = 0; px < pixelW; px++) {
          const alpha = data[(rowOffset + px) * 4 + 3];
          if (alpha > 8) {
            if (px < minPx) minPx = px;
            if (px > maxPx) maxPx = px;
            if (py < minPy) minPy = py;
            if (py > maxPy) maxPy = py;
          }
        }
      }

      if (maxPx <= minPx) {
        minPx = 0;
        maxPx = pixelW - 1;
        minPy = 0;
        maxPy = pixelH - 1;
      }

      const spanX = Math.max(1, maxPx - minPx);
      const spanY = Math.max(1, maxPy - minPy);
      const noiseScale = 1 / (dpr * (isMobile ? 13 : 17));
      const seed = (wordIdx + 1) * 43;

      // 2. Bucket-sort every opaque pixel into 256 progressive left-to-right erosion bins
      const binCounts = new Uint32Array(EROSION_BINS);
      const opaqueCoords = [];
      const opaqueBins = [];

      // Adaptive sampling stride for physical particles
      const sampleStep = Math.max(
        1,
        Math.round(dpr * (prefersReducedMotion ? 3.4 : isLowPower ? 2.35 : 1.65))
      );

      const particles = [];

      for (let py = minPy; py <= maxPy; py++) {
        const rowOffset = py * pixelW;
        const normY = (py - minPy) / spanY;

        for (let px = minPx; px <= maxPx; px++) {
          const idx4 = (rowOffset + px) * 4;
          const alpha = data[idx4 + 3];
          if (alpha <= 8) continue;

          // Detect if pixel lies near the outer stroke edge so letter edges fray slightly first
          const leftA = px > 1 ? data[idx4 - 8 + 3] : 0;
          const rightA = px < pixelW - 2 ? data[idx4 + 8 + 3] : 0;
          const topA = py > 1 ? data[idx4 - pixelW * 8 + 3] : 0;
          const botA = py < pixelH - 2 ? data[idx4 + pixelW * 8 + 3] : 0;
          const isEdge = leftA < 90 || rightA < 90 || topA < 90 || botA < 90;

          const normX = (px - minPx) / spanX;
          const n = fbm2D(px * noiseScale, py * noiseScale, seed);

          // Left-to-right progression + slight upward-diagonal breeze tilt + organic noise + edge fraying
          const rawThreshold =
            normX * 0.78 +
            (1.0 - normY) * 0.055 +
            n * 0.125 +
            (isEdge ? -0.048 : 0.02);

          const clamped = Math.max(0, Math.min(0.999, (rawThreshold + 0.06) / 0.92));
          const bin = Math.min(EROSION_BINS - 1, Math.max(0, Math.floor(clamped * EROSION_BINS)));

          binCounts[bin]++;
          opaqueCoords.push(idx4 + 3); // store direct alpha channel offset
          opaqueBins.push(bin);

          // Sample particles directly from the actual glyph pixels
          if (alpha > 42 && px % sampleStep === 0 && py % sampleStep === 0) {
            const screenX = wordLeft + px / dpr;
            const screenY = wordTop + py / dpr;
            const r1 = hash2D(px, py, seed + 7);
            const r2 = hash2D(py, px, seed + 19);
            const r3 = hash2D(px + 13, py + 29, seed + 31);

            // Upward-right breeze velocity with natural angular spread
            const angle = -0.58 + (r1 - 0.5) * 0.92; // Primarily up-right (-60deg to -7deg)
            const speed = (isMobile ? 46 : 64) + r2 * (isMobile ? 54 : 78) + (wordCfg.isFinal ? 16 : 0);

            const vx = Math.cos(angle) * speed + 18;
            const vy = Math.sin(angle) * speed - (6 + r3 * 18);

            // Multi-scale dust grain sizes: fine dust motes, medium flakes, and small ash fragments
            let baseSize;
            let isFlake = false;
            if (r3 < 0.64) {
              baseSize = 0.85 + r1 * 0.65; // Fine dust speck
            } else if (r3 < 0.92) {
              baseSize = 1.45 + r1 * 0.75; // Medium grain
              isFlake = true;
            } else {
              baseSize = 2.15 + r1 * 0.75; // Larger ash flake
              isFlake = true;
            }

            particles.push({
              x: screenX,
              y: screenY,
              vx,
              vy,
              buoyancy: 14 + r2 * 24,
              turbAmp: (isMobile ? 16 : 24) * (0.55 + r1 * 0.9),
              seed: r3 * Math.PI * 2,
              bin,
              active: false,
              dead: false,
              age: 0,
              maxLife: (wordCfg.isFinal ? 0.82 : 0.66) + r2 * (wordCfg.isFinal ? 0.52 : 0.38),
              baseSize,
              baseAlpha: Math.min(1, (alpha / 255) * (0.88 + r1 * 0.12)),
              isFlake,
              flakeDx: (r1 - 0.5) * 1.3,
              flakeDy: (r2 - 0.5) * 1.3,
              toneOffset: r3 > 0.65 ? 1 : 0,
            });

            // Add secondary ultra-fine dust mote on desktop for rich cinematic density
            if (!isLowPower && !prefersReducedMotion && r2 > 0.58) {
              const fineAngle = angle - 0.18 + (r3 - 0.5) * 0.5;
              const fineSpeed = speed * (1.12 + r1 * 0.35);
              particles.push({
                x: screenX + (r1 - 0.5) * 1.2,
                y: screenY + (r2 - 0.5) * 1.2,
                vx: Math.cos(fineAngle) * fineSpeed + 22,
                vy: Math.sin(fineAngle) * fineSpeed - 12,
                buoyancy: 22 + r1 * 26,
                turbAmp: 28 * (0.6 + r3 * 0.8),
                seed: (r1 + r2) * Math.PI * 2,
                bin: Math.min(EROSION_BINS - 1, bin + 2),
                active: false,
                dead: false,
                age: 0,
                maxLife: (wordCfg.isFinal ? 0.92 : 0.72) + r1 * 0.42,
                baseSize: 0.75 + r3 * 0.55,
                baseAlpha: 0.78 + r2 * 0.2,
                isFlake: false,
                flakeDx: 0,
                flakeDy: 0,
                toneOffset: 1,
              });
            }
          }
        }
      }

      // Pack opaque pixel alpha indices into contiguous typed array grouped by bin (O(N) bucket build)
      const binOffsets = new Uint32Array(EROSION_BINS + 1);
      for (let b = 0; b < EROSION_BINS; b++) {
        binOffsets[b + 1] = binOffsets[b] + binCounts[b];
      }
      const sortedAlphaIndices = new Uint32Array(opaqueCoords.length);
      const cursor = new Uint32Array(binOffsets);
      for (let i = 0; i < opaqueCoords.length; i++) {
        const b = opaqueBins[i];
        sortedAlphaIndices[cursor[b]++] = opaqueCoords[i];
      }

      // Group particles by activation bin for O(1) per-frame wake-up
      const particlesByBin = Array.from({ length: EROSION_BINS }, () => []);
      for (let i = 0; i < particles.length; i++) {
        particlesByBin[particles[i].bin].push(particles[i]);
      }

      return {
        text: wordCfg.text,
        isFinal: wordCfg.isFinal,
        tones: wordCfg.isFinal ? CRIMSON_TONES : IVORY_TONES,
        canvasEl,
        ctx,
        imageData,
        data,
        pixelW,
        pixelH,
        binOffsets,
        sortedAlphaIndices,
        particles,
        particlesByBin,
        activeParticles: [],
        dissolveProgress: 0,
        lastErodedBin: -1,
        fullyCleared: false,
      };
    };

    // Progressive pixel-level glyph erosion driven by dissolveProgress
    const erodeWordToProgress = (wordObj, progressVal) => {
      if (!wordObj || wordObj.fullyCleared) return;

      if (progressVal >= 0.999) {
        // Wake any remaining particles and clear canvas completely
        for (let b = wordObj.lastErodedBin + 1; b < EROSION_BINS; b++) {
          const binList = wordObj.particlesByBin[b];
          for (let i = 0; i < binList.length; i++) {
            const p = binList[i];
            if (!p.active) {
              p.active = true;
              wordObj.activeParticles.push(p);
            }
          }
        }
        wordObj.ctx.clearRect(0, 0, wordObj.pixelW, wordObj.pixelH);
        wordObj.lastErodedBin = EROSION_BINS - 1;
        wordObj.fullyCleared = true;
        return;
      }

      const targetBin = Math.min(
        EROSION_BINS - 1,
        Math.floor(progressVal * EROSION_BINS)
      );

      if (targetBin <= wordObj.lastErodedBin) return;

      const { data, binOffsets, sortedAlphaIndices, particlesByBin, activeParticles } = wordObj;

      // 1. Erase pixels in bins [lastErodedBin + 1 .. targetBin] and wake their particles
      const startIdx = binOffsets[wordObj.lastErodedBin + 1];
      const endIdx = binOffsets[targetBin + 1];
      for (let i = startIdx; i < endIdx; i++) {
        data[sortedAlphaIndices[i]] = 0;
      }

      for (let b = wordObj.lastErodedBin + 1; b <= targetBin; b++) {
        const binList = particlesByBin[b];
        for (let i = 0; i < binList.length; i++) {
          const p = binList[i];
          if (!p.active) {
            p.active = true;
            activeParticles.push(p);
          }
        }
      }

      // 2. Subtle pre-erosion fracture along the leading edge bins [targetBin + 1 .. targetBin + 8]
      const crackLimitBin = Math.min(EROSION_BINS - 1, targetBin + 8);
      const crackStart = binOffsets[targetBin + 1];
      const crackEnd = binOffsets[crackLimitBin + 1];
      for (let i = crackStart; i < crackEnd; i += 2) {
        const aIdx = sortedAlphaIndices[i];
        data[aIdx] = (data[aIdx] * 170) >>> 8; // ~66% alpha along crumbling boundary
      }

      wordObj.ctx.putImageData(wordObj.imageData, 0, 0);
      wordObj.lastErodedBin = targetBin;
    };

    // Initialize after web fonts are ready (with fast 250ms fallback timeout)
    const initSequence = async () => {
      try {
        if (document.fonts && document.fonts.ready) {
          await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 250)),
          ]);
        }
      } catch {
        // Proceed immediately if font API unavailable
      }

      if (cancelled) return;

      const specs = getDeviceSpecs();
      const pCanvas = particleCanvasRef.current;
      if (!pCanvas) return;

      pCanvas.width = Math.ceil(specs.vw * specs.dpr);
      pCanvas.height = Math.ceil(specs.vh * specs.dpr);
      const pCtx = pCanvas.getContext('2d');

      // Build all 5 word artifacts
      const builtWords = INTRO_WORDS.map((wCfg, idx) =>
        buildWordArtifact(wCfg, idx, specs)
      ).filter(Boolean);
      wordsDataRef.current = builtWords;

      // Pre-allocate render buckets [paletteIdx(0..1)][toneIdx(0..3)][alphaBucket(0..ALPHA_STEPS-1)]
      // Avoids per-particle fillStyle changes so thousands of particles render in <0.5ms
      const renderBuckets = [0, 1].map(() =>
        [0, 1, 2, 3].map(() =>
          Array.from({ length: ALPHA_STEPS }, () => [])
        )
      );

      // Start high-precision particle simulation loop
      let lastTime = performance.now();
      const startTime = lastTime;

      const tickParticles = (now) => {
        if (cancelled) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
        lastTime = now;
        const elapsed = (now - startTime) * 0.001;

        pCtx.save();
        pCtx.setTransform(1, 0, 0, 1, 0, 0);
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        pCtx.scale(specs.dpr, specs.dpr);

        let hasAnyActive = false;

        for (let w = 0; w < builtWords.length; w++) {
          const wordObj = builtWords[w];
          if (wordObj.dissolveProgress > 0 && !wordObj.fullyCleared) {
            erodeWordToProgress(wordObj, wordObj.dissolveProgress);
          }

          const activeList = wordObj.activeParticles;
          if (activeList.length === 0) continue;

          const paletteIdx = wordObj.isFinal ? 1 : 0;
          const paletteBuckets = renderBuckets[paletteIdx];

          let writeIdx = 0;
          for (let i = 0; i < activeList.length; i++) {
            const p = activeList[i];
            p.age += dt;
            if (p.age >= p.maxLife) {
              p.dead = true;
              continue;
            }

            activeList[writeIdx++] = p;
            hasAnyActive = true;

            const lifeRatio = p.age / p.maxLife;
            // Smooth wind pickup over first 130ms so particles peel off letters before accelerating
            const pickup = Math.min(1.0, p.age / 0.13);
            const smoothPickup = pickup * pickup * (3 - 2 * pickup);

            // Coherent spatial curl-like turbulence waves
            const waveX =
              Math.sin(p.x * 0.021 + elapsed * 3.3 + p.seed) *
              Math.cos(p.y * 0.017 - elapsed * 2.4 + p.seed * 0.7);
            const waveY =
              Math.cos(p.x * 0.018 - elapsed * 2.8 + p.seed) *
              Math.sin(p.y * 0.023 + elapsed * 2.1 - p.seed * 0.5);

            p.x += (p.vx * smoothPickup + waveX * p.turbAmp * smoothPickup) * dt;
            p.y +=
              (p.vy * smoothPickup +
                waveY * p.turbAmp * smoothPickup -
                p.buoyancy * lifeRatio) *
              dt;

            // Gradual shrinking and natural opacity decay
            p.currentSize = p.baseSize * (1.0 - 0.64 * Math.pow(lifeRatio, 1.15));

            let alpha;
            if (lifeRatio < 0.16) {
              alpha = p.baseAlpha;
            } else {
              const fadeT = (lifeRatio - 0.16) / 0.84;
              alpha = p.baseAlpha * Math.pow(1.0 - fadeT, 1.55);
            }

            if (alpha <= 0.02 || p.currentSize <= 0.25) continue;

            // Select progressive ash/ember tone based on particle age
            let toneIdx = 0;
            if (lifeRatio > 0.74) toneIdx = 3;
            else if (lifeRatio > 0.46) toneIdx = 2;
            else if (lifeRatio > 0.20) toneIdx = 1;
            toneIdx = Math.min(3, toneIdx + (lifeRatio > 0.12 ? p.toneOffset : 0));

            const aBucket = Math.min(
              ALPHA_STEPS - 1,
              Math.max(0, Math.floor(alpha * ALPHA_STEPS))
            );
            paletteBuckets[toneIdx][aBucket].push(p);
          }
          activeList.length = writeIdx;
        }

        // Batch-render all active dust particles grouped by tone and alpha step
        if (hasAnyActive) {
          for (let pal = 0; pal < 2; pal++) {
            const tones = pal === 1 ? CRIMSON_TONES : IVORY_TONES;
            const paletteBuckets = renderBuckets[pal];

            for (let t = 0; t < 4; t++) {
              const rgb = tones[t];
              const toneBuckets = paletteBuckets[t];

              for (let a = 0; a < ALPHA_STEPS; a++) {
                const list = toneBuckets[a];
                if (list.length === 0) continue;

                const alphaVal = ((a + 0.5) / ALPHA_STEPS).toFixed(3);
                pCtx.fillStyle = `rgba(${rgb}, ${alphaVal})`;

                for (let k = 0; k < list.length; k++) {
                  const p = list[k];
                  const s = p.currentSize;
                  pCtx.fillRect(p.x, p.y, s, s);
                  if (p.isFlake && s > 1.15) {
                    pCtx.fillRect(
                      p.x + p.flakeDx,
                      p.y + p.flakeDy,
                      s * 0.72,
                      s * 0.72
                    );
                  }
                }
                list.length = 0;
              }
            }
          }
        }

        pCtx.restore();
        rafRef.current = requestAnimationFrame(tickParticles);
      };

      rafRef.current = requestAnimationFrame(tickParticles);

      // ======================================================================
      // SINGLE COORDINATED GSAP MASTER TIMELINE FOR ALL 5 WORDS
      // ======================================================================
      const tl = gsap.timeline({
        onComplete: () => {
          isFinishedRef.current = true;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setIsUnmounted(true);
          onComplete?.();
        },
      });
      timelineRef.current = tl;

      const wordOverlapStride = prefersReducedMotion ? 0.92 : 1.14;

      builtWords.forEach((wordObj, idx) => {
        const isFinal = wordObj.isFinal;
        const startT = idx * wordOverlapStride;
        const enterDur = isFinal ? 0.42 : 0.36;
        const holdDur = isFinal ? 0.65 : 0.44;
        const dissolveDur = isFinal ? 0.92 : 0.76;

        // Initial hidden state: 15px lower, blurred, zero opacity
        gsap.set(wordObj.canvasEl, {
          opacity: 0,
          y: 15,
          filter: 'blur(9px)',
        });

        // 1. Word Entrance: emerge from darkness, move upward 15px, resolve from blur to sharp
        tl.to(
          wordObj.canvasEl,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: enterDur,
            ease: 'power2.out',
            onComplete: () => {
              if (wordObj.canvasEl) {
                wordObj.canvasEl.style.filter = 'none';
              }
            },
          },
          startT
        );

        const dissolveStartT = startT + enterDur + holdDur;

        // If this is the final word (SHINOBI.), ensure essential 3D assets are ready before disintegrating
        if (isFinal) {
          tl.call(
            () => {
              if (!assetsReadyRef.current && !isFinishedRef.current) {
                isWaitingForAssetsRef.current = true;
                tl.pause();
              }
            },
            null,
            dissolveStartT - 0.02
          );
        }

        // 2. Word Disintegration: left-to-right physical pixel erosion into drifting dust
        tl.to(
          wordObj,
          {
            dissolveProgress: 1,
            duration: dissolveDur,
            ease: 'sine.inOut',
          },
          dissolveStartT
        );

        // 3. Final Word (SHINOBI.) Unveiling: as crimson dust drifts away, unveil the portfolio underneath
        if (isFinal) {
          tl.call(
            () => {
              setIsUnveiling(true);
              onComplete?.();
            },
            null,
            dissolveStartT + 0.18
          );

          if (backdropRef.current) {
            tl.to(
              backdropRef.current,
              {
                opacity: 0,
                duration: 1.05,
                ease: 'power2.inOut',
              },
              dissolveStartT + 0.22
            );
          }

          // Allow trailing crimson dust particles to finish drifting & vanishing naturally before unmounting
          tl.to({}, { duration: 0.55 }, dissolveStartT + dissolveDur);
        }
      });
    };

    initSequence();

    return () => {
      cancelled = true;
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      wordsDataRef.current = [];
    };
  }, [isUnmounted]);

  if (isUnmounted) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={`shinobi-dust-intro-overlay ${isUnveiling ? 'is-unveiling' : ''}`}
      aria-label="Shinobi Portfolio Intro"
    >
      {/* Pure #050505 Black Backdrop that dissolves during the final crimson dust reveal */}
      <div ref={backdropRef} className="shinobi-dust-backdrop" />

      {/* Individual High-DPI Word Canvases (eroded pixel-by-pixel from left to right) */}
      <div className="shinobi-glyph-stage" aria-hidden="true">
        {INTRO_WORDS.map((word, index) => (
          <canvas
            key={word.text}
            ref={(el) => {
              glyphCanvasRefs.current[index] = el;
            }}
            className="shinobi-word-glyph-canvas"
          />
        ))}
      </div>

      {/* Full-Screen Physical Dust Particle Canvas */}
      <canvas
        ref={particleCanvasRef}
        className="shinobi-dust-particle-canvas"
        aria-hidden="true"
      />

      {/* Discreet Skip Intro Option */}
      {!isUnveiling && (
        <button
          type="button"
          className="shinobi-skip-intro-btn"
          onClick={handleSkipIntro}
          aria-label="Skip Intro"
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}
