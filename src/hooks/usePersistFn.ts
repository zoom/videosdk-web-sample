import { useRef } from 'react';

export function usePersistFn(fn: Function) {
  const fnRef = useRef<Function>(fn);
  fnRef.current = fn;
  const persistFn = useRef<Function>();
  if (!persistFn.current) {
    persistFn.current = function (...args: any) {
      return fnRef.current.apply(this, args);
    };
  }
  return persistFn.current;
}
