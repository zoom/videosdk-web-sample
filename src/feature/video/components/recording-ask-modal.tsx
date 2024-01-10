import { Modal, Select, Input, Checkbox, Form } from 'antd';
import classNames from 'classnames';
import './recording-ask-modal.scss';
import { RecordingStatus } from '@zoom/videosdk';
import { useState } from 'react';
interface IsoRecordingModalProps {
  onClick: () => void;
  onCancel: () => void;
}

const IsoRecordingModal = (props: IsoRecordingModalProps) => {
  const [visible, setVisible] = useState(true);
  const { onClick, onCancel } = props;
  return (
    <Modal
      open={visible}
      className="recording-iso-ask-dialog"
      title="ISO Recording Asking"
      okText="Accept"
      onOk={async () => {
        await onClick();
        setVisible(false);
      }}
      onCancel={async () => {
        await onCancel();
        setVisible(false);
      }}
      destroyOnClose
    >
      Do you want you allow Individual Cloud recording mode?
    </Modal>
  );
};

export default IsoRecordingModal;
