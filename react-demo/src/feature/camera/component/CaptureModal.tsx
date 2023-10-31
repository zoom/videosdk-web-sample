import { Modal } from 'antd';

interface Props {
  imgSrc: string;
  open: boolean;
  onClose: () => void;
}

const CaptureModal = (props: Props) => {
  const { imgSrc, open, onClose } = props;

  return (
    <Modal title="Captured Image!!" centered open={open} onCancel={onClose} footer={[]} className="CaptureModal">
      <img style={{ width: '100%' }} src={imgSrc} />
    </Modal>
  );
};
export default CaptureModal;
