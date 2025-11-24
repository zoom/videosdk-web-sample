import { forwardRef, useContext, useEffect, useRef, useImperativeHandle } from 'react';
import classnames from 'classnames';
import Draggable from 'react-draggable';
import { LoadingOutlined } from '@ant-design/icons';
import { useWhiteboard } from '../hooks/useWhiteboard';
import ZoomContext from '../../../context/zoom-context';
import { WhiteboardStatus } from '@zoom/videosdk';
import { Button } from 'antd';
import './whiteboard-view.scss';
interface WhiteboardViewProps {
  className?: string;
  onWhiteboardStatusChange: (isStarting: boolean) => void;
}
const WhiteboardView = forwardRef((props: WhiteboardViewProps, ref: any) => {
  const { onWhiteboardStatusChange } = props;
  const zmClient = useContext(ZoomContext);
  const whiteboardClient = zmClient.getWhiteboardClient();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indicationRef = useRef<HTMLDivElement | null>(null);
  const { status, isCurrenPresenting, presenter, closeWhiteboard, exportWhiteboard } = useWhiteboard(
    zmClient,
    whiteboardClient,
    containerRef
  );
  useEffect(() => {
    onWhiteboardStatusChange(status !== WhiteboardStatus.Closed);
  }, [status, onWhiteboardStatusChange]);
  useImperativeHandle(ref, () => {
    return {
      whiteboardContainerRef: containerRef.current
    };
  }, []);
  return (
    <div
      className={classnames('whiteboard-view', {
        'whiteboard-view-in-progress': status === WhiteboardStatus.Pending || status === WhiteboardStatus.InProgress
      })}
    >
      {status === WhiteboardStatus.InProgress && (
        <Draggable nodeRef={indicationRef} axis="x" bounds="parent">
          <div className="whiteboard-indication-bar" ref={indicationRef}>
            <p className="whiteboard-indication-tip">
              {isCurrenPresenting
                ? 'You are collaborating on this whiteboard'
                : `You are viewing ${presenter?.displayName}'s whiteboard`}
            </p>
            {isCurrenPresenting && (
              <>
                <Button
                  type="primary"
                  color="purple"
                  onClick={() => {
                    exportWhiteboard();
                  }}
                  className="whiteboard-export-btn"
                >
                  Export
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    closeWhiteboard();
                  }}
                  className="whiteboard-close-btn"
                >
                  Close Whiteboard
                </Button>
              </>
            )}
          </div>
        </Draggable>
      )}
      {status === WhiteboardStatus.Pending && (
        <div className="whiteboard-loading">
          <LoadingOutlined style={{ fontSize: '86px' }} />
          <p className="whiteboard-loading-text">Loading your whiteboard experience</p>
        </div>
      )}
      <div className="whiteboard-container" ref={containerRef} />
    </div>
  );
});

export default WhiteboardView;
