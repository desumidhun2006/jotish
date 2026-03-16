import { useState, useMemo } from 'react';

/**
 * Custom hook to virtualize a long list of items, rendering only what's visible.
 * 
 * @param {Array} items - The full dataset array.
 * @param {number} itemHeight - Fixed height of each row in pixels.
 * @param {number} containerHeight - The visible height of the scrollable container.
 */
export const useVirtualizer = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (e) => {
    // Read the value synchronously, then update state in the animation frame
    const currentScrollTop = e.currentTarget.scrollTop;
    window.requestAnimationFrame(() => {
      setScrollTop(currentScrollTop);
    });
  };

  // 2. Mathematical calculations for virtualization
  const totalItems = items?.length || 0;
  const totalHeight = totalItems * itemHeight; // The giant invisible "sizer" height

  // Calculate the first and last visible item indexes based on scroll position
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleItemCount + 2); // +2 buffer to prevent flashing

  // 3. Construct the subset of items that actually get mounted into the DOM
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          style: {
            position: 'absolute',
            top: `${i * itemHeight}px`,
            width: '100%',
            height: `${itemHeight}px`,
          }
        });
      }
    }
    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  return { handleScroll, totalHeight, visibleItems };
};