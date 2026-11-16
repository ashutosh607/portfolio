import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

import KonohaVillage from '../features/village/components/KonohaVillage';
import Naruto from '../features/village/components/Naruto';
import VillageCharacters from '../features/village/components/VillageCharacters';
import Atmosphere from '../features/village/components/Atmosphere';
import CameraController from '../features/village/components/CameraController';
import KonohaHUD from '../features/village/components/KonohaHUD';
import InteractionHUD from '../features/village/components/InteractionHUD';
import LoadingScreen from '../features/entry/components/LoadingScreen';
import CinematicWelcomeIntro from '../features/entry/components/CinematicWelcomeIntro';
import CinematicDialogue from '../features/dialogue/components/CinematicDialogue';
import './App.css';
import { INITIAL_SPAWN } from '../features/village/config/constants';
import { KONOHA_LOCATIONS } from '../features/village/config/locations';
import {
  buildInteractableRegistry,
  detectNearbyTargets,
  pickBestTargetUid,
} from '../features/village/systems/interactionSystem';
import { subscribePublished } from '../shared/cms/published';

const PortfolioModals = React.lazy(() => import('./PortfolioModals'));
const FallbackPortfolio2D = React.lazy(() => import('../features/portfolio-2d/components/FallbackPortfolio2D'));

let INTERACTABLE_REGISTRY = buildInteractableRegistry();
subscribePublished(() => {
  INTERACTABLE_REGISTRY = buildInteractableRegistry();
});

// Detect lower-end / mobile / integrated GPU hardware on startup to default to Lite mode when appropriate
function detectInitialLiteMode() {
  if (typeof window === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  return isMobile || cores <= 4 || memory <= 4;
}

// Keep UI at native resolution and scale only the scene's drawing buffer.
function AdaptiveQualityMonitor({ isLiteMode, paused, onAutoDowngrade }) {
  const stats = useRef({ frames: 0, elapsed: 0, slow: 0, fast: 0 });
  useEffect(() => {
    stats.current = { frames: 0, elapsed: 0, slow: 0, fast: 0 };
  }, [isLiteMode, paused]);

  useFrame(({ viewport, setDpr, size }, delta) => {
    if (paused || document.hidden || delta <= 0 || delta > 1) return;
    const sample = stats.current;
    const cap = Math.min(window.devicePixelRatio || 1, isLiteMode ? 1 : 1.5,
      Math.sqrt((isLiteMode ? 1800000 : 3200000) / Math.max(1, size.width * size.height)));
    const floor = Math.min(cap, isLiteMode ? 0.65 : 0.85);
    const current = viewport.dpr;
    if (current > cap + 0.01) setDpr(cap);
    sample.frames++;
    sample.elapsed += delta;
    if (sample.elapsed < 1.2) return;
    const fps = sample.frames / sample.elapsed;
    sample.frames = sample.elapsed = 0;
    sample.slow = fps < 38 ? sample.slow + 1 : 0;
    sample.fast = fps > 54 ? sample.fast + 1 : 0;
    if (sample.slow >= 2) {
      if (current > floor + 0.01) setDpr(Math.max(floor, current - 0.2));
      else if (!isLiteMode) onAutoDowngrade();
      sample.slow = 0;
    } else if (sample.fast >= 4 && current < cap - 0.01) {
      setDpr(Math.min(cap, current + 0.1));
      sample.fast = 0;
    }
  });
  return null;
}

// The canvas clock can restart when a modal switches rendering modes.
function SmartInteractionTracker({ playerPosRef, onNearbyTargetsChange }) {
  const lastSample = useRef({});
  const prevSigRef = useRef(null);
  const prevSetRef = useRef(new Set());

  useFrame(() => {
    const p = playerPosRef.current;
    const sample = lastSample.current;
    if (sample.x === p[0] && sample.z === p[2] && sample.registry === INTERACTABLE_REGISTRY) return;
    sample.x = p[0];
    sample.z = p[2];
    sample.registry = INTERACTABLE_REGISTRY;

    const detected = detectNearbyTargets(INTERACTABLE_REGISTRY, p, prevSetRef.current);
    const nextSig = detected.map((item) => item.uid).join('|');

    if (nextSig !== prevSigRef.current) {
      prevSigRef.current = nextSig;
      prevSetRef.current = new Set(detected.map((item) => item.uid));
      onNearbyTargetsChange(detected);
    }
  });

  return null;
}

// Root Error Boundary: automatically falls back to functional 2D Portfolio if WebGL / 3D fails
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Konoha Portfolio Application Error (switching to 2D fallback):', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="portfolio-2d-wrapper">
          <FallbackPortfolio2D webglError={this.state.error?.message || 'WebGL initialization error'}/>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}

