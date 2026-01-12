import { useState } from 'react';

export const useButtonAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return {
    isAnimating,
    triggerAnimation
  };
}; 