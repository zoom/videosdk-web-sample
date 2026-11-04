import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Popover, Select, Tooltip, message } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { ReactionType, TranslationLanguage } from '@zoom/videosdk/broadcast-streaming';
import StreamingContext from '../context/streaming-context';
import ReactionFloatLayer, { type ReactionFloatItem } from '../../component/reaction-float-layer';
import { toReactionEmoji } from '../../utils/reaction-emoji';
import './streaming-overlay.scss';

const CHAT_MAX_LENGTH = 200;
const DANMAKU_LANE_COUNT = 4;
const REACTION_LANE_COUNT = 3;

const VIEWER_REACTIONS = [
  { type: ReactionType.Clap, emoji: '👏', name: 'Clap' },
  { type: ReactionType.ThumbsUp, emoji: '👍', name: 'Thumbs up' },
  { type: ReactionType.Joy, emoji: '😂', name: 'Joy' },
  { type: ReactionType.OpenMouth, emoji: '😮', name: 'Open mouth' },
  { type: ReactionType.Heart, emoji: '❤️', name: 'Heart' },
  { type: ReactionType.Tada, emoji: '🎉', name: 'Tada' }
];

const REACTION_TYPE_SET = new Set<number>(
  Object.values(ReactionType).filter((value): value is number => typeof value === 'number')
);

interface DanmakuItem {
  id: string;
  sender: string;
  message: string;
  lane: number;
  isSelf: boolean;
  duration: number;
}

const DANMAKU_DURATION_MIN = 4;
const DANMAKU_DURATION_MAX = 8;

const nextDanmakuDuration = () => {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const ratio = buffer[0] / 0xffffffff;
  return DANMAKU_DURATION_MIN + ratio * (DANMAKU_DURATION_MAX - DANMAKU_DURATION_MIN);
};

let sequence = 0;
const nextId = (prefix: string) => {
  sequence += 1;
  return `${prefix}-${sequence}`;
};

