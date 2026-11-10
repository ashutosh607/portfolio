import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { resolveSpeakerProfile } from '../config/dialogueData';
import CharacterPortrait from './dialogue/CharacterPortrait';
import DialogueNameplate from './dialogue/DialogueNameplate';
import DialogueText from './dialogue/DialogueText';
import DialogueControls from './dialogue/DialogueControls';
import './dialogue/CinematicDialogue.css';

/**
 * Konoha 3D Portfolio — Borderless Cinematic RPG Dialogue System
 */
export default function CinematicDialogue({
  character,
  onClose,
  onTriggerAction,
}) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [activeDialogueList, setActiveDialogueList] = useState([]);
  const [isShowingReply, setIsShowingReply] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const replyAction=useRef(null);
  const rootRef = useRef(null);
  const gradientRef = useRef(null);
  const portraitRef = useRef(null);
  const nameplateRef = useRef(null);
  const textContainerRef = useRef(null);
  const controlsRef = useRef(null);

  const mountTimestampRef = useRef(0);
  const lastAdvanceTimeRef = useRef(0);

  // Initialize conversation when character changes
  useEffect(() => {
    if (character) {
      mountTimestampRef.current = performance.now();
      replyAction.current=null;
      setActiveDialogueList(character.dialogueSequence || []);
      setCurrentLineIndex(0);
      setIsTyping(true);
      setIsShowingReply(false);
      setIsClosing(false);

      // Preload character portrait if available
      if (character.portrait) {
        const img = new Image();
        img.src = character.portrait;
      }
    }
  }, [character]);

  const currentLine = activeDialogueList[currentLineIndex] || null;
  const isFinalLine =
    activeDialogueList.length > 0 &&
    currentLineIndex >= activeDialogueList.length - 1;

  // Resolve active speaker metadata dynamically (supports multi-character switching)
  const speakerProfile = useMemo(
    () => resolveSpeakerProfile(currentLine, character),
    [currentLine, character]
  );

  // 4-Phase GSAP Opening Animation Sequence
  useEffect(() => {
    if (!character || !rootRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Phase 1: Subtle bottom gradient (0.25s)
      tl.fromTo(
        gradientRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      )
        // Phase 2: Character portrait rises 15px & scales 0.96 -> 1 (0.4s, power3.out)
        .fromTo(
          portraitRef.current,
          { opacity: 0, y: 15, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' },
          '-=0.12'
        )
        // Phase 3: Nameplate reveals left-to-right (0.25s)
        .fromTo(
          nameplateRef.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' },
          '-=0.26'
        )
        // Phase 4: Dialogue text & bottom horizon bar settle in
        .fromTo(
          [textContainerRef.current, controlsRef.current],
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.28, stagger: 0.05, ease: 'power2.out' },
          '-=0.18'
        );
    }, rootRef);

    return () => ctx.revert();
  }, [character]);

  // Smooth Closing Animation (300-450ms)
  const performAnimatedClose = useCallback(
    (afterCloseCallback) => {
      if (isClosing) return;
      setIsClosing(true);
      setIsTyping(false);

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReducedMotion || !rootRef.current) {
        afterCloseCallback?.();
        onClose?.();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          afterCloseCallback?.();
          onClose?.();
        },
      });

      tl.to([textContainerRef.current, controlsRef.current], {
        opacity: 0,
        y: 6,
        duration: 0.18,
        ease: 'power2.in',
      })
        .to(
          nameplateRef.current,
          { opacity: 0, x: -10, duration: 0.18, ease: 'power2.in' },
          '-=0.12'
        )
        .to(
          portraitRef.current,
          { opacity: 0, y: 12, scale: 0.96, duration: 0.22, ease: 'power2.in' },
          '-=0.14'
        )
        .to(
          gradientRef.current,
          { opacity: 0, duration: 0.2, ease: 'power2.inOut' },
          '-=0.15'
        );
    },
    [isClosing, onClose]
  );

  // Advance or Complete Current Typewriter Line
  const handleAdvance = useCallback(() => {
    if (isClosing || !currentLine) return;

    const now = performance.now();
    // Guard against initial E keydown bleed-through or rapid double-triggers
    if (now - mountTimestampRef.current < 180) return;
    if (now - lastAdvanceTimeRef.current < 110) return;
    lastAdvanceTimeRef.current = now;

    if (isTyping) {
      // First press: Instantly complete the current line
      setIsTyping(false);
    } else if (!isFinalLine) {
      // Second press: Advance to the next dialogue line
      setCurrentLineIndex((prev) => prev + 1);
      setIsTyping(true);
    } else {
      const choice=replyAction.current;
      performAnimatedClose(choice?.action && choice.action!=='close' ? ()=>onTriggerAction?.(choice.action,choice) : undefined);
    }
  }, [isClosing, currentLine, isTyping, isFinalLine, performAnimatedClose, onTriggerAction]);

  // Fast Forward Button: Jump straight to final line & reveal choices
  const handleFastForward = useCallback(() => {
    if (isClosing || activeDialogueList.length === 0) return;
    setCurrentLineIndex(activeDialogueList.length - 1);
    setIsTyping(false);
  }, [isClosing, activeDialogueList.length]);

  // Handle Conversation Response Choice Selection
  const handleSelectChoice = useCallback(
    (choice) => {
      if (isClosing) return;

      if (choice.replyDialogue && choice.replyDialogue.length > 0) {
        replyAction.current=choice;
        setIsShowingReply(true);
        setActiveDialogueList(choice.replyDialogue);
        setCurrentLineIndex(0);
        setIsTyping(true);
      } else if (choice.action === 'close') {
        performAnimatedClose();
      } else if (choice.action) {
        performAnimatedClose(() => {
          onTriggerAction?.(choice.action, choice);
        });
      } else {
        performAnimatedClose();
      }
    },
    [isClosing, performAnimatedClose, onTriggerAction]
  );

  // Keyboard Controls: E, Enter, Space to advance; Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not interfere if focus is inside an input/textarea
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        performAnimatedClose();
        return;
      }

      // Let focused dialogue buttons receive native keyboard activation.
      if (rootRef.current?.contains(e.target) && tag === 'button' && (e.code === 'Space' || e.code === 'Enter')) return;

      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        // Prevent Space from making Naruto jump or scrolling page
        e.preventDefault();
        e.stopPropagation();

        // Ignore held key auto-repeat so holding Space/E never skips multiple lines
        if (e.repeat) return;

        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleAdvance, performAnimatedClose, isFinalLine, isTyping]);

  if (!character || !currentLine) return null;

  const activeChoices = isShowingReply
    ? []
    : character.choices || [];

  return (
    <div
      ref={rootRef}
      className="dlg-cinematic-root"
      onClick={(e) => {
        if (e.target.closest('button, a')) return;
        handleAdvance();
      }}
      role="dialog"
      aria-modal="false"
      aria-label={`Conversation with ${character.name}`}
    >
      {/* 1. Bottom Atmospheric Dark Gradient */}
      <div
        ref={gradientRef}
        className="dlg-bottom-gradient"
        aria-hidden="true"
      />

      {/* 2. Floating Bottom Dialogue Stage */}
      <div className="dlg-stage-container">
        {/* Subtle Japanese Cloud Accent on Right */}
        <svg
          viewBox="0 0 180 48"
          className="dlg-cloud-accent-svg"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M 20 34 H 130 C 142 34, 142 22, 130 22 H 75 C 63 22, 63 10, 75 10 H 160"
            stroke="#D4A979"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 45 42 H 155"
            stroke="#B83A35"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Main Row: Character Portrait (Left) + Nameplate & Dialogue Text (Right) */}
        <div className="dlg-main-row">
          <CharacterPortrait
            speakerProfile={speakerProfile}
            portraitRef={portraitRef}
          />

          <div className="dlg-speech-column">
            <DialogueNameplate
              speakerProfile={speakerProfile}
              nameplateRef={nameplateRef}
            />

            <DialogueText
              text={currentLine.text}
              isTyping={isTyping}
              onTypingComplete={() => setIsTyping(false)}
              textContainerRef={textContainerRef}
            />
          </div>
        </div>

        {/* Bottom Horizon Wave, Center Next Chevron, Choices & Fast Forward */}
        <div ref={controlsRef}>
          <DialogueControls
            isTyping={isTyping}
            isFinalLine={isFinalLine}
            choices={activeChoices}
            onAdvance={handleAdvance}
            onFastForward={handleFastForward}
            onSelectChoice={handleSelectChoice}
            onClose={() => performAnimatedClose()}
          />
        </div>
      </div>
    </div>
  );
}
