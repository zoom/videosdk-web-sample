import { Button, Tooltip, Slider } from 'antd';
import classNames from 'classnames';
import { AnnotationClearType } from '@zoom/videosdk';
import { IconFont } from '../../../../component/icon-font';
import type { SecondaryMenuProps } from './annotation-types';
import './SecondaryMenu.scss';
import { getAnnotationDraw, getAnnotationSpotlight, getAnnotationStamp, getPaletteColor } from './use-annotation-tool';
import { useMemo } from 'react';

const SecondaryMenu: React.FC<SecondaryMenuProps> = ({
  visible,
  top = 0,
  handleAnnotationToolChange,
  handleAnnotationLineWidthChange,
  handleAnnotationColorChange,
  handleClearClick,
  handleDisplayTimeChange,
  handleVanishingTimeChange,
  toolState,
  vanishingTimer,
  isPresenter,
  isHost
}) => {
  const menuStyle: React.CSSProperties = {
    top: top
  };

  const tools = useMemo(() => {
    const { tool } = toolState;
    if (tool === 'Draw') {
      return getAnnotationDraw();
    } else if (tool === 'Stamp') {
      return getAnnotationStamp();
    } else if (tool === 'Spotlight') {
      const p = getAnnotationSpotlight();
      if (!isPresenter) {
        return p.filter((i) => i.name !== 'Spotlight');
      } else {
        return p;
      }
    } else if (tool === 'Color') {
      return getPaletteColor();
    } else if (tool === 'Clear') {
      const clearOptions = [{ name: 'Clear my drawings', value: AnnotationClearType.Mine }];
      if (isPresenter) {
        clearOptions.push({
          name: "Clear viewer's drawings",
          value: AnnotationClearType.Viewer
        });
      }
      if (isHost) {
        clearOptions.push({ name: 'Clear all drawings', value: AnnotationClearType.All });
      }
      return clearOptions;
    }
    return [];
  }, [toolState, isPresenter, isHost]);

  const getColumnClass = (toolType: string) => {
    if (toolType === 'Draw') {
      return 'four-columns';
    } else if (toolType === 'Color') {
      return 'five-columns';
    }
    return 'one-column';
  };

  const handleItemClick = (item: any, sectionType?: string) => {
    if (sectionType === 'line witdh') {
      handleAnnotationLineWidthChange(item.value);
    } else if (toolState.tool === 'Color') {
      handleAnnotationColorChange(item.value);
    } else if (toolState.tool === 'Clear') {
      handleClearClick(item.value);
    } else {
      handleAnnotationToolChange(item.value);
    }
  };

  const renderToolItem = (item: any, sectionType?: string, keyIndex?: number) => {
    const isSelected =
      (sectionType === 'pen' && toolState.draw === item.value) ||
      (sectionType === 'line witdh' && toolState.lineWidth === item.value) ||
      (sectionType === 'shape' && toolState.draw === item.value) ||
      (toolState.tool === 'Color' && toolState.color === item.value) ||
      (toolState.tool === 'Stamp' && toolState.stamp === item.value) ||
      (toolState.tool === 'Spotlight' && toolState.spotlight === item.value);

    // For Clear tool, show text only
    if (toolState.tool === 'Clear') {
      return (
        <Button
          key={item.value || item.name || keyIndex}
          className={classNames('secondary-menu-btn', {
            'secondary-menu-btn-selected': isSelected
          })}
          ghost
          onClick={() => handleItemClick(item, sectionType)}
        >
          {item.name}
        </Button>
      );
    }

    return (
      <Tooltip key={item.value || item.name || keyIndex} title={item.name} placement="top">
        <Button
          className={classNames('secondary-menu-btn', {
            'secondary-menu-btn-selected': isSelected
          })}
          ghost
          onClick={() => handleItemClick(item, sectionType)}
        >
          {item.element || <IconFont type={item.icon} />}
        </Button>
      </Tooltip>
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="annotation-secondary-menu" style={{ ...menuStyle, width: 'fit-content' }}>
      {toolState.tool === 'VanishingTimer' ? (
        <div className="secondary-menu-section vanishing-timer-section">
          <div className="section-title">Display Time (seconds)</div>
          <div className="slider-container">
            <Slider
              min={0}
              max={15000}
              step={1000}
              value={vanishingTimer.displayTime}
              onChange={handleDisplayTimeChange}
              tooltip={{ formatter: (value) => `${(value ?? 0) / 1000}s` }}
            />
          </div>
          <div className="section-title">Vanishing Time (seconds)</div>
          <div className="slider-container">
            <Slider
              min={0}
              max={15000}
              step={1000}
              value={vanishingTimer.vanishingTime}
              onChange={handleVanishingTimeChange}
              tooltip={{ formatter: (value) => `${(value ?? 0) / 1000}s` }}
            />
          </div>
        </div>
      ) : toolState.tool === 'Draw' ? (
        tools.map((tool: any, index: number) => (
          <div key={tool.title || index} className="secondary-menu-section">
            <div className="section-title">{tool.title}</div>
            <div className={classNames('section-content', getColumnClass(toolState.tool))}>
              {tool.items.map((item: any) => renderToolItem(item, tool.type))}
            </div>
          </div>
        ))
      ) : (
        <div className="secondary-menu-section">
          <div className={classNames('section-content', getColumnClass(toolState.tool))}>
            {tools.map((tool: any, index: number) => renderToolItem(tool, undefined, index))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondaryMenu;
