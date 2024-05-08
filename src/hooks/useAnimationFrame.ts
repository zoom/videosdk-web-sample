import { useRef, useEffect, useCallback } from 'react';
export const useAnimationFrame = (callback: (time: number) => void) => {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>();

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = window.requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    requestRef.current = window.requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
};
