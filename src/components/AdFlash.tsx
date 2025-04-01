"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import { usePageReload } from '@/hooks/usePageReload';

const AdFlash: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [textAnimated, setTextAnimated] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isReload = usePageReload();

  useEffect(() => {
    // Only show the ad on page reloads, not first visit
    if (isReload) {
      setIsVisible(true);
      
      // Trigger text animation after 1 second
      const textTimer = setTimeout(() => {
        setTextAnimated(true);
      }, 1000);
      
      // Show button after 2 seconds
      const buttonTimer = setTimeout(() => {
        setButtonVisible(true);
      }, 2000);
      
      return () => {
        clearTimeout(textTimer);
        clearTimeout(buttonTimer);
      };
    }
  }, [isReload]);

  const handleClose = () => {
    // First trigger the closing animation
    setIsClosing(true);
    
    // Then actually remove the component after animation completes
    setTimeout(() => {
      setIsVisible(false);
    }, 500); // Match this with the animation duration
  };

  // Handle clicks on the modal content to prevent closing
  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent clicks on the modal from closing it
    e.stopPropagation();
  };

  if (!isVisible) return null;

  return (
    // Add click handler to the overlay background
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-[40%] rounded-lg bg-white dark:bg-gray-800 shadow-lg overflow-hidden 
          transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleModalClick}
      >
        {/* Close button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10" 
          onClick={handleClose}
          aria-label="Close advertisement"
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Ad image with gradient overlay */}
        <div className="relative w-full aspect-square">
          <Image 
            src="/flash_1.png" 
            alt="BHASA AI" 
            fill
            className="object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
          
          {/* Text container - initially centered, then moves left */}
          <div 
            className={`absolute bottom-8 transition-all duration-1000 ease-in-out
              ${textAnimated ? 'left-8' : 'left-1/2 -translate-x-1/2'}`}
          >
            <div className="animate-fadeIn">
              <h3 className="text-lg font-bold text-white">Try BHASA Models Today!</h3>
              <p className="text-sm text-gray-200">
                Experience the power of our custom AI models
              </p>
            </div>
          </div>
          
          {/* Action button - fades in at right */}
          {buttonVisible && (
            <div className="absolute bottom-8 right-8 animate-fadeIn">
              <Button 
                onClick={handleClose}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2"
              >
                Let's Chat!
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdFlash; 