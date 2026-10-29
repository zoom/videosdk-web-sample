import classNames from 'classnames';
import { createPortal } from 'react-dom';
import './reaction-float-layer.scss';

export interface ReactionFloatItem {
  id: string;
  emoji: string;
  lane: number;
}

interface ReactionFloatLayerProps {
  items: ReactionFloatItem[];
  variant: 'overlay' | 'fixed';
  onDone: (id: string) => void;
}

const ReactionFloatLayer = (props: ReactionFloatLayerProps) => {
  const { items, variant, onDone } = props;
  if (items.length === 0) {
    return null;
  }
  const layer = (
    <div className={classNames('reaction-float-layer', variant)}>
      {items.map((item) => (
        <span
          key={item.id}
          className="reaction-float-item"
          style={{ left: item.lane * 36 }}
          onAnimationEnd={() => onDone(item.id)}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
  if (variant === 'fixed') {
    return createPortal(layer, document.body);
  }
  return layer;
};

export default ReactionFloatLayer;
