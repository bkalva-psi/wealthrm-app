import { useEffect, useState } from 'react';

export function PrivacyOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Show overlay when page is hidden (tab switch, app switcher, etc.)
      setIsVisible(document.hidden);
    };

    const handleWindowBlur = () => {
      // Show overlay when window loses focus
      setIsVisible(true);
    };

    const handleWindowFocus = () => {
      // Hide overlay when window gains focus
      setIsVisible(false);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        pointerEvents: 'none' // Don't interfere with interactions
      }}
    >
      <div className="text-center text-white">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Intellect WealthForce</h2>
        <p className="text-white/70 text-sm">Content secured for privacy</p>
      </div>
    </div>
  );
}