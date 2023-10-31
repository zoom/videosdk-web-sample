import './CameraManager.scss';

import { useState } from 'react';
import VideoCapture from './VideoCapture';
import CaptureModal from './CaptureModal';
import { CloseOutlined } from '@ant-design/icons';

interface CameraManagerProps {
  onClose: () => void;
}

const CameraManager = (props: CameraManagerProps) => {
  const { onClose } = props;

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleCapture = async (imageSrc: string) => {
    if (imageSrc) {
      setImgSrc(imageSrc);
      setOpen(true);
    }
  };

  return (
    <div className="CameraManager">
      <div className="CameraManager__close">
        <CloseOutlined style={{ fontSize: '26px', color: '#fff' }} onClick={onClose} />
      </div>
      <VideoCapture onCapture={handleCapture} />
      {imgSrc && <CaptureModal imgSrc={imgSrc} open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}
export default CameraManager;
