import React from 'react';

export default function DialogueControls({
  isTyping,
  isFinalLine,
  choices = [],
  onAdvance,
  onFastForward,
  onSelectChoice,
  onClose,
}) {
  return (
    <div className="dlg-controls-layer" onClick={(e) => e.stopPropagation()}>
      {/* Interactive Choices Row (Revealed on final line completion) */}
      {isFinalLine && !isTyping && (
        <div className="dlg-choices-strip" role="group" aria-label="Conversation Actions">
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="dlg-choice-pill"
              onClick={() => onSelectChoice(choice)}
            >
              <span className="dlg-choice-diamond" aria-hidden="true">
                ✦
              </span>
              <span className="dlg-choice-label">{choice.text}</span>
              <span className="dlg-choice-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}

          <button
            type="button"
            className="dlg-choice-pill dlg-choice-leave"
            onClick={onClose}
          >
            <span>Farewell</span>
          </button>
        </div>
      )}

      {/* Subtle Bottom Horizon Line + Center Next Chevron + Right Fast Forward Pill */}
      <div className="dlg-bottom-bar">
        {/* Thin Restrained Japanese Brush Wave Line */}
        <svg
          viewBox="0 0 900 24"
          className="dlg-horizon-wave-svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 0 14 Q 240 4, 450 16 T 900 10"
            fill="none"
            stroke="url(#dlgWaveGrad)"
            strokeWidth="1.4"
          />
          <defs>
            <linearGradient id="dlgWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7D2428" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#B83A35" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#D4A979" stopOpacity="0.8" />
              <stop offset="65%" stopColor="#B83A35" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#7D2428" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        <div className="dlg-right-actions">
          {(!isFinalLine || isTyping) && (
            <button
              type="button"
              className="dlg-next-pill"
              onClick={onAdvance}
              title={isTyping ? 'Reveal the full line' : 'Advance to the next line'}
            >
              Next <span aria-hidden="true">→</span>
            </button>
          )}
          {(!isFinalLine || isTyping) ? (
            <button
              type="button"
              className="dlg-fast-forward-pill"
              onClick={onFastForward}
              title="Skip to conversation choices"
            >
              <span>Fast Forward</span>
              <svg
                viewBox="0 0 24 24"
                className="dlg-ff-icon-svg"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="5,5 12,12 5,19" />
                <polygon points="13,5 20,12 13,19" />
              </svg>
            </button>
          ) : null}

          <button
            type="button"
            className="dlg-mini-close-btn"
            onClick={onClose}
            title="End conversation (Esc)"
            aria-label="Close conversation"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

