import React from 'react';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { active, progress, item } = useProgress();

  if (!active && progress === 100) {
    return null;
  }

  const filename = item ? item.split('/').pop() : 'Environment & Character';

  return (
    <div className="konoha-loading-overlay">
      <div className="loading-parchment-scroll">
        {/* Konoha Leaf Swirl Seal */}
        <div className="loading-seal">
          <svg viewBox="0 0 100 100" className="loading-swirl-svg">
            <path
              d="M 50 50 m 0 -5 a 5 5 0 1 1 -5 5 a 12 12 0 1 1 12 12 a 20 20 0 1 1 -20 -20 a 28 28 0 1 1 28 28 l 10 -4"
              fill="none"
              stroke="#c42b1c"
              strokeWidth="6"
              strokeLinecap="round"
              className="rotating-spiral"
            />
          </svg>
          <div className="kanji-seal">木ノ葉</div>
        </div>

        <h2 className="loading-heading">Entering the Hidden Leaf Village...</h2>
        <p className="loading-status">
          {progress < 100 ? `Loading assets: ${filename}` : 'Entering Konoha...'}
        </p>

        {/* Progress Bar with Japanese brocade trim */}
        <div className="parchment-progress-track">
          <div
            className="parchment-progress-bar"
            style={{ width: `${Math.max(6, Math.round(progress))}%` }}
          />
        </div>
        <div className="loading-percentage">{Math.round(progress)}%</div>

        <p className="loading-quote">
          "A shinobi of code, building things worth discovering."
        </p>
      </div>
    </div>
  );
}
