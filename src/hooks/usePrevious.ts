import { useRef, useEffect } from 'react';

export function usePrevious<T>(props: T): T | null {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current = props;
  }, [props]);
  return ref.current;
}
