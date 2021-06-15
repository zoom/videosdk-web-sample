import { useState, MutableRefObject } from 'react';
import { useEventListener } from './useEventListener';
interface HoverOption {
  onEnter?: () => void;
  onLeave?: () => void;
}
export function useHover(
  ref: MutableRefObject<HTMLElement | null>,
  options?: HoverOption,
) {
  const [isHover, setIsHover] = useState(false);
  const { onEnter, onLeave } = options || {};
  useEventListener(ref, 'mouseenter', () => {
    onEnter && onEnter();
    setIsHover(true);
  });
  useEventListener(ref, 'mouseleave', () => {
    onLeave && onLeave();
    setIsHover(false);
  });
  return isHover;
}
