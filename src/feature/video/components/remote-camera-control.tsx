import { useState, useEffect, useRef, useContext } from 'react';
import {
  DownOutlined,
  UpOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  MinusOutlined,
  RetweetOutlined
} from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import Draggable from 'react-draggable';
import { usePrevious } from '../../../hooks/index';
import ZoomContext from '../../../context/zoom-context';
import ZoomMediaContext from '../../../context/media-context';
import './remote-camera-control.scss';
import { IconFont } from '../../../component/icon-font';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import classNames from 'classnames';
import { useCameraControl } from '../hooks/useCameraControl';
import AvatarContext from '../context/avatar-context';

interface RemoteControlIndicationProps {
  stopCameraControl: () => void;
}
const RemoteCameraControlIndication = (props: RemoteControlIndicationProps) => {
  const { stopCameraControl } = props;
  const menu = [getAntdItem('Stop camera control', 'stop')];
  const onMenuItemClick = (payload: { key: any }) => {
    stopCameraControl();
  };
  return (
    <Dropdown
      className={classNames('vc-dropdown-button')}
      menu={getAntdDropdownMenu(menu, onMenuItemClick)}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        icon={<IconFont type="icon-remote-control" />}
        size="large"
        ghost={true}
        shape="circle"
        className={classNames('vc-button', 'remote-control-dropdown')}
      />
    </Dropdown>
  );
};

interface RemoteCameraControlPanelProps {
  className?: string;
}
type controlFuc = (range?: number) => void;
const RemoteCameraControlPanel = (props: RemoteCameraControlPanelProps) => {
  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);
  const {
    avatarActionState: { isControllingRemoteCamera }
  } = useContext(AvatarContext);
  const {
    currentControlledUser,
    isInControl,
    cameraCapability,
    stopControl,
    turnDown,
    turnRight,
    turnLeft,
    turnUp,
    zoomIn,
    zoomOut,
    switchCamera
  } = useCameraControl(zmClient, mediaStream);

  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef(0);
  const draggableRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<controlFuc | undefined>(undefined);
  const isPreviousPressing = usePrevious(isPressing);
  useEffect(() => {
    if (isPressing && !isPreviousPressing) {
      timerRef.current = window.setInterval(() => {
        controlRef.current?.(4);
      }, 500);
    } else if (isPressing === false && isPreviousPressing) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = 0;
        controlRef.current?.(2);
      }
    }
  }, [isPressing, isPreviousPressing]);
  return (
    <>
      {isControllingRemoteCamera && (
        <Draggable nodeRef={draggableRef} handle=".control-title">
          <div className="remote-camera-control-panel" ref={draggableRef}>
            <h3
              className="control-title"
              title={`${currentControlledUser.displayName}'s camera`}
            >{`${currentControlledUser.displayName}'s camera`}</h3>
            <div className="control-wrap">
              <div className="zoom-control">
                <Button
                  icon={<PlusOutlined />}
                  ghost
                  disabled={!cameraCapability?.zoom}
                  onMouseDown={() => {
                    controlRef.current = zoomIn;
                    setIsPressing(true);
                  }}
                  onMouseUp={() => {
                    setIsPressing(false);
                  }}
                />
                <Button
                  icon={<MinusOutlined />}
                  ghost
                  disabled={!cameraCapability?.zoom}
                  onMouseDown={() => {
                    controlRef.current = zoomOut;
                    setIsPressing(true);
                  }}
                  onMouseUp={() => {
                    setIsPressing(false);
                  }}
                />
              </div>
              <nav className="pan-control">
                <div className={classNames('turn-up', 'pan-control-btn')}>
                  <Button
                    ghost
                    disabled={!cameraCapability?.tilt}
                    icon={<UpOutlined />}
                    onMouseDown={() => {
                      controlRef.current = turnUp;
                      setIsPressing(true);
                    }}
                    onMouseUp={() => {
                      setIsPressing(false);
                    }}
                  />
                </div>
                <div className={classNames('turn-left', 'pan-control-btn')}>
                  <Button
                    ghost
                    disabled={!cameraCapability?.pan}
                    icon={<LeftOutlined />}
                    onMouseDown={() => {
                      controlRef.current = turnLeft;
                      setIsPressing(true);
                    }}
                    onMouseUp={() => {
                      setIsPressing(false);
                    }}
                  />
                </div>
                <div className={classNames('center-button', 'pan-control-btn')}>
                  <Button
                    ghost
                    icon={<RetweetOutlined />}
                    onClick={() => {
                      switchCamera();
                    }}
                  />
                </div>
                <div className={classNames('turn-right', 'pan-control-btn')}>
                  <Button
                    ghost
                    disabled={!cameraCapability?.pan}
                    icon={<RightOutlined />}
                    onMouseDown={() => {
                      controlRef.current = turnRight;
                      setIsPressing(true);
                    }}
                    onMouseUp={() => {
                      setIsPressing(false);
                    }}
                  />
                </div>
                <div className={classNames('turn-down', 'pan-control-btn')}>
                  <Button
                    ghost
                    disabled={!cameraCapability?.tilt}
                    icon={<DownOutlined />}
                    onMouseDown={() => {
                      controlRef.current = turnDown;
                      setIsPressing(true);
                    }}
                    onMouseUp={() => {
                      setIsPressing(false);
                    }}
                  />
                </div>
              </nav>
            </div>
          </div>
        </Draggable>
      )}
      {isInControl && <RemoteCameraControlIndication stopCameraControl={stopControl} />}
    </>
  );
};

export default RemoteCameraControlPanel;
