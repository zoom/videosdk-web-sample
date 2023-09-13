import { useLayoutEffect } from 'react';
interface ResizeObserverEntry {
  target: Element;
}
type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;
export declare class ResizeObserver {
  public constructor(callback: ResizeObserverCallback);
  public observe(target: Element): void;
  public unobserve(target: Element): void;
  public disconnect(): void;
}

export function useSizeCallback(
  target: HTMLElement | null,
  callback: (payload: { width: number; height: number }) => void
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
          height: entry.target.clientHeight
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
