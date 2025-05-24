import React, { useRef, useState, useEffect } from 'react';

interface SwipeableViewProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

const SwipeableView: React.FC<SwipeableViewProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    setTouchEnd(e.targetTouches[0].clientX);
    const currentOffset = touchEnd! - touchStart!;
    setSwipeOffset(currentOffset);
    
    // Add a subtle visual feedback during swipe
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${currentOffset * 0.2}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    // Reset the transform
    if (containerRef.current) {
      containerRef.current.style.transform = '';
    }
    
    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -threshold;
    const isRightSwipe = distance > threshold;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    setSwipeOffset(0);
  };

  return (
    <div
      ref={containerRef}
      className={`transition-transform ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

export default SwipeableView;