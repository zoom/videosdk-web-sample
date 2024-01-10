import { useRef, useEffect } from 'react';
import { MutableRefObject } from 'react';
export function useEventListener(
  target:
    | MutableRefObject<HTMLElement | null | undefined>
    | HTMLElement
    | null
    | undefined,
  eventName: string,
  handler: Function,
  options = { capture: false, passive: false },
) {
  const handlerRef = useRef<Function>();
  handlerRef.current = handler;
  useEffect(() => {
    let targetElement: null | Window | HTMLElement = null;
    if (!target) {
      targetElement = window;
    } else if (Object.hasOwnProperty.call(target, 'current')) {
      targetElement = (target as MutableRefObject<HTMLElement>).current;
    } else {
      targetElement = target as HTMLElement;
    }
    if (targetElement && targetElement.addEventListener) {
      const eventListener = (event: Event) =>
        handlerRef.current && handlerRef.current(event);
      targetElement.addEventListener(eventName, eventListener, {
        capture: options.capture,
        passive: options.passive,
      });
      return () => {
        targetElement?.removeEventListener(eventName, eventListener, {
          capture: options.capture,
        });
      };
    }
    return () => {
      //
    };
  }, [target, eventName, options]);
}
