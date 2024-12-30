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
    // e.preventDefault();
    // 获取触摸开始时的位置
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
      //   e.preventDefault();
      // 获取触摸移动时的位置
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      // 设置元素新位置
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
      // e.preventDefault();
      // 计算元素新位置
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      // 设置元素新位置
      if (selfViewRef.current) {
        selfViewRef.current.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
      }
    }
  }
  useEffect(() => {
    let tempRef = selfViewRef.current;
    if (isAndroidOrIOSBrowser()) {
      // 触摸开始时触发的事件
      if (tempRef) {
        tempRef.addEventListener('touchstart', touchStart, false);
      }
      // 触摸移动时触发的事件
      window.addEventListener('touchmove', touchMove, false);
      // 触摸结束时触发的事件
      window.addEventListener('touchend', touchEnd, false);
    } else {
      if (tempRef) {
        // 鼠标按下时触发的事件
        tempRef.addEventListener('mousedown', dragStart, false);
      }
      // 鼠标释放时触发的事件
      window.addEventListener('mouseup', dragEnd, false);
      // 鼠标移动时触发的事件
      window.addEventListener('mousemove', drag, false);
    }

    return () => {
      if (isAndroidOrIOSBrowser()) {
        if (tempRef) {
          tempRef.removeEventListener('touchstart', touchStart);
        }
        // 触摸移动时触发的事件
        window.removeEventListener('touchmove', touchMove);
        // 触摸结束时触发的事件
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
