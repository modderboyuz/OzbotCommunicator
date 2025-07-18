import { useState, useEffect } from 'react';

// Simple global state for bottom navigation visibility
let isBottomNavVisible = true;
const listeners: (() => void)[] = [];

export const useBottomNav = () => {
  const [isVisible, setIsVisible] = useState(isBottomNavVisible);

  useEffect(() => {
    const listener = () => setIsVisible(isBottomNavVisible);
    listeners.push(listener);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const hide = () => {
    isBottomNavVisible = false;
    listeners.forEach(listener => listener());
  };

  const show = () => {
    isBottomNavVisible = true;
    listeners.forEach(listener => listener());
  };

  return { isVisible, hide, show };
};
