import { Modal, Select, Input, Checkbox, Form } from 'antd';
import { useCallback, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import ZoomContext from '../../../context/zoom-context';
import ZoomMediaContext from '../../../context/media-context';
import './call-out-modal.scss';
import { getPhoneCallStatusDescription } from '../video-constants';
import { useMount } from '../../../hooks';
import { AudioChangeAction, DialoutState, type DialOutOption } from '@zoom/videosdk';
interface CallOutModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const CallOutModal = (props: CallOutModalProps) => {
  const { visible, setVisible } = props;
  const [form] = Form.useForm();
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const [phoneCountryList, setPhoneCountryList] = useState<any[]>(mediaStream?.getSupportCountryInfo() ?? []);
  const [phoneCallStatus, setPhoneCallStatus] = useState<{ text: string; type: string }>({ text: '', type: '' });
  const [welcomeAudioList, setWelcomeAudioList] = useState(mediaStream?.getPhoneWelcomeMessageInfoList() ?? []);
  const onPhoneCallStatusChange = useCallback((payload: any) => {
    const { code } = payload;
    setPhoneCallStatus(getPhoneCallStatusDescription(code));
  }, []);
  const onCurrentAudioChange = useCallback((payload: any) => {
    const { action } = payload;
    if (action === AudioChangeAction.Leave) {
      setPhoneCallStatus({ text: '', type: '' });
    }
  }, []);
  useEffect(() => {
    zmClient.on('dialout-state-change', onPhoneCallStatusChange);
    zmClient.on('current-audio-change', onCurrentAudioChange);
    return () => {
      zmClient.off('dialout-state-change', onPhoneCallStatusChange);
      zmClient.off('current-audio-change', onCurrentAudioChange);
    };
  }, [zmClient, onPhoneCallStatusChange, onCurrentAudioChange]);
  useMount(() => {
    setPhoneCountryList(mediaStream?.getSupportCountryInfo() ?? []);
    setWelcomeAudioList(mediaStream?.getPhoneWelcomeMessageInfoList() ?? []);
  });
  const onPhoneCallClick = useCallback(
    async (code: string, phoneNumber: string, name: string, option: DialOutOption) => {
      await mediaStream?.inviteByPhone(code, phoneNumber, name, option);
    },
    [mediaStream]
  );
  const onPhoneCallCancel = useCallback(
    async (code: string, phoneNumber: string, option: { callMe: boolean }) => {
      if (
        [DialoutState.Calling, DialoutState.Ringing, DialoutState.Accepted, DialoutState.AnsweredByMachine].includes(
          phoneCallStatus as any
        )
      ) {
        await mediaStream?.cancelInviteByPhone(code, phoneNumber, option);
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 3000);
        });
      }
      return Promise.resolve();
    },
    [mediaStream, phoneCallStatus]
  );
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
            press,
            greetingAudio,
            detectMachine
          } = data;
          const [, code] = countryCode.split('&&');
          if (callme) {
            onPhoneCallClick?.(code, phoneNumber, zmClient.getCurrentUserInfo().displayName, {
              callMe: true,
              detectMachine: detectMachine ? 1 : 0
            });
          } else {
            const options = {
              callMe: false,
              greeting: greeting,
              pressingOne: press,
              detectMachine: detectMachine ? 1 : 0
            };
            if (greetingAudio) {
              const [language, identifier] = greetingAudio.split('/');
              Object.assign(options, { language, identifier });
            }
            onPhoneCallClick?.(code, phoneNumber, name, options);
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
        <Form.Item name="detectMachine" valuePropName="checked">
          <Checkbox>Detect Machine</Checkbox>
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
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.callme !== currentValues.callme}>
          {({ getFieldValue }) =>
            getFieldValue('callme') || welcomeAudioList.length === 0 ? null : (
              <Form.Item name="greetingAudio" label="Greeting Audio">
                <Select
                  placeholder="select a greeting audio"
                  className="greeting-audio"
                  showSearch
                  optionFilterProp="children"
                >
                  {welcomeAudioList?.map((item) => (
                    <Select.Option
                      value={`${item.language}/${item.identifier}`}
                      key={`${item.language}/${item.identifier}`}
                    >
                      {item.languageName}
                    </Select.Option>
                  ))}
                </Select>
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
