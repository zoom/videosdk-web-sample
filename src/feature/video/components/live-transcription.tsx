import { Dropdown, Switch, message, Modal, Select, Form } from 'antd';
import { useContext, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { LiveTranscriptionLanguage, TranscriptionMode } from '@zoom/videosdk';
import { IconFont } from '../../../component/icon-font';
import { UpOutlined, CheckOutlined } from '@ant-design/icons';
import { getAntdItem, getAntdDropdownMenu, type MenuItem } from './video-footer-utils';
import ZoomContext from '../../../context/zoom-context';
import './live-transcription.scss';
interface LiveTranscriptionButtonProps {
  isHost: boolean;
  className?: string;
}

interface ToastRefState {
  autoCaption: boolean;
  translationStarted: boolean;
}

const LiveTranscriptionButton = (props: LiveTranscriptionButtonProps) => {
  const { isHost, className } = props;
  const zmClient = useContext(ZoomContext);
  const liveTranscriptionClient = zmClient.getLiveTranscriptionClient();
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const [isDisableCaptions, setIsDisableCaptions] = useState(false);
  const [isLockTranscriptionLanguage, setIsLockTranscriptionLanguage] = useState(
    liveTranscriptionClient.getLiveTranscriptionStatus().isHostLockTranscriptionLanguage
  );
  const [currentTranscriptionLanguage, setCurrentTranscriptionLanguage] = useState(
    liveTranscriptionClient.getCurrentTranscriptionLanguage()?.code
  );
  const [currentTranslationLanguage, setCurrentTranslationLanguage] = useState(
    liveTranscriptionClient.getCurrentTranslationLanguage()?.code
  );
  const [isEnableTranslation, setIsEnableTranslation] = useState(false);
  const [isSessionMode, setIsSessionMode] = useState(false);
  const [langForm] = Form.useForm();
  const toastRef = useRef<ToastRefState>({ autoCaption: false, translationStarted: false });
  const transcriptionLanguages = useMemo(() => {
    const { transcriptionLanguage } = liveTranscriptionClient.getLiveTranscriptionStatus();
    return transcriptionLanguage
      .split(';')
      .filter((l) => !!l.trim())
      .map((lang) => {
        const languageCode = lang.trim();
        const languageEntry = Object.entries(LiveTranscriptionLanguage).find(([, value]) => value === languageCode);
        return {
          label: languageEntry ? languageEntry[0] : languageCode,
          code: languageCode
        };
      });
  }, [liveTranscriptionClient]);
  const translationLanguages = useMemo(() => {
    const { translationLanguage } = liveTranscriptionClient.getLiveTranscriptionStatus();
    const allTranslationLanguage = translationLanguage?.reduce((prev, current) => {
      const { translatedToLanguage } = current;
      translatedToLanguage
        .split(';')
        .filter((l) => !!l.trim())
        .forEach((code) => {
          if (!prev.includes(code)) {
            prev.push(code);
          }
        });
      return prev;
    }, [] as string[]);
    return allTranslationLanguage?.map((lang) => {
      const languageCode = lang.trim();
      const languageEntry = Object.entries(LiveTranscriptionLanguage).find(([, value]) => value === languageCode);
      return {
        label: languageEntry ? languageEntry[0] : languageCode,
        code: languageCode
      };
    });
  }, [liveTranscriptionClient]);

  const onMenuItemClick = async (payload: { key: any }) => {
    const { key } = payload;
    if (key === 'translation-toggle') {
      const targetValue = !isEnableTranslation;
      setIsEnableTranslation(targetValue);
      if (targetValue) {
        if (!isStartedLiveTranscription) {
          await onLiveTranscriptionClick();
        }
        await liveTranscriptionClient.setTranslationLanguage(
          (currentTranslationLanguage ?? translationLanguages?.[0]?.code) as unknown as LiveTranscriptionLanguage
        );
      } else {
        await liveTranscriptionClient.setTranslationLanguage();
      }
    } else if (key.startsWith('lang-')) {
      const languageCode = key.replace('lang-', '');
      setCurrentTranscriptionLanguage(languageCode);
      await liveTranscriptionClient.setSpeakingLanguage(languageCode, {
        mode: isSessionMode ? TranscriptionMode.Session : TranscriptionMode.Individual
      });
    } else if (key === 'disable-caption') {
      const value = !isDisableCaptions;
      await liveTranscriptionClient.disableCaptions(value);
      setIsDisableCaptions(value);
      if (value) {
        setIsStartedLiveTranscription(false);
      }
    } else if (key.startsWith('trans-')) {
      const languageCode = key.replace('trans-', '');
      setCurrentTranslationLanguage(languageCode);
      await liveTranscriptionClient.setTranslationLanguage(languageCode);
    } else if (key === 'lock-caption') {
      const value = !isLockTranscriptionLanguage;
      await liveTranscriptionClient.lockTranscriptionLanguage(value);
      setIsLockTranscriptionLanguage(value);
    } else if (key === 'session-mode') {
      setIsSessionMode((val) => !val);
    }
  };

  const languageItems = transcriptionLanguages.map((lang) => ({
    key: `lang-${lang.code}`,
    label: (
      <div className="live-transcription-language-item">
        <span>{lang.label}</span>
        {currentTranscriptionLanguage === lang.code && <CheckOutlined className="check-icon" />}
      </div>
    )
  }));
  const translationLangItems = translationLanguages?.map((lang) => ({
    key: `trans-${lang.code}`,
    label: (
      <div className="live-transcription-language-item">
        <span>{lang.label}</span>
        {currentTranslationLanguage === lang.code && <CheckOutlined className="check-icon" />}
      </div>
    )
  }));

  const menuItems = [
    {
      key: 'captions-translation',
      label: 'Captions and translation',
      type: 'group' as const
    },
    {
      key: 'session-mode',
      label: (
        <div className="live-transcription-menu-item">
          <span>Session mode:</span>
          <Switch size="small" checked={isSessionMode} />
        </div>
      )
    },
    liveTranscriptionClient.getLiveTranscriptionStatus().isLiveTranslationEnabled && {
      key: 'translation-toggle',
      label: (
        <div className="live-transcription-menu-item">
          <span>Translation</span>
          <Switch size="small" checked={isEnableTranslation} />
        </div>
      )
    },
    {
      key: 'caption-language',
      label: (
        <div className="live-transcription-caption-language">
          <span>Caption language:</span>
          <span style={{ fontWeight: 700 }}>
            {transcriptionLanguages.find((lang) => lang.code === currentTranscriptionLanguage)?.label ||
              currentTranscriptionLanguage}
          </span>
        </div>
      ),
      children: languageItems,
      popupClassName: 'vc-dropdown-menu'
    },
    isEnableTranslation && {
      key: 'translation-language',
      label: (
        <div className="live-transcription-caption-language">
          <span>
            My Caption language<i style={{ fontSize: '10px', fontStyle: 'italic' }}>(translation)</i>:
          </span>
          <span style={{ fontWeight: 700 }}>
            {translationLanguages?.find((lang) => lang.code === currentTranslationLanguage)?.label ||
              currentTranslationLanguage}
          </span>
        </div>
      ),
      children: translationLangItems,
      popupClassName: 'vc-dropdown-menu'
    }
  ].filter(Boolean) as MenuItem[];
  if (isHost) {
    menuItems.push(
      ...([
        { type: 'divider' as const },
        {
          key: 'caption-settings',
          label: 'Caption settings',
          type: 'group' as const
        },
        getAntdItem(isDisableCaptions ? 'Enable Captions' : 'Disable Captions', 'disable-caption'),
        !liveTranscriptionClient.getLiveTranscriptionStatus().isLiveTranslationEnabled &&
          getAntdItem(isLockTranscriptionLanguage ? 'Unlock language' : 'Lock Language', 'lock-caption')
      ].filter(Boolean) as MenuItem[])
    );
  }
  const onLiveTranscriptionClick = useCallback(async () => {
    if (isDisableCaptions) {
      message.info('Captions has been disable by host.');
    } else if (isStartedLiveTranscription) {
      message.info('Live transcription has started.');
    } else if (!isStartedLiveTranscription) {
      await liveTranscriptionClient?.startLiveTranscription();
      setIsStartedLiveTranscription(true);
    }
  }, [isStartedLiveTranscription, isDisableCaptions, liveTranscriptionClient]);
  const onCaptionDisable = useCallback((payload: any) => {
    setIsDisableCaptions(payload);
    if (payload) {
      setIsStartedLiveTranscription(false);
    }
  }, []);
  const onCaptionStatusChange = useCallback(
    (payload: any) => {
      const { autoCaption, sessionLanguage, translationStarted } = payload;
      if (autoCaption) {
        const translationLanguage = liveTranscriptionClient.getCurrentTranslationLanguage();
        const transcriptionLanguage = liveTranscriptionClient.getCurrentTranscriptionLanguage();
        setIsEnableTranslation(translationLanguage !== null);
        setCurrentTranscriptionLanguage(transcriptionLanguage?.code);
        setCurrentTranslationLanguage(translationLanguage?.code);
        if (!toastRef.current.autoCaption) {
          message.info('Auto live transcription enabled!', 3);
          toastRef.current.autoCaption = true;
        }
      }
      if (translationStarted && !toastRef.current.translationStarted && !currentTranscriptionLanguage) {
        Modal.confirm({
          title: 'A participant has enabled translation. Set your speaking language for this meeting.',
          content: (
            <Form form={langForm}>
              <h3>My Speaking Language</h3>
              <p>Select the language you will be speaking in for this meeting</p>
              <Form.Item name="lang" required>
                <Select
                  showSearch
                  placeholder="Select speaking language"
                  optionFilterProp="label"
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                  }
                  options={transcriptionLanguages.map((item) => ({ label: item.label, value: item.code }))}
                />
              </Form.Item>
            </Form>
          ),
          onOk: async () => {
            const data = await langForm.validateFields();
            const { lang } = data;
            await liveTranscriptionClient.setSpeakingLanguage(lang);
            setCurrentTranscriptionLanguage(lang);
            toastRef.current.translationStarted = true;
          },
          onCancel: () => {
            toastRef.current.translationStarted = true;
          }
        });
      }
      if (sessionLanguage) {
        message.info(
          `Session language is changed to ${transcriptionLanguages.find((l) => l.code === sessionLanguage)?.label}`,
          3
        );
        setCurrentTranscriptionLanguage(sessionLanguage);
      }
    },
    [currentTranscriptionLanguage, transcriptionLanguages, liveTranscriptionClient, langForm]
  );
  const onCaptionLocked = useCallback((payload: boolean) => {
    setIsLockTranscriptionLanguage(payload);
  }, []);
  useEffect(() => {
    zmClient.on('caption-host-disable', onCaptionDisable);
    zmClient.on('caption-status', onCaptionStatusChange);
    zmClient.on('caption-language-lock', onCaptionLocked);
    return () => {
      zmClient.off('caption-host-disable', onCaptionDisable);
      zmClient.off('caption-status', onCaptionStatusChange);
      zmClient.off('caption-language-lock', onCaptionLocked);
    };
  }, [zmClient, onCaptionDisable, onCaptionStatusChange, onCaptionLocked]);
  return (
    <div>
      <Dropdown.Button
        icon={<UpOutlined />}
        size="large"
        type="ghost"
        menu={getAntdDropdownMenu(menuItems, onMenuItemClick)}
        onClick={onLiveTranscriptionClick}
        placement="topRight"
        trigger={['click']}
        className={classNames('vc-dropdown-button', className, { active: isStartedLiveTranscription })}
      >
        <IconFont type="icon-subtitle" />
      </Dropdown.Button>
    </div>
  );
};

export { LiveTranscriptionButton };
