import { useState, useRef } from "react";

interface UseSlideProps {
  data?: unknown[];
  visibleCount?: number;
}

export function useSlide({ data = [], visibleCount = 4 }: UseSlideProps) {
  const [startIndex, setStartIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  const canSlideLeft = startIndex > 0;
  const canSlideRight = startIndex + visibleCount < data.length;

  const slideLeft = () => {
    if (canSlideLeft) setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const slideRight = () => {
    if (canSlideRight)
      setStartIndex((prev) => Math.min(data.length - visibleCount, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
        return swipeDistance > 0 ? slideRight() : slideLeft();
    }

    isDragging.current = false;
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const visibleData = data.slice(startIndex, startIndex + visibleCount);
  const totalPages = Math.ceil(data.length / visibleCount);
  const currentPage = Math.floor(startIndex / visibleCount);

  return {
    startIndex,
    canSlideLeft,
    canSlideRight,
    slideLeft,
    slideRight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    visibleData,
    totalPages,
    currentPage,
    setStartIndex,
  };
}