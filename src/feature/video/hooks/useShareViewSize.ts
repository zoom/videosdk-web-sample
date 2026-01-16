import { useRef, useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { useSizeCallback } from '../../../hooks';
import { ShareViewType } from '../video-constants';

/**
 * Custom hook for managing share view size calculation based on container and content dimensions
 *
 * @param containerRef - Reference to the container element
 * @param isActive - Whether the view is active
 * @param sharedContentDimension - Dimensions of the shared content
 * @param viewType - Optional view type (FitWindow or OriginalSize)
 * @returns Object containing containerSize and viewSize
 */
export const useShareViewSize = (
  containerRef: React.RefObject<HTMLDivElement>,
  isActive: boolean,
  sharedContentDimension: { width: number; height: number },
  viewType?: string
) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
  const debounceRef = useRef(_.debounce(setContainerSize, 300));

  const onContainerResize = useCallback(
    ({ width, height }: any) => {
      if (containerRef.current) {
        debounceRef.current({ width, height });
      }
    },
    [containerRef]
  );

  // Initialize container size on mount
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    }
  }, [containerRef]);

  // Listen to container size changes
  useSizeCallback(containerRef.current, onContainerResize);

  // Calculate view size based on container size and content dimension
  useEffect(() => {
    if (isActive && containerRef.current && containerSize.width > 0 && sharedContentDimension.width > 0) {
      const { width, height } = sharedContentDimension;
      const { width: containerWidth, height: containerHeight } = containerSize;

      if (viewType === ShareViewType.OriginalSize) {
        setViewSize({ width, height });
      } else {
        // Default: fit to window
        const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
        setViewSize({
          width: Math.floor(width * ratio),
          height: Math.floor(height * ratio)
        });
      }
    } else {
      setViewSize({ width: 0, height: 0 });
    }
  }, [isActive, sharedContentDimension, containerSize, viewType, containerRef]);

  return { containerSize, viewSize };
};
