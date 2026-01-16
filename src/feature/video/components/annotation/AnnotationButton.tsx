import type React from 'react';
import { Button } from 'antd';
import { IconFont } from '../../../../component/icon-font';
import './AnnotationButton.scss';

interface AnnotationButtonProps {
  showToolbox: boolean;
  canAnnotation: boolean;
  onToggle: () => void;
}

const AnnotationButton: React.FC<AnnotationButtonProps> = ({ showToolbox, canAnnotation, onToggle }) => {
  return (
    <Button
      className={`annotation-toggle-btn ${!showToolbox && canAnnotation ? 'visible' : 'hidden'}`}
      onClick={onToggle}
      ghost
    >
      <IconFont type="icon-ann-annotation-btn" />
    </Button>
  );
};

export default AnnotationButton;
