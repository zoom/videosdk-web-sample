import { Button, Modal, Select, Slider, Dropdown, Form } from 'antd';
import { useContext, useCallback, useState, useMemo, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import ZoomContext from '../../../context/zoom-context';
import { PauseCircleFilled, PlayCircleFilled, UpOutlined } from '@ant-design/icons';
import './voice-translator.scss';
import { LiveTranscriptionLanguage } from '@zoom/videosdk';
import { getAntdDropdownMenu } from './video-footer-utils';
import { useParticipantsChange } from '../hooks/useParticipantsChange';
import { useVoiceTranslator } from '../hooks/useVoiceTranslator';
const { Button: DropdownButton } = Dropdown;

interface VoiceTranslatorButtonProps {
  className?: string;
}

const VoiceTranslatorButton = (props: VoiceTranslatorButtonProps) => {
  const { className } = props;
  const zmClient = useContext(ZoomContext);
  const voiceTranslatorClient = zmClient.getVoiceTranslatorClient();
  const [isStartedVoiceTranslator, setIsStartedVoiceTranslator] = useState(false);
  const [voiceTranslatorStatus, setVoiceTranslatorStatus] = useState(voiceTranslatorClient.getVoiceTranslatorStatus());
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Settings state
  const [speakingLanguage, setSpeakingLanguage] = useState<string | undefined>('');
  const [listeningLanguage, setListeningLanguage] = useState<string | undefined>('');
  const [balanceVolume, setBalanceVolume] = useState(0.5);
  const [voiceStyle, setVoiceStyle] = useState<number | undefined>(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [langForm] = Form.useForm();
  const toastRef = useRef<{ speakingLanguage: boolean }>({ speakingLanguage: false });
  const [pendingLanguagePrompt, setPendingLanguagePrompt] = useState(false);
  const speakingLanguageOptions = useMemo(() => {
    const { voiceTranslatorLanguage } = voiceTranslatorStatus;
    return voiceTranslatorLanguage
      .split(';')
      .filter((l) => !!l.trim())
      .map((lang) => {
        const languageCode = lang.trim();
        const languageEntry = Object.entries(LiveTranscriptionLanguage).find(([, value]) => value === languageCode);
        return {
          label: languageEntry ? languageEntry[0] : languageCode,
          value: languageCode
        };
      });
  }, [voiceTranslatorStatus]);

  const listeningLanguageOptions = useMemo(() => {
    const { voiceTranslatorLanguagePair } = voiceTranslatorStatus;
    const allTranslationLanguage = voiceTranslatorLanguagePair?.reduce((prev, current) => {
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
        value: languageCode
      };
    });
  }, [voiceTranslatorStatus]);

  // Voice style options
  const voiceStyleOptions = useMemo(() => {
    const { voiceTranslatorVoiceTimberList } = voiceTranslatorStatus;
    return voiceTranslatorVoiceTimberList?.map((timbre) => ({
      label: timbre.name,
      value: timbre.timbreIndex
    }));
  }, [voiceTranslatorStatus]);

  const onVoiceTranslatorClick = useCallback(async () => {
    if (isStartedVoiceTranslator) {
      await voiceTranslatorClient.stopVoiceTranslator();
    } else {
      await voiceTranslatorClient.startVoiceTranslator();
    }
    setIsStartedVoiceTranslator(!isStartedVoiceTranslator);
  }, [isStartedVoiceTranslator, voiceTranslatorClient]);

  const openSettingsModal = useCallback(() => {
    setVoiceTranslatorStatus(voiceTranslatorClient.getVoiceTranslatorStatus());

    setListeningLanguage(voiceTranslatorClient.getCurrentListeningLanguage()?.code);
    setVoiceStyle(voiceTranslatorClient.getCurrentTimbre()?.timbreIndex);
    setBalanceVolume(1 - (voiceTranslatorClient.getOriginalAudioBalance() ?? 0.5));
    if (speakingLanguage) {
      voiceTranslatorClient.setSpeakingLanguage(speakingLanguage);
    } else {
      const currentSpeakingLanguage = voiceTranslatorClient.getCurrentSpeakingLanguage()?.code;
      if (currentSpeakingLanguage) {
        setSpeakingLanguage(currentSpeakingLanguage);
      } else {
        if (speakingLanguageOptions.length > 0) {
          const defaultLanguage = speakingLanguageOptions[0].value;
          voiceTranslatorClient.setSpeakingLanguage(defaultLanguage);
          setSpeakingLanguage(defaultLanguage);
        }
      }
    }
    setIsSettingsModalOpen(true);
  }, [voiceTranslatorClient, speakingLanguage, speakingLanguageOptions]);

  const handleModalClose = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const stopTestVoice = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlayingVoice(false);
  }, []);

  const handleTestVoice = useCallback(() => {
    if (isPlayingVoice) {
      stopTestVoice();
      return;
    }

    const currentTimbre = voiceTranslatorStatus.voiceTranslatorVoiceTimberList?.find(
      (timbre) => timbre.timbreIndex === voiceStyle
    );

    if (!currentTimbre?.voiceUrl) {
      return;
    }

    const audio = new Audio(currentTimbre.voiceUrl);
    audioRef.current = audio;

    audio.onplay = () => {
      setIsPlayingVoice(true);
    };

    audio.onended = () => {
      setIsPlayingVoice(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlayingVoice(false);
      audioRef.current = null;
    };

    audio.play().catch(() => {
      setIsPlayingVoice(false);
      audioRef.current = null;
    });
  }, [isPlayingVoice, voiceStyle, voiceTranslatorStatus.voiceTranslatorVoiceTimberList, stopTestVoice]);

  useEffect(() => {
    return () => {
      stopTestVoice();
    };
  }, [stopTestVoice]);

  const onSpeakingLanguageChange = useCallback(
    async (value: string) => {
      await voiceTranslatorClient.setSpeakingLanguage(value);
      setSpeakingLanguage(value);
    },
    [voiceTranslatorClient]
  );

  const onListeningLanguageChange = useCallback(
    async (value: string) => {
      await voiceTranslatorClient.setListeningLanguage(value);
      setListeningLanguage(value);
    },
    [voiceTranslatorClient]
  );

  const onBalanceVolumeChange = useCallback(
    async (value: number) => {
      await voiceTranslatorClient.setOriginalAudioBalance(1 - Number(value));
      setBalanceVolume(value);
    },
    [voiceTranslatorClient]
  );

  const onVoiceStyleChange = useCallback(
    async (value: number) => {
      await voiceTranslatorClient.setTranslatedVoiceStyle(value);
      setVoiceStyle(value);
    },
    [voiceTranslatorClient]
  );
  useParticipantsChange(zmClient, (participants) => {
    const currentUser = zmClient.getCurrentUserInfo();
    setIsStartedVoiceTranslator(!!currentUser?.isVoiceTranslatorOn);
    if (
      !toastRef.current.speakingLanguage &&
      participants?.some((user) => user.isVoiceTranslatorOn && user.userId !== zmClient.getSessionInfo().userId)
    ) {
      if (currentUser.voiceSpeakingLanguage === undefined) {
        toastRef.current.speakingLanguage = true;
        setVoiceTranslatorStatus(voiceTranslatorClient.getVoiceTranslatorStatus());
        setPendingLanguagePrompt(true);
      }
    }
  });

  useEffect(() => {
    if (!pendingLanguagePrompt || speakingLanguageOptions.length === 0) {
      return;
    }
    setPendingLanguagePrompt(false);
    Modal.confirm({
      title: 'A participant has enabled voice translator. Set your speaking language for this meeting.',
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
              options={speakingLanguageOptions}
            />
          </Form.Item>
        </Form>
      ),
      width: 600,
      onOk: async () => {
        const data = await langForm.validateFields();
        const { lang } = data;
        await voiceTranslatorClient.setSpeakingLanguage(lang);
        setSpeakingLanguage(lang);
      }
    });
  }, [pendingLanguagePrompt, speakingLanguageOptions, langForm, voiceTranslatorClient]);
  useVoiceTranslator();
  return voiceTranslatorStatus.isVoiceTranslatorEnabled ? (
    <div className={classNames('voice-translator-button', className)}>
      {isStartedVoiceTranslator ? (
        <DropdownButton
          className={classNames('vc-dropdown-button', { active: isStartedVoiceTranslator })}
          size="large"
          onClick={onVoiceTranslatorClick}
          menu={getAntdDropdownMenu([], () => {})}
          trigger={['click']}
          type="ghost"
          icon={<UpOutlined />}
          placement="topRight"
          onOpenChange={(open) => {
            if (open) {
              openSettingsModal();
            }
          }}
          open={false}
        >
          <IconFont type="icon-voice-translator" />
        </DropdownButton>
      ) : (
        <Button
          icon={<IconFont type="icon-voice-translator" />}
          size="large"
          type="ghost"
          shape="circle"
          onClick={onVoiceTranslatorClick}
          className={classNames('vc-button', className)}
        />
      )}
      <Modal
        title="My live AI interpreter settings"
        open={isSettingsModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        className="voice-translator-settings-modal"
      >
        <div className="voice-translator-settings">
          <div className="setting-section">
            <label className="setting-label">My speaking language</label>
            <Select
              value={speakingLanguage}
              onChange={onSpeakingLanguageChange}
              options={speakingLanguageOptions}
              className="setting-select"
              style={{ width: '100%' }}
            />
          </div>

          <div className="setting-section">
            <label className="setting-label">Language you want to hear</label>
            <Select
              value={listeningLanguage}
              onChange={onListeningLanguageChange}
              options={listeningLanguageOptions}
              className="setting-select"
              style={{ width: '100%' }}
            />
          </div>

          <div className="setting-section">
            <div className="setting-label-with-action">
              <label className="setting-label">Balance volume</label>
              <Button type="link" onClick={() => onBalanceVolumeChange(0.5)} className="reset-button">
                Reset
              </Button>
            </div>
            <Slider
              value={balanceVolume}
              onChange={onBalanceVolumeChange}
              min={0}
              max={1}
              step={0.01}
              className="volume-slider"
            />
            <div className="volume-labels">
              <span className="volume-label-left">More original audio</span>
              <span className="volume-label-right">More translated audio</span>
            </div>
          </div>

          <div className="setting-section">
            <label className="setting-label">Select your translated voice style</label>
            <Select
              value={voiceStyle}
              onChange={onVoiceStyleChange}
              options={voiceStyleOptions}
              className="setting-select"
              style={{ width: '100%' }}
            />
            <Button
              type="link"
              icon={isPlayingVoice ? <PauseCircleFilled /> : <PlayCircleFilled />}
              onClick={handleTestVoice}
              className="test-voice-button"
            >
              {isPlayingVoice ? 'Stop voice' : 'Test voice'}
            </Button>
          </div>

          <div className="setting-footer">Translation may cause delays in conversation.</div>
        </div>
      </Modal>
    </div>
  ) : null;
};

export default VoiceTranslatorButton;
