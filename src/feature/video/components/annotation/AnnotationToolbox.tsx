import { AnnotationToolType, type AnnotationClearType } from '@zoom/videosdk';
import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import Draggable from 'react-draggable';
import ZoomMediaContext from '../../../../context/media-context';
import { IconFont } from '../../../../component/icon-font';
import type {
  AnnotationDrawTools,
  AnnotationTool,
  AnnotationToolState,
  AnnotationToolboxProps
} from './annotation-types';
import SecondaryMenu from './SecondaryMenu';
import './AnnotationToolbox.scss';
import { getAnnotationDraw, getAnnotationSpotlight, getAnnotationStamp, getPaletteColor } from './use-annotation-tool';
import { useMount } from '../../../../hooks';

const annotationDrawTools = getAnnotationDraw().reduce((p, c) => {
  if (c.type !== 'line witdh') {
    p.push(...c.items);
  }
  return p;
}, [] as Array<AnnotationDrawTools>);
const annotationStampTools = getAnnotationStamp();
const annotationSpotlightTools = getAnnotationSpotlight();
const annotationPaletteColor = getPaletteColor();

// Helper function to check if current tool is a Vanishing type
const isVanishingTool = (toolType?: AnnotationToolType) => {
  return (
    toolType === AnnotationToolType.VanishingPen ||
    toolType === AnnotationToolType.VanishingArrow ||
    toolType === AnnotationToolType.VanishingRectangle ||
    toolType === AnnotationToolType.VanishingEllipse ||
    toolType === AnnotationToolType.VanishingDiamond
  );
};
const AnnotationToolbox: React.FC<AnnotationToolboxProps> = ({
  className,
  isPresenter,
  isHost,
  canRedo,
  canUndo,
  onClose
}) => {
  const [toolState, setToolState] = useState<AnnotationToolState>({
    tool: 'Draw',
    draw: AnnotationToolType.Pen,
    stamp: AnnotationToolType.StampCheck,
    spotlight: isPresenter ? AnnotationToolType.Spotlight : AnnotationToolType.Arrow,
    lineWidth: 2,
    color: 0xff000000
  });
  const { mediaStream } = useContext(ZoomMediaContext);
  const annotationController = mediaStream?.getAnnotationController();
  const [vanishingTimer, setVanishingTimer] = useState(
    annotationController?.getVanishingToolTimer() ?? { displayTime: 0, vanishingTime: 2000 }
  );
  const [secondaryMenu, setSecondaryMenu] = useState<{ visible: boolean; top?: number }>({
    visible: false,
    top: 0
  });
  const previousToolRef = useRef<AnnotationTool>('Draw');
  const toolButtonRef = useRef<Record<string, HTMLButtonElement>>({});
  const toolboxRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const setToolButtonRef = (tool: string, element: HTMLButtonElement) => {
    if (element) {
      toolButtonRef.current[tool] = element;
    }
  };

  const handleToolClick = useCallback(
    (tool: string) => {
      // Calculate draw button position relative to toolbox when showing secondary menu
      if (['Draw', 'Stamp', 'Spotlight', 'Color', 'Clear', 'VanishingTimer'].includes(tool) && toolboxRef.current) {
        const toolboxRect = toolboxRef.current.getBoundingClientRect();
        const buttonRect = toolButtonRef.current[tool]?.getBoundingClientRect() ?? {};
        setSecondaryMenu({
          visible: true,
          top: buttonRect.top - toolboxRect.top
        });

        // Save previous tool when opening Color menu
        if (tool === 'Color') {
          previousToolRef.current = toolState.tool;
        }

        // Immediately set tool type when opening secondary menu
        if (tool === 'Draw' && toolState.draw !== undefined && toolState.lineWidth !== undefined) {
          annotationController?.setToolType(toolState.draw);
          annotationController?.setToolWidth(toolState.lineWidth);
        } else if (tool === 'Stamp' && toolState.stamp !== undefined) {
          annotationController?.setToolType(toolState.stamp);
        } else if (tool === 'Spotlight' && toolState.spotlight !== undefined) {
          annotationController?.setToolType(toolState.spotlight);
        }
      } else {
        if (tool === 'Mouse') {
          annotationController?.setToolType(AnnotationToolType.None);
        } else if (tool === 'Eraser') {
          annotationController?.setToolType(AnnotationToolType.Eraser);
        } else if (tool === 'Undo') {
          annotationController?.undo();
        } else if (tool === 'Redo') {
          annotationController?.redo();
        }
        setSecondaryMenu({
          visible: false,
          top: 0
        });
      }

      setToolState((state) => ({
        ...state,
        tool: tool as AnnotationTool
      }));
    },
    [annotationController, toolState.draw, toolState.stamp, toolState.spotlight, toolState.lineWidth, toolState.tool]
  );

  const handleAnnotationToolChange = useCallback(
    (value: AnnotationToolType) => {
      annotationController?.setToolType(value);
      setToolState((state) => {
        const { tool } = state;
        if (tool === 'Draw') {
          return {
            ...state,
            draw: value
          };
        } else if (tool === 'Stamp') {
          return {
            ...state,
            stamp: value
          };
        } else if (tool === 'Spotlight') {
          return {
            ...state,
            spotlight: value
          };
        }
        return { ...state };
      });
      setSecondaryMenu((state) => ({
        ...state,
        visible: false
      }));
    },
    [annotationController]
  );

  const handleAnnotationLineWidthChange = useCallback(
    (width: number) => {
      annotationController?.setToolWidth(width);
      setToolState((state) => {
        return {
          ...state,
          lineWidth: width
        };
      });
    },
    [annotationController]
  );

  const handleAnnotationColorChange = useCallback(
    (color: number) => {
      annotationController?.setToolColor(color);
      setToolState((state) => {
        // Restore previous tool after color selection
        const restoredTool = previousToolRef.current !== 'Color' ? previousToolRef.current : 'Draw';
        return {
          ...state,
          color,
          tool: restoredTool
        };
      });
      setSecondaryMenu((state) => ({
        ...state,
        visible: false
      }));
    },
    [annotationController]
  );

  const handleClearClick = useCallback(
    (clearType: AnnotationClearType) => {
      annotationController?.clear(clearType);
      setSecondaryMenu((state) => ({
        ...state,
        visible: false
      }));
    },
    [annotationController]
  );

  const handleDisplayTimeChange = useCallback(
    (value: number) => {
      annotationController?.setVanishingToolTimer({ displayTime: value });
      setVanishingTimer((state) => ({
        ...state,
        displayTime: value
      }));
    },
    [annotationController]
  );

  const handleVanishingTimeChange = useCallback(
    (value: number) => {
      annotationController?.setVanishingToolTimer({ vanishingTime: value });
      setVanishingTimer((state) => ({
        ...state,
        vanishingTime: value
      }));
    },
    [annotationController]
  );

  // Handle clicking outside to close secondary menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (secondaryMenu.visible && draggableRef.current && !draggableRef.current.contains(event.target as Node)) {
        setSecondaryMenu((state) => ({
          ...state,
          visible: false
        }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [secondaryMenu]);
  useMount(() => {
    if (annotationController) {
      annotationController.setToolColor(toolState.color);
      annotationController.setToolType(AnnotationToolType.Pen);
      annotationController.setToolWidth(toolState.lineWidth);
    }
  });

  const toolButtons = [
    { tool: 'Mouse', icon: 'icon-ann-mouse' },
    {
      tool: 'Draw',
      icon: annotationDrawTools.find((e) => e.value === toolState.draw)?.icon,
      element: annotationDrawTools.find((e) => e.value === toolState.draw)?.element
    },
    { tool: 'Stamp', icon: annotationStampTools.find((e) => e.value === toolState.stamp)?.icon },
    { tool: 'Spotlight', icon: annotationSpotlightTools.find((e) => e.value === toolState.spotlight)?.icon },
    { tool: 'Eraser', icon: 'icon-ann-eraser' },
    {
      tool: 'Color',
      element: annotationPaletteColor.find((e) => e.value === toolState.color)?.element
    },
    ...(isPresenter && isVanishingTool(toolState.draw) ? [{ tool: 'VanishingTimer', icon: 'icon-ann-timer' }] : []),
    { tool: 'Undo', icon: 'icon-ann-undo', disabled: !canUndo },
    { tool: 'Redo', icon: 'icon-ann-redo', disabled: !canRedo },
    { tool: 'Clear', icon: 'icon-ann-clear' }
  ];

  return (
    <Draggable handle=".annotation-drag-handle" nodeRef={draggableRef}>
      <div className={classNames('annotation-toolbox', className)} ref={draggableRef}>
        <div className="annotation-toolbar" ref={toolboxRef}>
          <Button className="annotation-drag-handle annotation-tool-btn" ghost>
            <IconFont type="icon-ann-more" />
          </Button>
          {toolButtons.map(({ tool, icon, element, disabled }) => (
            <Tooltip key={tool} title={tool} placement="right">
              <Button
                key={tool}
                ref={(e) => setToolButtonRef(tool, e as HTMLButtonElement)}
                className={classNames('annotation-tool-btn', {
                  'annotation-tool-btn-selected': toolState.tool === tool
                })}
                ghost
                onClick={() => handleToolClick(tool)}
                disabled={!!disabled}
              >
                {element || (icon && <IconFont type={icon} />)}
              </Button>
            </Tooltip>
          ))}
          <Button className="annotation-close-btn" ghost danger onClick={onClose}>
            <IconFont type="icon-ann-close" />
          </Button>
        </div>

        <SecondaryMenu
          visible={secondaryMenu.visible}
          top={secondaryMenu.top}
          handleAnnotationToolChange={handleAnnotationToolChange}
          handleAnnotationLineWidthChange={handleAnnotationLineWidthChange}
          handleAnnotationColorChange={handleAnnotationColorChange}
          handleClearClick={handleClearClick}
          handleDisplayTimeChange={handleDisplayTimeChange}
          handleVanishingTimeChange={handleVanishingTimeChange}
          toolState={toolState}
          vanishingTimer={vanishingTimer}
          isPresenter={isPresenter}
          isHost={isHost}
        />
      </div>
    </Draggable>
  );
};

export default AnnotationToolbox;