function AppContent() {
  const [terrainMesh, setTerrainMesh] = useState(null);
  const [narutoPos, setNarutoPos] = useState(() => [...INITIAL_SPAWN.position]);
  const [characterState, setCharacterState] = useState('idle');
  const [activeKeys, setActiveKeys] = useState({});
  const [resetCount, setResetCount] = useState(0);
  const [isLiteMode, setIsLiteMode] = useState(detectInitialLiteMode);
  const [isNightMode, setIsNightMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = window.localStorage.getItem('shinobi_night_mode');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [is2DMode, setIs2DMode] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(() =>
    typeof document !== 'undefined' ? document.hidden : false
  );

  useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Safety fallback: ensure sceneLoaded triggers even if assets load instantaneously
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setSceneLoaded(true);
    }, 2800);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Unified Smart Interaction State (All nearby NPCs & interactive locations)
  const [activeDialogueCharacter, setActiveDialogueCharacter] = useState(null);
  const [nearbyTargets, setNearbyTargets] = useState([]);
  const [selectedTargetUid, setSelectedTargetUid] = useState(null);

  // Portfolio Section Modals State ('intro' | 'projects' | 'skills' | 'about' | 'resume' | 'achievements' | 'contact' | null)
  const [activeModal, setActiveModal] = useState(() =>
    history.state?.missionScroll ? 'achievements' : null
  );
  useEffect(() => {
    const restoreMissionBoard = (event) => {
      if (!is2DMode && event.state?.missionScroll) setActiveModal('achievements');
    };
    window.addEventListener('popstate', restoreMissionBoard);
    return () => window.removeEventListener('popstate', restoreMissionBoard);
  }, [is2DMode]);
  const [fastTravelTarget, setFastTravelTarget] = useState(null);

  // Shared ref for camera yaw angle so Naruto steers relative to camera orientation
  const cameraAngleRef = useRef(INITIAL_SPAWN.cameraYaw);
  // Shared mutable position + yaw ref for 60fps tracking without React re-renders
  const narutoPosRef = useRef([...INITIAL_SPAWN.position, INITIAL_SPAWN.facing]);
  // Shared mutable touch input ref for mobile controls
  const touchInputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
  });

  const handleCreated = useCallback(({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('Konoha 3D: WebGL Context Lost. Attempting auto-restore...');
    });
    gl.domElement.addEventListener('webglcontextrestored', () => {
      console.log('Konoha 3D: WebGL Context Restored successfully.');
    });
  }, []);

  const handlePositionUpdate = useCallback((pos) => {
    setNarutoPos(pos);
  }, []);

  const handleKeysChange = useCallback((keys) => {
    setActiveKeys(keys);
  }, []);

  const handleResetPosition = useCallback(() => {
    setResetCount((c) => c + 1);
    setFastTravelTarget(null);
  }, []);

  const handleTerrainReady = useCallback((collider) => {
    setTerrainMesh(collider);
  }, []);

  const handleToggleLiteMode = useCallback(() => {
    setIsLiteMode((prev) => !prev);
  }, []);

  const handleToggleNightMode = useCallback(() => {
    setIsNightMode((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('shinobi_night_mode', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const handleAutoDowngrade = useCallback(() => {
    setIsLiteMode(true);
  }, []);

  // Dialogue & Modal callbacks
  const handleCloseDialogue = useCallback(() => {
    setActiveDialogueCharacter(null);
  }, []);

  // Auto-close dialogue if player ever walks away from active character (> 5.5m)
  useEffect(() => {
    if (!activeDialogueCharacter) return;
    const charPos = activeDialogueCharacter.position;
    const livePos = narutoPosRef.current || narutoPos;
    if (!charPos || !livePos) return;

    const dx = livePos[0] - charPos[0];
    const dz = livePos[2] - charPos[2];
    const dist = Math.hypot(dx, dz);
    const maxAllowedDist = (activeDialogueCharacter.interactionDistance || 3.5) + 2.0;

    if (dist > maxAllowedDist) {
      setActiveDialogueCharacter(null);
    }
  }, [narutoPos, activeDialogueCharacter]);

  const handleOpenModal = useCallback((modalKey) => {
    setActiveModal(modalKey);
    if (modalKey) {
      const matchedLoc = KONOHA_LOCATIONS.find((l) => l.modalKey === modalKey);
      if (matchedLoc) {
        const curPos = narutoPosRef.current || INITIAL_SPAWN.position;
        const distToLandmark = Math.hypot(
          curPos[0] - matchedLoc.position[0],
          curPos[2] - matchedLoc.position[2]
        );
        if (distToLandmark > 3.5) {
          setFastTravelTarget([...matchedLoc.position]);
        }
      }
    }
  }, []);

  const handleTriggerAction = useCallback(
    (action) => {
      if (action === 'open_projects') {
        handleOpenModal('projects');
      } else if (action === 'open_skills') {
        handleOpenModal('skills');
      } else if (action === 'open_about') {
        handleOpenModal('about');
      } else if (action === 'open_resume') {
        setActiveModal('resume');
      } else if (action === 'open_achievements') {
        handleOpenModal('achievements');
      } else if (action === 'open_contact') {
        handleOpenModal('contact');
      }
    },
    [handleOpenModal]
  );

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleFastTravel = useCallback((coords) => {
    setFastTravelTarget([...coords]);
  }, []);

  // Update nearby targets list & preserve stable selected target
  const handleNearbyTargetsChange = useCallback((detectedList) => {
    setNearbyTargets(detectedList);
    setSelectedTargetUid((prevUid) => pickBestTargetUid(detectedList, prevUid));
  }, []);

  // Activate the selected target (either talk to NPC or open location modal)
  const handleActivateTarget = useCallback((target) => {
    if (!target) return;
    if (target.type === 'npc' && target.data) {
      setActiveDialogueCharacter(target.data);
    } else if (target.type === 'location' && target.data?.modalKey) {
      setActiveModal(target.data.modalKey);
    }
  }, []);

  if (is2DMode) {
    return (
      <div className="portfolio-2d-wrapper">
        <FallbackPortfolio2D onSwitchTo3D={() => setIs2DMode(false)} />
      </div>
    );
  }

  const isMovementPaused = Boolean(activeDialogueCharacter || activeModal);
  const enableShadows = !isLiteMode;

  const selectedNearbyTarget = useMemo(
    () => nearbyTargets.find((t) => t.uid === selectedTargetUid) || nearbyTargets[0] || null,
    [nearbyTargets, selectedTargetUid]
  );
  const focusTarget =
    activeDialogueCharacter?.position ||
    (selectedNearbyTarget?.type === 'npc' ? selectedNearbyTarget.position : null);

  const isAnyMovementKeyPressed = Boolean(
    activeKeys.KeyW ||
    activeKeys.KeyA ||
    activeKeys.KeyS ||
    activeKeys.KeyD ||
    activeKeys.ArrowUp ||
    activeKeys.ArrowDown ||
    activeKeys.ArrowLeft ||
    activeKeys.ArrowRight
  );

  const distFromSpawn = Math.hypot(
    narutoPos[0] - INITIAL_SPAWN.position[0],
    narutoPos[2] - INITIAL_SPAWN.position[2]
  );

  const isVisitorMoving = Boolean(
    characterState !== 'idle' ||
    isAnyMovementKeyPressed ||
    distFromSpawn > 0.8 ||
    activeDialogueCharacter ||
    activeModal
  );

  return (
    <div className="app-viewport">
      {/* 3D Scene Canvas */}
      <Canvas
        frameloop={
          isTabHidden ||
          activeModal === 'intro' ||
          activeModal === 'projects' ||
          activeModal === 'about' ||
          activeModal === 'achievements' ||
          activeModal === 'contact' ||
          activeModal === 'skills' ||
          activeModal === 'resume'
            ? 'demand'
            : 'always'
        }
        shadows={enableShadows ? 'percentage' : false}
        dpr={isLiteMode ? [0.75, 1.0] : [1, 1.35]}
        camera={{ position: [0, 3.2, 5.5], fov: 46, near: 0.3, far: 250 }}
        gl={{
          antialias: !isLiteMode,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={handleCreated}
        className="three-canvas"
      >
        <AdaptiveQualityMonitor
          paused={Boolean(activeModal)}
          isLiteMode={isLiteMode}
          onAutoDowngrade={handleAutoDowngrade}
        />

        {/* Smart 10Hz Multi-Target Proximity Detector */}
        <SmartInteractionTracker
          playerPosRef={narutoPosRef}
          onNearbyTargetsChange={handleNearbyTargetsChange}
        />

        {/* Anime Sky & Distant Mountain Atmospheric Fog (Day vs Japanese Night) */}
        <color attach="background" args={[isNightMode ? '#090e1c' : '#8ec3eb']} />
        <fog
          attach="fog"
          args={isNightMode ? ['#0e162b', 54, 198] : ['#a3c9e8', 60, 210]}
        />

        <Suspense fallback={null}>
          {/* Dynamic Sky Atmosphere: Clouds, Moon, Stars, Ninja Birds & Leaves/Fireflies */}
          <Atmosphere isLiteMode={isLiteMode} isNightMode={isNightMode} />

          {/* Actual Konoha Village Environment, 6 Interactive Shrines, Lanterns & O(1) Spatial Collider */}
          <KonohaVillage
            playerPosRef={narutoPosRef}
            onTerrainReady={handleTerrainReady}
            selectedTargetUid={selectedTargetUid}
            isInteractionBlocked={isMovementPaused}
            enableShadows={enableShadows}
            isNightMode={isNightMode}
          />

          {/* Interactive Naruto Characters Integrated with Dialogue */}
          <VillageCharacters
            terrainMesh={terrainMesh}
            playerPosRef={narutoPosRef}
            selectedTargetUid={selectedTargetUid}
            isDialogueActive={Boolean(activeDialogueCharacter)}
            enableShadows={enableShadows}
          />

          {/* Actual Playable Naruto Character & Movement Physics */}
          <Naruto
            terrainMesh={terrainMesh}
            cameraAngleRef={cameraAngleRef}
            playerPosRef={narutoPosRef}
            onPositionUpdate={handlePositionUpdate}
            onStateChange={setCharacterState}
            onKeysChange={handleKeysChange}
            resetSignal={resetCount}
            isMovementPaused={isMovementPaused}
            fastTravelTarget={fastTravelTarget}
            focusTarget={focusTarget}
            enableShadows={enableShadows}
            touchInputRef={touchInputRef}
          />

          {/* Smooth Third-Person Follow Camera */}
          <CameraController
            playerPosRef={narutoPosRef}
            cameraAngleRef={cameraAngleRef}
            fastTravelTarget={fastTravelTarget}
            dialogueTarget={activeDialogueCharacter?.position || null}
          />
        </Suspense>
      </Canvas>

      {/* Asset Loading Screen */}
      <LoadingScreen onComplete={() => setSceneLoaded(true)} />

      {/* Cinematic Word-by-Word Sky Welcome Intro */}
      <CinematicWelcomeIntro
        isSceneLoaded={sceneLoaded}
        isVisitorMoving={isVisitorMoving}
      />

      {/* Minimal Cinematic Shinobi HUD */}
      <KonohaHUD
        activeKeys={activeKeys}
        characterState={characterState}
        currentPosition={narutoPos}
        onResetPosition={handleResetPosition}
        onOpenModal={handleOpenModal}
        activeModal={activeModal}
        onFastTravel={handleFastTravel}
        isDialogueActive={isMovementPaused}
        isLiteMode={isLiteMode}
        onToggleLiteMode={handleToggleLiteMode}
        isNightMode={isNightMode}
        onToggleNightMode={handleToggleNightMode}
        onSwitchTo2D={() => setIs2DMode(true)}
        touchInputRef={touchInputRef}
      />

      {/* Minimal Adventure RPG Interaction UI (Single Bottom-Center Pill OR Multi-Target Bottom-Right Dock) */}
      <InteractionHUD
        nearbyTargets={nearbyTargets}
        selectedUid={selectedTargetUid}
        onSelectTarget={setSelectedTargetUid}
        onActivateTarget={handleActivateTarget}
        isBlocked={isMovementPaused}
      />

      {/* Cinematic RPG Dialogue Box */}
      {activeDialogueCharacter && (
        <CinematicDialogue
          character={activeDialogueCharacter}
          onClose={handleCloseDialogue}
          onTriggerAction={handleTriggerAction}
        />
      )}

      {/* Portfolio Section Modals (01 Intro, 02 Projects, 03 About, 04 Skills, 05 Missions, 06 Contact, Resume) */}
      {activeModal && <Suspense fallback={null}>
        <PortfolioModals
          activeModal={activeModal}
          onClose={handleCloseModal}
          onOpenModal={handleOpenModal}
          onFastTravel={handleFastTravel}
        />
      </Suspense>}
    </div>
  );
}