const StreamingOverlay = () => {
  const streaming = useContext(StreamingContext);
  const [connected, setConnected] = useState(false);
  const [canSendChat, setCanSendChat] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [captionLanguage, setCaptionLanguage] = useState('');
  const [caption, setCaption] = useState('');
  const [draft, setDraft] = useState('');
  const [reactionOpen, setReactionOpen] = useState(false);
  const [danmakuList, setDanmakuList] = useState<DanmakuItem[]>([]);
  const [reactionList, setReactionList] = useState<ReactionFloatItem[]>([]);
  const danmakuLaneRef = useRef(0);
  const reactionLaneRef = useRef(0);
  const sendingRef = useRef(false);
  const captionLanguageRef = useRef('');
  const captionTimerRef = useRef<number>();
  captionLanguageRef.current = captionLanguage;

  const languageOptions = useMemo(() => {
    const languages = Object.entries(TranslationLanguage)
      .filter(([, value]) => value !== TranslationLanguage.NoTranslation)
      .map(([label, value]) => ({ label, value }));
    return [
      { label: 'Off', value: '' },
      { label: 'Original caption', value: TranslationLanguage.NoTranslation },
      ...languages
    ];
  }, []);

  const pushReactions = useCallback((values: Array<string | number>) => {
    const emojis = values
      .slice(0, 20)
      .map((value) => toReactionEmoji(value))
      .filter(Boolean);
    if (emojis.length === 0) {
      return;
    }
    setReactionList((list) => {
      const next = emojis.map((emoji) => {
        const lane = reactionLaneRef.current % REACTION_LANE_COUNT;
        reactionLaneRef.current += 1;
        return { id: nextId('reaction'), emoji, lane };
      });
      return [...list, ...next].slice(-24);
    });
  }, []);

  const refreshStreamingFeatures = useCallback(() => {
    setCanSendChat(streaming.canSendChat());
    setTranslationEnabled(streaming.isLiveTranslationEnabled());
  }, [streaming]);

  useEffect(() => {
    const onConnectionChange = (payload: { state?: string }) => {
      const isConnected = payload.state === 'Connected';
      setConnected(isConnected);
      if (isConnected) {
        refreshStreamingFeatures();
      } else {
        setCanSendChat(false);
        setTranslationEnabled(false);
        setCaption('');
      }
    };
    const onChatMessage = (payload: { id?: string; message?: string; sender?: string; isSelf?: boolean }) => {
      const messageText = (payload.message ?? '').trim().slice(0, CHAT_MAX_LENGTH);
      if (!messageText) {
        return;
      }
      const id = payload.id || nextId('chat');
      setDanmakuList((list) => {
        if (list.some((entry) => entry.id === id)) {
          return list;
        }
        const lane = danmakuLaneRef.current % DANMAKU_LANE_COUNT;
        danmakuLaneRef.current += 1;
        return [
          ...list,
          {
            id,
            sender: (payload.sender ?? '').trim().slice(0, 32),
            message: messageText,
            lane,
            isSelf: !!payload.isSelf,
            duration: nextDanmakuDuration()
          }
        ].slice(-40);
      });
    };
    const onChatPrivilegeChange = () => {
      setCanSendChat(streaming.canSendChat());
    };
    const onCaptionMessage = (payload: { message?: string }) => {
      if (!captionLanguageRef.current) {
        return;
      }
      const text = (payload.message ?? '').trim().slice(0, 500);
      setCaption(text);
      if (captionTimerRef.current) {
        window.clearTimeout(captionTimerRef.current);
      }
      if (text) {
        captionTimerRef.current = window.setTimeout(() => {
          setCaption('');
        }, 8000);
      }
    };
    const onCaptionEnable = (enabled: boolean) => {
      setTranslationEnabled(!!enabled);
      if (!enabled) {
        setCaption('');
        if (captionTimerRef.current) {
          window.clearTimeout(captionTimerRef.current);
        }
      }
    };
    const onEmojiReaction = (payload: { reactions?: Array<string | number> }) => {
      pushReactions(payload.reactions ?? []);
    };
    streaming.on('connection-change', onConnectionChange);
    streaming.on('chat-on-message', onChatMessage);
    streaming.on('chat-privilege-change', onChatPrivilegeChange);
    streaming.on('caption-message', onCaptionMessage);
    streaming.on('caption-enable', onCaptionEnable);
    streaming.on('emoji-reaction', onEmojiReaction);
    return () => {
      streaming.off('connection-change', onConnectionChange);
      streaming.off('chat-on-message', onChatMessage);
      streaming.off('chat-privilege-change', onChatPrivilegeChange);
      streaming.off('caption-message', onCaptionMessage);
      streaming.off('caption-enable', onCaptionEnable);
      streaming.off('emoji-reaction', onEmojiReaction);
      if (captionTimerRef.current) {
        window.clearTimeout(captionTimerRef.current);
      }
    };
  }, [streaming, pushReactions, refreshStreamingFeatures]);

  const onSendChat = useCallback(async () => {
    const text = draft.trim().slice(0, CHAT_MAX_LENGTH);
    if (!text || sendingRef.current || !streaming.canSendChat()) {
      return;
    }
    sendingRef.current = true;
    try {
      const result = await streaming.sendChat(text);
      if (result && typeof result === 'object') {
        message.error('Failed to send message');
        return;
      }
      setDraft('');
    } catch {
      message.error('Failed to send message');
    } finally {
      sendingRef.current = false;
    }
  }, [draft, streaming]);

  const onLanguageChange = useCallback(
    async (value: string) => {
      if (value && !Object.values(TranslationLanguage).includes(value as TranslationLanguage)) {
        return;
      }
      try {
        const result = value ? await streaming.setTranslationLanguage(value) : await streaming.setTranslationLanguage();
        if (result && typeof result === 'object') {
          message.error('Failed to set caption language');
          return;
        }
        setCaptionLanguage(value);
        if (!value) {
          setCaption('');
        }
      } catch {
        message.error('Failed to set caption language');
      }
    },
    [streaming]
  );

  const onSendReaction = useCallback(
    async (type: ReactionType) => {
      if (!REACTION_TYPE_SET.has(type)) {
        return;
      }
      setReactionOpen(false);
      try {
        const result = await streaming.sendEmojiReaction(type);
        if (result && typeof result === 'object') {
          message.error('Failed to send reaction');
        }
      } catch {
        message.error('Failed to send reaction');
      }
    },
    [streaming]
  );

  if (!connected) {
    return null;
  }

  return (
    <div className="streaming-overlay">
      <div className="danmaku-layer">
        {danmakuList.map((item) => (
          <div
            key={item.id}
            className={item.isSelf ? 'danmaku-item self' : 'danmaku-item'}
            style={{ top: 12 + item.lane * 36, animationDuration: `${item.duration}s` }}
            onAnimationEnd={() => {
              setDanmakuList((list) => list.filter((entry) => entry.id !== item.id));
            }}
          >
            {item.sender ? <span className="danmaku-sender">{item.sender}</span> : null}
            <span className="danmaku-message">{item.message}</span>
          </div>
        ))}
      </div>
      <ReactionFloatLayer
        variant="overlay"
        items={reactionList}
        onDone={(id) => {
          setReactionList((list) => list.filter((entry) => entry.id !== id));
        }}
      />
      {caption ? <div className="streaming-caption">{caption}</div> : null}
      <div className="streaming-dock">
        {canSendChat ? (
          <Input
            className="streaming-chat-input"
            value={draft}
            maxLength={CHAT_MAX_LENGTH}
            placeholder="Say something..."
            onChange={(event) => setDraft(event.target.value)}
            onPressEnter={onSendChat}
            suffix={
              <Button type="link" size="small" onClick={onSendChat}>
                Send
              </Button>
            }
          />
        ) : (
          <span className="streaming-chat-disabled">Chat is unavailable</span>
        )}
        <Popover
          trigger="click"
          open={reactionOpen}
          onOpenChange={setReactionOpen}
          placement="topRight"
          overlayClassName="streaming-reaction-popover"
          content={
            <div className="streaming-reaction-row">
              {VIEWER_REACTIONS.map((item) => (
                <Tooltip title={item.name} key={item.type}>
                  <button type="button" className="streaming-reaction-btn" onClick={() => onSendReaction(item.type)}>
                    {item.emoji}
                  </button>
                </Tooltip>
              ))}
            </div>
          }
        >
          <Button className="streaming-dock-btn" shape="circle" icon={<SmileOutlined />} title="Reactions" />
        </Popover>
        {translationEnabled ? (
          <Select
            className="streaming-language-select"
            dropdownClassName="streaming-language-dropdown"
            popupClassName="streaming-language-dropdown"
            value={captionLanguage}
            options={languageOptions}
            onChange={onLanguageChange}
            showSearch
            optionFilterProp="label"
            dropdownMatchSelectWidth={false}
          />
        ) : null}
      </div>
    </div>
  );
};

export default StreamingOverlay;
