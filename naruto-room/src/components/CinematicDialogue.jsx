import React, { useState, useEffect, useRef, useCallback } from 'react';

// Character emblems / clan insignias SVG icons for anime RPG dialogue nameplates
const CHARACTER_EMBLEMS = {
  kakashi: (
    <svg viewBox="0 0 100 100" className="char-emblem-svg">
      {/* Kakashi Mangekyo Sharingan motif */}
      <circle cx="50" cy="50" r="42" fill="#c0392b" stroke="#111" strokeWidth="4" />
      <circle cx="50" cy="50" r="14" fill="#111" />
      <path d="M 50 8 C 50 35 32 45 15 50 C 35 55 45 75 50 92 C 50 65 68 55 85 50 C 65 45 55 25 50 8 Z" fill="#111" />
    </svg>
  ),
  sasuke: (
    <svg viewBox="0 0 100 100" className="char-emblem-svg">
      {/* Uchiha Fan crest */}
      <circle cx="50" cy="50" r="42" fill="#1a252f" stroke="#c0392b" strokeWidth="3" />
      <path d="M 50 18 A 28 28 0 0 1 78 46 L 22 46 A 28 28 0 0 1 50 18 Z" fill="#c0392b" />
      <path d="M 22 46 A 28 28 0 0 0 78 46 L 78 52 A 28 28 0 0 1 22 52 Z" fill="#fdfefe" />
      <rect x="46" y="52" width="8" height="26" fill="#fdfefe" rx="3" />
    </svg>
  ),
  sakura: (
    <svg viewBox="0 0 100 100" className="char-emblem-svg">
      {/* Cherry blossom & Byakugou diamond */}
      <circle cx="50" cy="50" r="42" fill="#e84393" stroke="#2d3436" strokeWidth="3" />
      {/* Byakugou violet diamond seal */}
      <polygon points="50,22 64,50 50,78 36,50" fill="#6c5ce7" stroke="#ffffff" strokeWidth="2.5" />
    </svg>
  ),
  hinata: (
    <svg viewBox="0 0 100 100" className="char-emblem-svg">
      {/* Hyuga Byakugan / Gentle Fist flame emblem */}
      <circle cx="50" cy="50" r="42" fill="#4834d4" stroke="#dff9fb" strokeWidth="3" />
      <circle cx="50" cy="50" r="26" fill="#f5f6fa" stroke="#686de0" strokeWidth="3" />
      <circle cx="50" cy="50" r="10" fill="#dff9fb" />
    </svg>
  ),
  tsunade: (
    <svg viewBox="0 0 100 100" className="char-emblem-svg">
      {/* Kanji 賭 (Gamble) & Hokage seal */}
      <circle cx="50" cy="50" r="42" fill="#27ae60" stroke="#f39c12" strokeWidth="3" />
      <text x="50" y="66" textAnchor="middle" fill="#f1c40f" fontSize="46" fontWeight="900" fontFamily="serif">賭</text>
    </svg>
  ),
  jiraiya: (
    <svg viewBox="0 0 100 100" className="char-emblem-svg">
      {/* Kanji 油 (Oil) Toad Sage Forehead Plate */}
      <circle cx="50" cy="50" r="42" fill="#c0392b" stroke="#f1c40f" strokeWidth="3" />
      <text x="50" y="66" textAnchor="middle" fill="#ffffff" fontSize="46" fontWeight="900" fontFamily="serif">油</text>
    </svg>
  ),
  orochimaru: (
    <svg viewBox="0 0 100 100" className="char-emblem-svg">
      {/* Cursed Seal / Snake motif */}
      <circle cx="50" cy="50" r="42" fill="#2c2c54" stroke="#8e44ad" strokeWidth="3" />
      {/* 3 Magatama spiral */}
      <path d="M 50 30 Q 65 30 65 42 Q 65 52 50 50 Q 56 42 50 30 Z" fill="#8e44ad" />
      <path d="M 36 56 Q 36 70 48 70 Q 58 64 50 50 Q 42 58 36 56 Z" fill="#8e44ad" />
      <path d="M 64 56 Q 54 70 42 66 Q 42 54 50 50 Q 58 54 64 56 Z" fill="#8e44ad" />
      <circle cx="50" cy="50" r="5" fill="#f5f6fa" />
    </svg>
  ),
  ashutosh: (
    <svg viewBox="0 0 100 100" className="char-emblem-svg">
      {/* Konoha Spiral Leaf Crest */}
      <circle cx="50" cy="50" r="42" fill="#d35400" stroke="#f39c12" strokeWidth="3" />
      <path
        d="M 50 50 m 0 -5 a 5 5 0 1 1 -5 5 a 12 12 0 1 1 12 12 a 20 20 0 1 1 -20 -20 a 28 28 0 1 1 28 28 l 10 -4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export default function CinematicDialogue({
  character,
  onClose,
  onTriggerAction,
}) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeDialogueList, setActiveDialogueList] = useState([]);
  const [isShowingReply, setIsShowingReply] = useState(false);

  const typewriterTimeout = useRef(null);

  // Initialize dialogue lines
  useEffect(() => {
    if (character) {
      setActiveDialogueList(character.dialogueSequence || []);
      setCurrentLineIndex(0);
      setIsShowingReply(false);
    }
  }, [character]);

  const currentLine = activeDialogueList[currentLineIndex] || null;
  const isFinalLine = currentLineIndex === activeDialogueList.length - 1;

  // Typewriter effect
  useEffect(() => {
    if (!currentLine) return;

    const fullText = currentLine.text;
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    clearTimeout(typewriterTimeout.current);

    const typeNextChar = () => {
      if (charIndex < fullText.length) {
        charIndex += 1;
        setDisplayedText(fullText.slice(0, charIndex));
        typewriterTimeout.current = setTimeout(typeNextChar, 18);
      } else {
        setIsTyping(false);
      }
    };

    typeNextChar();

    return () => {
      clearTimeout(typewriterTimeout.current);
    };
  }, [currentLine, currentLineIndex]);

  // Fast forward typewriter or advance to next line
  const handleAdvance = useCallback(() => {
    if (isTyping && currentLine) {
      // Instant reveal
      clearTimeout(typewriterTimeout.current);
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else if (!isFinalLine) {
      setCurrentLineIndex((prev) => prev + 1);
    }
  }, [isTyping, currentLine, isFinalLine]);

  // Handle Response Choices
  const handleSelectChoice = useCallback((choice) => {
    if (choice.replyDialogue && choice.replyDialogue.length > 0) {
      // Switch to reply dialogue
      setIsShowingReply(true);
      setActiveDialogueList(choice.replyDialogue);
      setCurrentLineIndex(0);
    } else if (choice.action === 'close') {
      onClose();
    } else if (choice.action) {
      onTriggerAction(choice.action, choice);
      onClose();
    } else {
      onClose();
    }
  }, [onClose, onTriggerAction]);

  // Keyboard navigation: Space/Enter to advance, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        if (!isFinalLine || isTyping) {
          e.preventDefault();
          handleAdvance();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleAdvance, onClose, isFinalLine, isTyping]);

  if (!character || !currentLine) return null;

  const isAshutoshSpeaker = currentLine.speaker.toLowerCase().includes('ashutosh');
  const speakerEmblem = isAshutoshSpeaker
    ? CHARACTER_EMBLEMS.ashutosh
    : CHARACTER_EMBLEMS[character.id] || CHARACTER_EMBLEMS.ashutosh;

  return (
    <div className="cinematic-dialogue-overlay" onClick={handleAdvance}>
      {/* Background cinematic vignette & dimming */}
      <div className="dialogue-backdrop-dim" />

      {/* Main Bottom Dialogue Container */}
      <div
        className="cinematic-dialogue-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Character Dialogue"
      >
        {/* Top Header Strip with Konoha styling */}
        <div className="dialogue-panel-header">
          <div className="dialogue-header-left">
            <span className="konoha-sys-label">KONOHA INTERACTION</span>
            <span className="header-divider">•</span>
            <span className="character-rank-badge" style={{ borderColor: character.themeColor }}>
              {character.title}
            </span>
            <span className="location-tag">📍 {character.locationLabel}</span>
          </div>

          <button
            className="dialogue-close-btn"
            onClick={onClose}
            title="End conversation (ESC)"
          >
            ✕ ESC
          </button>
        </div>

        {/* Dialogue Body */}
        <div className="dialogue-panel-body">
          {/* Speaker Portrait / Emblem Frame */}
          <div className={`speaker-portrait-box ${isAshutoshSpeaker ? 'is-player' : ''}`}>
            <div className="portrait-emblem-wrap">
              {speakerEmblem}
            </div>
            <span className="speaker-subtext">
              {isAshutoshSpeaker ? 'SHINOBI OF CODE' : character.japaneseName || '木ノ葉'}
            </span>
          </div>

          {/* Dialogue Text Area */}
          <div className="dialogue-content-area">
            {/* Prominent Speaker Name */}
            <div className="speaker-name-badge">
              <strong className="speaker-name">{currentLine.speaker.toUpperCase()}</strong>
              {isAshutoshSpeaker && <span className="player-tag">YOU</span>}
            </div>

            {/* Subtly Animated Dialogue Speech */}
            <p className="dialogue-text">
              "{displayedText}"
              {isTyping && <span className="typewriter-cursor">▌</span>}
            </p>

            {/* Bottom Controls / Choices Area */}
            <div className="dialogue-action-row">
              {/* If not at the final line or currently typing: Show Advance button */}
              {(!isFinalLine || isTyping) && (
                <button
                  className="dialogue-continue-button"
                  onClick={handleAdvance}
                >
                  <span>{isTyping ? 'Fast Forward' : 'Continue'}</span>
                  <span className="btn-arrow">▸</span>
                </button>
              )}

              {/* Once text finishes on final line: Show response choices */}
              {isFinalLine && !isTyping && (
                <div className="dialogue-choices-container">
                  <div className="choices-prompt">CHOOSE RESPONSE:</div>
                  <div className="choices-grid">
                    {(isShowingReply
                      ? [{ id: 'close', text: 'Farewell', action: 'close' }]
                      : character.choices || []
                    ).map((choice) => (
                      <button
                        key={choice.id}
                        className="ninja-choice-btn"
                        onClick={() => handleSelectChoice(choice)}
                      >
                        <span className="choice-shuriken">✦</span>
                        <span className="choice-text">{choice.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
