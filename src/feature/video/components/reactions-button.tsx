import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, Popover, Tooltip, message } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import ZoomContext from '../../../context/zoom-context';
import ReactionFloatLayer, { type ReactionFloatItem } from '../../../component/reaction-float-layer';
import { toReactionEmoji } from '../../../utils/reaction-emoji';
import './reactions-button.scss';

const SESSION_REACTIONS = [
  { code: '1f44f', emoji: '👏', name: 'Clap' },
  { code: '1f44d', emoji: '👍', name: 'Thumbs up' },
  { code: '1f602', emoji: '😂', name: 'Joy' },
  { code: '1f62e', emoji: '😮', name: 'Open mouth' },
  { code: '2764-fe0f', emoji: '❤️', name: 'Heart' },
  { code: '1f389', emoji: '🎉', name: 'Tada' }
];

const REACTION_CODE_SET = new Set(SESSION_REACTIONS.map((item) => item.code));
const REACTION_LANE_COUNT = 3;

interface ReactionsButtonProps {
  className?: string;
}

let sequence = 0;
const nextId = () => {
  sequence += 1;
  return `session-reaction-${sequence}`;
};

const collectReactionValues = (payload: unknown): Array<string | number> => {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return [item];
      }
      if (item && typeof item === 'object') {
        const record = item as { emojiUnicode?: string; reaction?: string; emoji?: string };
        const value = record.emojiUnicode || record.reaction || record.emoji;
        return value ? [value] : [];
      }
      return [];
    });
  }
  if (payload && typeof payload === 'object' && 'reactions' in payload) {
    const reactions = (payload as { reactions?: Array<string | number> }).reactions;
    return Array.isArray(reactions) ? reactions : [];
  }
  return [];
};

const ReactionsButton = (props: ReactionsButtonProps) => {
  const { className } = props;
  const zmClient = useContext(ZoomContext);
  const [open, setOpen] = useState(false);
  const [reactionList, setReactionList] = useState<ReactionFloatItem[]>([]);
  const laneRef = useRef(0);

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
        const lane = laneRef.current % REACTION_LANE_COUNT;
        laneRef.current += 1;
        return { id: nextId(), emoji, lane };
      });
      return [...list, ...next].slice(-24);
    });
  }, []);

  useEffect(() => {
    const onEmojiReaction = (payload: unknown) => {
      pushReactions(collectReactionValues(payload));
    };
    zmClient.on('emoji-reaction', onEmojiReaction);
    return () => {
      zmClient.off('emoji-reaction', onEmojiReaction);
    };
  }, [zmClient, pushReactions]);

  const onSend = useCallback(
    async (code: string) => {
      if (!REACTION_CODE_SET.has(code)) {
        return;
      }
      setOpen(false);
      try {
        await zmClient.getReactionsClient().sendEmojiReaction(code);
      } catch (error: any) {
        message.error(error?.reason || 'Failed to send reaction');
      }
    },
    [zmClient]
  );

  return (
    <>
      <Popover
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="top"
        content={
          <div className="reactions-simple-row">
            {SESSION_REACTIONS.map((item) => (
              <Tooltip title={item.name} key={item.code}>
                <button type="button" className="reactions-simple-btn" onClick={() => onSend(item.code)}>
                  {item.emoji}
                </button>
              </Tooltip>
            ))}
          </div>
        }
      >
        <Button
          className={classNames('vc-button', className)}
          icon={<SmileOutlined />}
          ghost={true}
          shape="circle"
          size="large"
          title="Reactions"
        />
      </Popover>
      <ReactionFloatLayer
        variant="fixed"
        items={reactionList}
        onDone={(id) => {
          setReactionList((list) => list.filter((entry) => entry.id !== id));
        }}
      />
    </>
  );
};

export default ReactionsButton;
