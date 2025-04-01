"use client";

import { useState, useEffect } from "react";

interface TypewriterEffectProps {
  phrases: string[];
  speed?: number;
  delay?: number;
}

export default function TypewriterEffect({
  phrases,
  speed = 30,
  delay = 1500,
}: TypewriterEffectProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(speed);

  useEffect(() => {
    const intervalId = setTimeout(() => {
      const currentPhrase = phrases[currentPhraseIndex];
      
      // If deleting
      if (isDeleting) {
        setCurrentText(currentPhrase.substring(0, currentText.length - 1));
        setTypingSpeed(speed / 2); // Delete faster than typing
        
        // If deleted everything
        if (currentText.length === 0) {
          setIsDeleting(false);
          setCurrentPhraseIndex((prevIndex) => 
            (prevIndex + 1) % phrases.length
          );
          setTypingSpeed(delay); // Pause before typing next phrase
        }
      } 
      // If typing
      else {
        setCurrentText(currentPhrase.substring(0, currentText.length + 1));
        setTypingSpeed(speed);
        
        // If completed current phrase
        if (currentText.length === currentPhrase.length) {
          setTypingSpeed(delay); // Pause before deleting
          setIsDeleting(true);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(intervalId);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, speed, delay, typingSpeed]);
  return <span className="typewriter">{currentText}<span className="cursor">|</span></span>;


} 