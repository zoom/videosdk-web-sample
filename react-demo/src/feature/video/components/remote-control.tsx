import { useState, useEffect, useRef, useContext } from 'react';
import { CameraControlCmd } from '@zoom/videosdk';
import {
  CaretUpOutlined,
  CaretDownOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  RetweetOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined
} from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { usePrevious } from '../../../hooks/index';
import ZoomMediaContext from '../../../context/media-context';
import './remote-control.scss';
import { IconFont } from '../../../component/icon-font';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import classNames from 'classnames';

interface RemoteControlPanelProps {
  turnLeft: (range?: number) => void;
  turnRight: (range?: number) => void;
  turnUp: (range?: number) => void;
  turnDown: (range?: number) => void;
  zoomIn: (range?: number) => void;
  zoomOut: (range?: number) => void;
  switchCamera: () => void;
  controlledName: string;
}
type controlFuc = (range?: number) => void;
const RemoteControlPanel = (props: RemoteControlPanelProps) => {
  const { turnDown, turnLeft, turnRight, turnUp, zoomIn, zoomOut, switchCamera, controlledName } = props;
  const { mediaStream } = useContext(ZoomMediaContext);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef(0);
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
    <div className="remote-control-panel">
      <h3 className="control-title">{`${controlledName}'s camera`}</h3>
      <div className="control-wrap">
        <div className="zoom-control">
          <Button
            icon={<PlusSquareOutlined />}
            onMouseDown={() => {
              controlRef.current = zoomIn;
              setIsPressing(true);
            }}
            onMouseUp={() => {
              setIsPressing(false);
            }}
          />
          <Button
            icon={<MinusSquareOutlined />}
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
          <Button
            type="link"
            className="turn-up"
            icon={<CaretUpOutlined />}
            onMouseDown={() => {
              controlRef.current = turnUp;
              setIsPressing(true);
            }}
            onMouseUp={() => {
              setIsPressing(false);
            }}
          />
          <Button
            type="link"
            className="turn-right"
            icon={<CaretRightOutlined />}
            onMouseDown={() => {
              controlRef.current = turnRight;
              setIsPressing(true);
            }}
            onMouseUp={() => {
              setIsPressing(false);
            }}
          />
          <Button
            type="link"
            className="turn-left"
            icon={<CaretLeftOutlined />}
            onMouseDown={() => {
              controlRef.current = turnLeft;
              setIsPressing(true);
            }}
            onMouseUp={() => {
              setIsPressing(false);
            }}
          />
          <Button
            type="link"
            className="turn-down"
            icon={<CaretDownOutlined />}
            onMouseDown={() => {
              controlRef.current = turnDown;
              setIsPressing(true);
            }}
            onMouseUp={() => {
              setIsPressing(false);
            }}
          />
          <Button
            type="link"
            className="center-button"
            icon={<RetweetOutlined />}
            onClick={() => {
              switchCamera();
            }}
          />
        </nav>
      </div>
    </div>
  );
};
interface RemoteControlIndicationProps {
  stopCameraControl: () => void;
}
export const RemoteControlIndication = (props: RemoteControlIndicationProps) => {
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
export default RemoteControlPanel;
