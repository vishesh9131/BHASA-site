"use client";

import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayAfterPhrase?: number;
  className?: string;
  showCursor?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayAfterPhrase = 1500,
  className = "",
  showCursor = true
}) => {
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
      // Typing forward
      if (displayedText.length < currentPhrase.length) {
        const timer = setTimeout(() => {
          setDisplayedText(currentPhrase.substring(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Finished typing current phrase
        setIsTyping(false);
        setIsPaused(true);
      }
    } else if (isDeleting) {
      // Deleting text
      if (displayedText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Move to next phrase
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
};

export default TypewriterText; 