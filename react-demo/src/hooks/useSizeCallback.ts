import { useLayoutEffect } from 'react';
interface ResizeObserverEntry {
  target: Element;
}
type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;
export declare class ResizeObserver {
  constructor(callback: ResizeObserverCallback);
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

export function useSizeCallback(
  target: HTMLElement | null,
  callback: (payload: { width: number; height: number }) => void,
) {
  useLayoutEffect(() => {
    if (!target) {
      return () => {
        //
      };
    }
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        callback({
          width: entry.target.clientWidth,
          height: entry.target.clientHeight,
        });
      });
    });
    resizeObserver.observe(target);
    return () => {
      resizeObserver.unobserve(target);
      resizeObserver.disconnect();
    };
  }, [target, callback]);
}
