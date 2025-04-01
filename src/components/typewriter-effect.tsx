"use client";

import React, { useState, useEffect } from "react";

interface TypewriterEffectProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayAfterPhrase?: number;
  className?: string;
  showCursor?: boolean;
}

export default function TypewriterEffect({
  phrases,
  typingSpeed = 30,
  deletingSpeed = 30,
  delayAfterPhrase = 1000,
  className = "",
  showCursor = true
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;

    const currentPhrase = phrases[currentPhraseIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, delayAfterPhrase);
      return () => clearTimeout(pauseTimer);
    }

    if (isTyping && !isDeleting) {
      if (displayedText.length < currentPhrase.length) {
        const timer = setTimeout(() => {
          setDisplayedText(currentPhrase.substring(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        setIsPaused(true);
      }
    } else if (isDeleting) {
      if (displayedText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setIsTyping(true);
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
      }
    }
  }, [
    displayedText, 
    currentPhraseIndex, 
    isTyping, 
    isDeleting, 
    isPaused, 
    phrases, 
    typingSpeed, 
    deletingSpeed, 
    delayAfterPhrase
  ]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
} 