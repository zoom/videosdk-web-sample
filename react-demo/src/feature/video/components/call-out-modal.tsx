import { Modal, Select, Input, Checkbox, Form } from 'antd';
import classNames from 'classnames';
import './call-out-modal.scss';
interface CallOutModalProps {
  visible: boolean;
  phoneCountryList?: any[];
  phoneCallStatus?: { text: string; type: string };
  setVisible: (visible: boolean) => void;
  onPhoneCallClick?: (code: string, phoneNumber: string, name: string, option: any) => void;
  onPhoneCallCancel?: (code: string, phoneNumber: string, option: any) => Promise<any>;
}

const CallOutModal = (props: CallOutModalProps) => {
  const { visible, phoneCountryList, phoneCallStatus, onPhoneCallClick, onPhoneCallCancel, setVisible } = props;
  const [form] = Form.useForm();
  return (
    <Modal
      open={visible}
      className="join-by-phone-dialog"
      title="Invite by phone"
      okText="Call"
      onOk={async () => {
        try {
          const data = await form.validateFields();
          const {
            phone: { countryCode, phoneNumber },
            callme,
            name,
            greeting,
            press
          } = data;
          const [, code] = countryCode.split('&&');
          if (callme) {
            onPhoneCallClick?.(code, phoneNumber, '', { callMe: true });
          } else {
            onPhoneCallClick?.(code, phoneNumber, name, {
              callMe: false,
              greeting: greeting,
              pressingOne: press
            });
          }
        } catch (e) {
          console.log(e);
        }
      }}
      onCancel={async () => {
        const {
          phone: { countryCode, phoneNumber },
          callme
        } = form.getFieldsValue();
        if (countryCode) {
          const [, code] = countryCode.split('&&');
          await onPhoneCallCancel?.(code || '', phoneNumber, { callMe: callme });
        }

        setVisible(false);
      }}
      destroyOnClose
    >
      <Form form={form} name="call-out-form">
        <Form.Item label="Phone Number" required>
          <Input.Group compact className="phone-number">
            <Form.Item
              name={['phone', 'countryCode']}
              noStyle
              rules={[{ required: true, message: 'Country code is required' }]}
            >
              <Select placeholder="select a country" className="country-code" showSearch optionFilterProp="children">
                {phoneCountryList?.map((item) => (
                  <Select.Option
                    value={`${item.id}&&${item.code}`}
                    key={item.id}
                  >{`${item.name} (${item.code})`}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name={['phone', 'phoneNumber']} noStyle>
              <Input className="number" placeholder="phone number" />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item name="callme" valuePropName="checked">
          <Checkbox>Call me</Checkbox>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.callme !== currentValues.callme}>
          {({ getFieldValue }) =>
            getFieldValue('callme') ? null : (
              <Form.Item
                name="name"
                label="Name"
                required
                rules={[{ required: true, message: 'Please input the name' }]}
              >
                <Input placeholder="name" />
              </Form.Item>
            )
          }
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.callme !== currentValues.callme}>
          {({ getFieldValue }) =>
            getFieldValue('callme') ? null : (
              <Form.Item name="greeting" valuePropName="checked">
                <Checkbox>Require greeting before being connected</Checkbox>
              </Form.Item>
            )
          }
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.callme !== currentValues.callme}>
          {({ getFieldValue }) =>
            getFieldValue('callme') ? null : (
              <Form.Item name="press" valuePropName="checked">
                <Checkbox>Require pressing 1 before being connected</Checkbox>
              </Form.Item>
            )
          }
        </Form.Item>
      </Form>
      {phoneCallStatus && (
        <div className="phone-call-status">
          Phone call status:
          <span className={classNames('status-text', phoneCallStatus.type)}>{phoneCallStatus.text}</span>
        </div>
      )}
    </Modal>
  );
};

export default CallOutModal;
