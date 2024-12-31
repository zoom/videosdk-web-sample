import React, { useEffect, useRef } from 'react';
import { isAndroidOrIOSBrowser } from '../.../../../../utils/platform';
interface WrapperProps {
  children: React.ReactNode | undefined;
  className?: string;
  customstyle?: Record<string, any>;
}
function Draggable({ children, className, customstyle }: WrapperProps) {
  const selfViewRef = useRef<HTMLDivElement>(null);
  let active = false;
  let currentX: number;
  let currentY: number;
  let initialX: number;
  let initialY: number;
  let xOffset = 0;
  let yOffset = 0;
  function touchStart(e: TouchEvent) {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
    active = true;
  }
  function touchEnd(_e: TouchEvent) {
    if (active) {
      active = false;
    }
  }
  function touchMove(e: TouchEvent) {
    if (active) {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      if (selfViewRef.current) {
        selfViewRef.current.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
      }
    }
  }
  function dragStart(e: MouseEvent) {
    if (e.type === 'mousedown') {
      active = true;
      // 获取鼠标指针位置
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }
  }

  function dragEnd(_e: MouseEvent) {
    if (active) {
      active = false;
    }
  }

  function drag(e: MouseEvent) {
    if (active) {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      if (selfViewRef.current) {
        selfViewRef.current.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
      }
    }
  }
  useEffect(() => {
    let tempRef = selfViewRef.current;
    if (isAndroidOrIOSBrowser()) {
      if (tempRef) {
        tempRef.addEventListener('touchstart', touchStart, false);
      }
      window.addEventListener('touchmove', touchMove, false);
      window.addEventListener('touchend', touchEnd, false);
    } else {
      if (tempRef) {
        tempRef.addEventListener('mousedown', dragStart, false);
      }
      window.addEventListener('mouseup', dragEnd, false);
      window.addEventListener('mousemove', drag, false);
    }

    return () => {
      if (isAndroidOrIOSBrowser()) {
        if (tempRef) {
          tempRef.removeEventListener('touchstart', touchStart);
        }
        window.removeEventListener('touchmove', touchMove);
        window.removeEventListener('touchend', touchEnd);
      } else {
        if (tempRef) {
          tempRef.removeEventListener('mousedown', dragStart);
        }
        window.removeEventListener('mouseup', dragEnd);
        window.removeEventListener('mousemove', drag);
      }
    };
  }, []);
  return (
    <div className={className} ref={selfViewRef} style={{ ...customstyle }}>
      {children}
    </div>
  );
}

export default React.memo(Draggable);
