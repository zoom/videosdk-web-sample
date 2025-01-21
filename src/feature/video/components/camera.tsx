import { useContext } from 'react';
import { Button, Tooltip, Dropdown } from 'antd';
import { CheckOutlined, UpOutlined, VideoCameraAddOutlined, VideoCameraOutlined } from '@ant-design/icons';
import ZoomMediaContext from '../../../context/media-context';
import classNames from 'classnames';
import type { MediaDevice } from '../video-types';
import { type MenuItem, getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
interface CameraButtonProps {
  isStartedVideo: boolean;
  isMirrored?: boolean;
  isBlur?: boolean;
  isPreview?: boolean;
  onCameraClick: () => void;
  onSwitchCamera: (deviceId: string) => void;
  onMirrorVideo?: () => void;
  onVideoStatistic?: () => void;
  onBlurBackground?: () => void;
  onSelectVideoPlayback?: (url: string) => void;
  onSelectVideoProcessor?: (processor: any) => void;
  className?: string;
  cameraList?: MediaDevice[];
  activeCamera?: string;
  activePlaybackUrl?: string;
  activeProcessor?: string;
}
const videoPlaybacks = [
  { title: 'ZOOM ZWA', url: 'https://source.zoom.us/brand/mp4/Using%20the%20Zoom%20PWA.mp4' },
  { title: 'ZOOM Cares', url: 'https://source.zoom.us/brand/mp4/Zoom%20Cares%20Nonprofit%20Impact.mp4' },
  {
    title: 'ZOOM One',
    url: 'https://source.zoom.us/brand/mp4/Zoom%20One%20-%20Team%20Chat%2C%20Phone%2C%20Email%2C%20and%20more.mp4'
  }
];
const videoProcessor = [
  {
    url: `${location.origin}/static/processors/watermark-processor.js`,
    type: 'video',
    name: 'watermark-processor',
    options: {}
  }
];
const CameraButton = (props: CameraButtonProps) => {
  const {
    isStartedVideo,
    className,
    cameraList,
    activeCamera,
    isMirrored,
    isBlur,
    isPreview,
    activePlaybackUrl,
    onCameraClick,
    onSwitchCamera,
    onMirrorVideo,
    onVideoStatistic,
    onBlurBackground,
    onSelectVideoPlayback,
    onSelectVideoProcessor,
    activeProcessor
  } = props;
  const { mediaStream } = useContext(ZoomMediaContext);
  const onMenuItemClick = (payload: { key: any }) => {
    const processor = videoProcessor.find((item) => item.name === payload.key);
    if (payload.key === 'mirror') {
      onMirrorVideo?.();
    } else if (payload.key === 'statistic') {
      onVideoStatistic?.();
    } else if (payload.key === 'blur') {
      onBlurBackground?.();
    } else if (/^https:\/\//.test(payload.key)) {
      onSelectVideoPlayback?.(payload.key);
    } else if (processor) {
      onSelectVideoProcessor?.(processor);
    } else {
      onSwitchCamera(payload.key);
    }
  };
  const menuItems =
    cameraList &&
    cameraList.length > 0 &&
    ([
      getAntdItem(
        'Select a Camera',
        'camera',
        undefined,
        cameraList.map((item) =>
          getAntdItem(item.label, item.deviceId, item.deviceId === activeCamera && <CheckOutlined />)
        ),
        'group'
      ),
      !isPreview &&
        getAntdItem(
          'Select a Video Playback',
          'playback',
          undefined,
          videoPlaybacks.map((item) =>
            getAntdItem(item.title, item.url, item.url === activePlaybackUrl && <CheckOutlined />)
          ),
          'group'
        ),

      !isPreview &&
        mediaStream?.isSupportVideoProcessor() &&
        getAntdItem(
          'Select a Video Processor',
          'processor',
          undefined,
          videoProcessor.map((item) =>
            getAntdItem(item.name, item.name, item.name === activeProcessor && <CheckOutlined />)
          ),
          'group'
        ),
      getAntdItem('', 'd1', undefined, undefined, 'divider'),
      !isPreview && getAntdItem('Mirror My Video', 'mirror', isMirrored && <CheckOutlined />),
      mediaStream?.isSupportVirtualBackground()
        ? getAntdItem('Blur My Background', 'blur', isBlur && <CheckOutlined />)
        : getAntdItem('Mask My Background', 'blur'),
      !isPreview && getAntdItem('', 'd2', undefined, undefined, 'divider'),
      !isPreview && getAntdItem('Video Statistic', 'statistic')
    ].filter(Boolean) as MenuItem[]);
  return (
    <div className={classNames('camera-footer', className)}>
      {isStartedVideo && menuItems ? (
        <Dropdown.Button
          className="vc-dropdown-button"
          size="large"
          menu={getAntdDropdownMenu(menuItems, onMenuItemClick)}
          onClick={onCameraClick}
          trigger={['click']}
          type="ghost"
          icon={<UpOutlined />}
          placement="topRight"
        >
          <VideoCameraOutlined />
        </Dropdown.Button>
      ) : (
        <Tooltip title={`${isStartedVideo ? 'stop camera' : 'start camera'}`}>
          <Button
            className={classNames('vc-button', className)}
            icon={isStartedVideo ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
            ghost={true}
            shape="circle"
            size="large"
            onClick={onCameraClick}
          />
        </Tooltip>
      )}
    </div>
  );
};
export default CameraButton;
