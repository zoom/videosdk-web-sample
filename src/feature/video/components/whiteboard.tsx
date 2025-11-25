import { Button, Modal } from 'antd';
import { useContext, useCallback, useState, useEffect } from 'react';
import classNames from 'classnames';
import { WhiteboardStatus } from '@zoom/videosdk';
import { IconFont } from '../../../component/icon-font';
import ZoomContext from '../../../context/zoom-context';
interface WhiteboardButtonProps {
  isHostOrManager: boolean;
  className?: string;
  whiteboardCantainer?: HTMLDivElement | null;
}

const WhiteboardButton = (props: WhiteboardButtonProps) => {
  const { isHostOrManager, className, whiteboardCantainer } = props;
  const zmClient = useContext(ZoomContext);
  const whiteboardClient = zmClient.getWhiteboardClient();
  const [isStartedWhiteboard, setIsStartedWhiteboard] = useState(false);
  const [whiteboardStatus, setWhiteboardStatus] = useState(whiteboardClient.getWhiteboardStatus());
  const onStatusChange = useCallback((payload: WhiteboardStatus) => {
    setWhiteboardStatus(payload);
    if (payload === WhiteboardStatus.Closed) {
      setIsStartedWhiteboard(false);
    }
  }, []);
  const onWhiteboardClick = useCallback(async () => {
    if (isStartedWhiteboard) {
      await whiteboardClient.stopWhiteboardScreen();
      setIsStartedWhiteboard(false);
    } else {
      if (whiteboardCantainer) {
        if (whiteboardStatus !== WhiteboardStatus.Closed) {
          Modal.confirm({
            title: 'Whiteboard Session in Progress',
            content: `${whiteboardClient.getWhiteboardPresenter()?.displayName} is currently presenting a whiteboard. Starting a new whiteboard will stop their session. Do you want to continue?`,
            okText: 'Stop and Start New',
            cancelText: 'Cancel',
            closable: true,
            onOk: () => {
              whiteboardClient.startWhiteboardScreen(whiteboardCantainer);
            },
            onCancel: () => {
              return true;
            }
          });
        } else {
          await whiteboardClient.startWhiteboardScreen(whiteboardCantainer);
          setIsStartedWhiteboard(true);
        }
      }
    }
  }, [whiteboardClient, isStartedWhiteboard, whiteboardCantainer, whiteboardStatus]);
  useEffect(() => {
    zmClient.on('whiteboard-status-change', onStatusChange);
    return () => {
      zmClient.off('whiteboard-status-change', onStatusChange);
    };
  }, [zmClient, onStatusChange]);

  return whiteboardClient.isWhiteboardEnabled() ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isHostOrManager ? (
        <Button
          className={classNames('screen-share-button', 'vc-button', className)}
          icon={<IconFont type="icon-whiteboard" />}
          ghost={true}
          disabled={!whiteboardClient.canStartWhiteboard()}
          shape="circle"
          size="large"
          onClick={onWhiteboardClick}
        />
      ) : null}
    </>
  ) : null;
};

export default WhiteboardButton;
