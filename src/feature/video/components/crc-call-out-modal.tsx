import { useContext, useState, useEffect, useCallback } from 'react';
import { Modal, Input, Radio, Form } from 'antd';
import classNames from 'classnames';
import ZoomContext from '../../../context/zoom-context';
import ZoomMediaContext from '../../../context/media-context';
import './call-out-modal.scss';
import { CRCReturnCode } from '@zoom/videosdk';
import { getCRCCallStatus } from '../video-constants';
const { Group: RadioGroup } = Radio;
interface CRCCallOutModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const CRCCallOutModal = (props: CRCCallOutModalProps) => {
  const { visible, setVisible } = props;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const [form] = Form.useForm();
  const [status, setStatus] = useState(-1);
  const onCrcStatusChange = useCallback((payload: any) => {
    const { code, ip, protocol, uuid } = payload;
    setStatus(code);
  }, []);
  useEffect(() => {
    zmClient.on('crc-call-out-state-change', onCrcStatusChange);
    return () => {
      zmClient.off('crc-call-out-state-change', onCrcStatusChange);
    };
  }, [zmClient, onCrcStatusChange]);
  return (
    <Modal
      open={visible}
      className="join-by-phone-dialog"
      title="Call a H.323/SIP Room System"
      okText="Call"
      onOk={async () => {
        try {
          const data = await form.validateFields();
          const { ip, protocol } = data;
          mediaStream?.callCRCDevice(ip, protocol);
        } catch (e) {
          console.warn(e);
        }
      }}
      onCancel={async () => {
        if (status === CRCReturnCode.Ringing) {
          const { ip, protocol } = await form.validateFields();
          mediaStream?.cancelCallCRCDevice(ip, protocol);
        }
        setVisible(false);
      }}
      destroyOnClose
    >
      <Form form={form} name="call-out-form">
        <Form.Item label="H.323/SIP Room System" name="ip" required>
          <Input className="ip" placeholder="IP Address" />
        </Form.Item>
        <Form.Item name="protocol" valuePropName="checked" required>
          <RadioGroup defaultValue={1}>
            <Radio value={1}>H323</Radio>
            <Radio value={2}>SIP</Radio>
          </RadioGroup>
        </Form.Item>
      </Form>
      {status !== -1 && (
        <div className="phone-call-status">
          CRC call status:
          <span className={classNames('status-text', getCRCCallStatus(status)?.type)}>
            {getCRCCallStatus(status)?.text}
          </span>
        </div>
      )}
    </Modal>
  );
};

export default CRCCallOutModal;
