import type React from 'react';
// eslint-disable-next-line no-duplicate-imports
import { useState, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import { Modal } from 'antd';
interface DraggableModalProps {
  title: string | React.ReactNode;
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  width?: number;
}
interface DragBound {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
const DraggableModal = (props: DraggableModalProps) => {
  const { title, visible, children, onClose, onCancel, onOk, okText, cancelText, width } = props;
  const [disabled, setDisabled] = useState<boolean>(true);
  const [bounds, setBounds] = useState<DragBound>({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  });
  const draggleRef = useRef<HTMLDivElement>(null);
  const onModalMouseOver = useCallback(() => {
    if (disabled) {
      setDisabled(false);
    }
  }, [disabled]);
  const onModalMouseOut = useCallback(() => {
    setDisabled(true);
  }, []);
  const onDragStart = useCallback((event: any, uiData: any) => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { clientWidth, clientHeight } = window?.document?.documentElement;
    const targetRect = draggleRef?.current?.getBoundingClientRect();
    setBounds({
      left: -(targetRect as DOMRect).left + uiData?.x,
      right: clientWidth - ((targetRect as DOMRect)?.right - uiData?.x),
      top: -(targetRect as DOMRect)?.top + uiData?.y,
      bottom: clientHeight - ((targetRect as DOMRect)?.bottom - uiData?.y)
    });
  }, []);
  const isShowFooter = !!onOk;
  const restModalProps = isShowFooter
    ? {
        okText,
        cancelText,
        onOk,
        onCancel
      }
    : { footer: null };
  return (
    <Modal
      title={
        <div className="breakout-room-title" onMouseOver={onModalMouseOver} onMouseOut={onModalMouseOut}>
          {title}
        </div>
      }
      open={visible}
      // eslint-disable-next-line react/no-unstable-nested-components
      modalRender={(modal) => (
        <Draggable disabled={disabled} bounds={bounds} onStart={onDragStart} nodeRef={draggleRef}>
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
      onCancel={onClose}
      width={width || 600}
      className="room-modal"
      {...restModalProps}
    >
      {children}
    </Modal>
  );
};
export default DraggableModal;
