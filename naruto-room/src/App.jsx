import React, { Suspense, useEffect, useRef, useState, useCallback, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import KonohaVillage from './components/KonohaVillage';
import Naruto from './components/Naruto';
import VillageCharacters from './components/VillageCharacters';
import Atmosphere from './components/Atmosphere';
import CameraController from './components/CameraController';
import KonohaHUD from './components/KonohaHUD';
import InteractionHUD from './components/InteractionHUD';
import LoadingScreen from './components/LoadingScreen';
import CinematicDialogue from './components/CinematicDialogue';
import PortfolioModals from './components/PortfolioModals';
import FallbackPortfolio2D from './components/FallbackPortfolio2D';
import './App.css';
import { INITIAL_SPAWN } from './utils/constants';
import {
  buildInteractableRegistry,
  detectNearbyTargets,
  pickBestTargetUid,
} from './utils/interactionSystem';

const INTERACTABLE_REGISTRY = buildInteractableRegistry();

// Detect lower-end / mobile / integrated GPU hardware on startup to default to Lite mode when appropriate
function detectInitialLiteMode() {
  if (typeof window === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  return isMobile || cores <= 4 || memory <= 4;
}

// Automatic FPS watchdog inside Canvas: if sustained framerate drops below 38 FPS, auto-enables Lite mode
function AdaptiveQualityMonitor({ isLiteMode, onAutoDowngrade }) {
  const statsRef = useRef({ frames: 0, elapsed: 0, checks: 0 });

  useFrame((_, delta) => {
    if (isLiteMode) return;
    if (delta > 0.25) return;

    const s = statsRef.current;
    s.frames += 1;
    s.elapsed += delta;

    if (s.elapsed >= 2.0) {
      const fps = s.frames / s.elapsed;
      s.frames = 0;
      s.elapsed = 0;
      if (fps < 38) {
        s.checks += 1;
        if (s.checks >= 2) {
          onAutoDowngrade();
        }
      } else {
        s.checks = 0;
      }
    }
  });

  return null;
}

// 10Hz Smart Target Detector inside Canvas: detects all nearby NPCs & locations with hysteresis and zero idle re-renders
function SmartInteractionTracker({ playerPosRef, onNearbyTargetsChange }) {
  const lastCheckRef = useRef(0);
  const prevSigRef = useRef('');
  const prevSetRef = useRef(new Set());

  useFrame((state) => {
    const now = state.clock.getElapsedTime();
    if (now - lastCheckRef.current < 0.1) return;
    lastCheckRef.current = now;

    const p = playerPosRef?.current;
    if (!p) return;

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
        <FallbackPortfolio2D
          webglError={this.state.error?.message || 'WebGL initialization error'}
        />
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
  const [chakra, setChakra] = useState(100);
  const [activeKeys, setActiveKeys] = useState({});
  const [resetCount, setResetCount] = useState(0);
  const [isLiteMode, setIsLiteMode] = useState(detectInitialLiteMode);
  const [isNightMode, setIsNightMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = window.localStorage.getItem('shinobi_night_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [is2DMode, setIs2DMode] = useState(false);

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

  const handleStateChange = useCallback((stateStr, chakraVal) => {
    setCharacterState(stateStr);
    setChakra(chakraVal);
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
  const handleStartDialogue = useCallback((char) => {
    setActiveDialogueCharacter(char);
  }, []);

  const handleCloseDialogue = useCallback(() => {
    setActiveDialogueCharacter(null);
  }, []);

  const handleTriggerAction = useCallback((action) => {
    if (action === 'open_projects') {
      setActiveModal('projects');
    } else if (action === 'open_skills') {
      setActiveModal('skills');
    } else if (action === 'open_about') {
      setActiveModal('about');
    } else if (action === 'open_resume') {
      setActiveModal('resume');
    } else if (action === 'open_achievements') {
      setActiveModal('achievements');
    } else if (action === 'open_contact') {
      setActiveModal('contact');
    }
  }, []);

  const handleOpenModal = useCallback((modalKey) => {
    setActiveModal(modalKey);
  }, []);

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

  return (
    <div className="app-viewport">
      {/* 3D Scene Canvas */}
      <Canvas
        frameloop={
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
        shadows={enableShadows}
        dpr={isLiteMode ? [0.8, 1.0] : [1, 1.35]}
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
        <AdaptiveDpr pixelated />
        <AdaptiveQualityMonitor
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
            onStateChange={handleStateChange}
            onKeysChange={handleKeysChange}
            resetSignal={resetCount}
            isMovementPaused={isMovementPaused}
            fastTravelTarget={fastTravelTarget}
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
      <LoadingScreen />

      {/* Minimal Cinematic Shinobi HUD */}
      <KonohaHUD
        activeKeys={activeKeys}
        characterState={characterState}
        chakra={chakra}
        currentPosition={narutoPos}
        onResetPosition={handleResetPosition}
        onStartDialogue={handleStartDialogue}
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
      <PortfolioModals
        activeModal={activeModal}
        onClose={handleCloseModal}
        onOpenModal={handleOpenModal}
        onFastTravel={handleFastTravel}
      />
    </div>
  );
}
