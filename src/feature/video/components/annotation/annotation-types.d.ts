import type { AnnotationToolType, AnnotationClearType } from '@zoom/videosdk';
export type DrawTool = 'pen' | 'highlighter' | 'vanishing-pen';

export type AnnotationTool =
  | 'Mouse'
  | 'Draw'
  | 'Stamp'
  | 'Spotlight'
  | 'Eraser'
  | 'Color'
  | 'Undo'
  | 'Redo'
  | 'Clear'
  | 'VanishingTimer';
export interface AnnotationDrawTools {
  name: string;
  icon?: string;
  value: AnnotationToolType;
  element?: ReactNode;
}

export interface AnnotationToolState {
  tool: AnnotationTool;
  draw?: AnnotationToolType;
  lineWidth: number;
  color: number;
  stamp?: AnnotationToolType;
  spotlight?: AnnotationToolType;
}

export interface AnnotationToolboxProps {
  className?: string;
  isPresenter: boolean;
  isHost: boolean;
  onToolChange?: (toolState: AnnotationToolState) => void;
  onClose?: () => void;
  canRedo: boolean;
  canUndo: boolean;
}

export interface ToolbarButtonProps {
  tool: AnnotationTool;
  icon: string;
  selected?: boolean;
  onClick?: (tool: AnnotationTool) => void;
  className?: string;
}

export interface VanishingTimer {
  displayTime: number;
  vanishingTime: number;
}

export interface SecondaryMenuProps {
  visible: boolean;
  top?: number;
  handleAnnotationToolChange: (value: AnnotationToolType) => void;
  handleAnnotationLineWidthChange: (width: number) => void;
  handleAnnotationColorChange: (color: number) => void;
  handleClearClick: (clearType: AnnotationClearType) => void;
  handleDisplayTimeChange: (value: number) => void;
  handleVanishingTimeChange: (value: number) => void;
  toolState: AnnotationToolState;
  vanishingTimer: VanishingTimer;
  isPresenter?: boolean;
  isHost?: boolean;
}
