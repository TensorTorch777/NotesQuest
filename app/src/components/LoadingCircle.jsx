import React, { useState, useEffect } from 'react';

const LoadingCircle = ({ duration = 5000, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Wait for fade animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 500); // Match the fade-out duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black backdrop-blur-md z-50 flex items-center justify-center transition-opacity duration-500 ${
      isFadingOut ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Outer pulsing circle */}
          <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-pulse-slow"></div>
          {/* Inner rotating circle */}
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">Loading</div>
          <div className="text-sm text-gray-300 loading-dots">Please wait</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCircle;