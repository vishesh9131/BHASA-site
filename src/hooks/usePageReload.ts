"use client";

import { useEffect, useState } from 'react';

export function usePageReload() {
  const [isReload, setIsReload] = useState(false);

  useEffect(() => {
    // Check if this is a page reload
    if (typeof window !== 'undefined') {
      const pageLoadCount = localStorage.getItem('pageLoadCount');
      
      if (pageLoadCount) {
        // This is a reload
        setIsReload(true);
        localStorage.setItem('pageLoadCount', String(parseInt(pageLoadCount) + 1));
      } else {
        // First time visit
        localStorage.setItem('pageLoadCount', '1');
      }
    }
  }, []);

  return isReload;
} 