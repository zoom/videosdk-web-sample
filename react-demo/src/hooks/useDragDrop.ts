import { useState, useRef, useCallback, useMemo } from 'react';
type getDragPropsFn = (
  data: any,
) => {
  key: string;
  draggable: 'true';
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
};
interface DragOption {
  onDragStart?: (data: any, e: React.DragEvent) => void;
  onDragEnd?: (data: any, e: React.DragEvent) => void;
}
interface DropAreaState {
  isHover: boolean;
}
interface DropProps {
  onDragOver: React.DragEventHandler;
  onDragEnter: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDrop: React.DragEventHandler;
  onPaste: React.ClipboardEventHandler;
}
interface DropAreaOptions {
  onFiles?: (files: File[], event?: React.DragEvent) => void;
  onUri?: (url: string, event?: React.DragEvent) => void;
  onDom?: (content: any, event?: React.DragEvent) => void;
  onText?: (text: string, event?: React.ClipboardEvent) => void;
}
export function useDrag(options: DragOption): getDragPropsFn {
  return (data) => ({
    key: JSON.stringify(data),
    draggable: 'true',
    onDragStart: (e) => {
      if (options && options.onDragStart) {
        options.onDragStart(data, e);
      }
      e.dataTransfer.setData('custom', JSON.stringify(data));
    },
    onDragEnd: (e) => {
      if (options && options.onDragEnd) {
        options.onDragEnd(data, e);
      }
    },
  });
}

export function useDrop(options: DropAreaOptions): [DropProps, DropAreaState] {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [isHover, setIsHover] = useState(false);
  const onDrop = useCallback(
    (dataTransfer: DataTransfer, event: React.DragEvent | React.ClipboardEvent) => {
      const uri = dataTransfer.getData('text/uri-list');
      const dom = dataTransfer.getData('custom');
      if (dom && optionsRef.current.onDom) {
        let data = dom;
        try {
          data = JSON.parse(dom);
        } catch (e) {
          // nothing
        }
        optionsRef.current.onDom(data, event as React.DragEvent);
      } else if (uri && optionsRef.current.onUri) {
        optionsRef.current.onUri(uri, event as React.DragEvent);
      } else if (
        dataTransfer.files &&
        dataTransfer.files.length > 0 &&
        optionsRef.current.onFiles
      ) {
        optionsRef.current.onFiles(
          Array.from(dataTransfer.files),
          event as React.DragEvent,
        );
      } else if (
        dataTransfer.items &&
        dataTransfer.items.length &&
        optionsRef.current.onText
      ) {
        dataTransfer.items[0].getAsString((text) => {
          optionsRef.current.onText?.(text, event as React.ClipboardEvent);
        });
      }
    },
    [],
  );
  const props = useMemo(
    () => ({
      onDragOver: (event: React.DragEvent) => {
        event.preventDefault();
      },
      onDragEnter: (event: React.DragEvent) => {
        event.preventDefault();
        setIsHover(true);
      },
      onDragLeave: () => {
        setIsHover(false);
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        event.persist();
        setIsHover(false);
        onDrop(event.dataTransfer, event);
      },
      onPaste: (event: React.ClipboardEvent) => {
        event.persist();
        onDrop(event.clipboardData, event);
      },
    }),
    [onDrop],
  );
  return [props, { isHover }];
}
