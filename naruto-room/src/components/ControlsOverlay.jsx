import React, { useState } from 'react';

export default function ControlsOverlay({
  activeKeys = {},
  characterState = 'idle',
  chakra = 100,
  onResetPosition,
  onResetCamera,
}) {
  const [showHelp, setShowHelp] = useState(true);

  const isKeyPressed = (key) => !!activeKeys[key];

  return (
    <div className="hud-container">
      {/* Top Header */}
      <header className="hud-header">
        <div className="hud-brand">
          <div className="leaf-badge">木ノ葉</div>
          <div className="brand-text">
            <h1>HIDDEN LEAF DOJO</h1>
            <span className="brand-sub">Third-Person Naruto 3D Prototype</span>
          </div>
        </div>

        <div className="header-status">
          <div className={`status-pill ${characterState}`}>
            <span className="status-dot"></span>
            {characterState.toUpperCase()}
          </div>
          <button
            className="hud-btn reset-btn"
            onClick={onResetPosition}
            title="Reset Naruto to room center"
          >
            Center Dojo
          </button>
          <button
            className="hud-btn toggle-help-btn"
            onClick={() => setShowHelp((prev) => !prev)}
          >
            {showHelp ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>
      </header>

      {/* Main HUD overlay for controls & stamina */}
      {showHelp && (
        <div className="hud-controls-panel">
          <div className="controls-card">
            <div className="card-title">
              <span className="icon">⌨️</span> NINJA CONTROLS
            </div>

            {/* WASD Movement */}
            <div className="key-group">
              <div className="wasd-cluster">
                <div className="key-row">
                  <span className={`key-cap ${isKeyPressed('KeyW') || isKeyPressed('ArrowUp') ? 'active' : ''}`}>
                    W
                  </span>
                </div>
                <div className="key-row">
                  <span className={`key-cap ${isKeyPressed('KeyA') || isKeyPressed('ArrowLeft') ? 'active' : ''}`}>
                    A
                  </span>
                  <span className={`key-cap ${isKeyPressed('KeyS') || isKeyPressed('ArrowDown') ? 'active' : ''}`}>
                    S
                  </span>
                  <span className={`key-cap ${isKeyPressed('KeyD') || isKeyPressed('ArrowRight') ? 'active' : ''}`}>
                    D
                  </span>
                </div>
              </div>
              <div className="key-desc">
                <strong>Move</strong>
                <small>WASD / Arrow Keys</small>
              </div>
            </div>

            {/* Actions: Sprint & Jump */}
            <div className="action-keys-row">
              <div className="key-action-item">
                <span className={`key-cap wide ${isKeyPressed('ShiftLeft') || isKeyPressed('ShiftRight') ? 'active' : ''}`}>
                  SHIFT
                </span>
                <span className="label">Sprint</span>
              </div>
              <div className="key-action-item">
                <span className={`key-cap extra-wide ${isKeyPressed('Space') ? 'active' : ''}`}>
                  SPACE
                </span>
                <span className="label">Jump</span>
              </div>
            </div>

            {/* Mouse Look info */}
            <div className="mouse-look-info">
              <div className="mouse-icon">🖱️</div>
              <div className="mouse-desc">
                <strong>Left Click & Drag:</strong> Orbit camera around Naruto<br />
                <strong>Scroll:</strong> Zoom in / out
              </div>
            </div>

            {/* Chakra / Stamina Meter */}
            <div className="chakra-section">
              <div className="chakra-header">
                <span>CHAKRA / STAMINA</span>
                <span className="chakra-val">{Math.round(chakra)}%</span>
              </div>
              <div className="chakra-bar-track">
                <div
                  className="chakra-bar-fill"
                  style={{ width: `${Math.max(0, Math.min(100, chakra))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom corner info footer */}
      <footer className="hud-footer">
        <div className="footer-tag">
          <span>Boundary Collision Active</span>
          <span className="divider">•</span>
          <span>Camera Collision Guard Active</span>
        </div>
      </footer>
    </div>
  );
}
