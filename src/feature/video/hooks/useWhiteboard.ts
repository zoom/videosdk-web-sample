import { type MutableRefObject, useState, useCallback, useEffect } from 'react';
import { message as toast } from 'antd';
import type { WhiteboardClient, ZoomClient } from '../../../index-types';
import { WhiteboardStatus } from '@zoom/videosdk';
import { useMount } from '../../../hooks';

export function useWhiteboard(
  zmClient: ZoomClient,
  wbClient: WhiteboardClient | null,
  containerRef: MutableRefObject<HTMLDivElement | null>
) {
  const [status, setStatus] = useState(wbClient?.getWhiteboardStatus());
  const [presenter, setPresenter] = useState(wbClient?.getWhiteboardPresenter());
  const onWhiteboardStatusChange = useCallback(
    (payload: any) => {
      setStatus(payload);
      if (wbClient && payload === WhiteboardStatus.InProgress) {
        setPresenter(wbClient.getWhiteboardPresenter());
      }
    },
    [wbClient]
  );
  const onPeerWhiteboardStateChange = useCallback(
    async (payload: any) => {
      const { action, userId } = payload;
      if (containerRef.current && wbClient) {
        if (action === 'Start') {
          await wbClient.startWhiteboardView(containerRef.current, userId);
        } else if (action === 'Stop') {
          await wbClient.stopWhiteboardView();
        }
      }
    },
    [wbClient, containerRef]
  );
  const onWhiteboardPassivelyStopChange = useCallback((payload: any) => {
    toast.warning(`Whiteboard has been passively stop by reason:${payload.reason}`);
  }, []);
  const onCloseWhiteboard = useCallback(() => {
    if (status === WhiteboardStatus.InProgress && presenter?.userId === zmClient.getSessionInfo().userId && wbClient) {
      wbClient.stopWhiteboardScreen();
    }
  }, [status, wbClient, presenter, zmClient]);
  const onExportWhiteboard = useCallback(async () => {
    if (status === WhiteboardStatus.InProgress && presenter?.userId === zmClient.getSessionInfo().userId && wbClient) {
      wbClient.exportWhiteboard('pdf');
    }
  }, [status, wbClient, presenter, zmClient]);
  useEffect(() => {
    zmClient.on('whiteboard-status-change', onWhiteboardStatusChange);
    zmClient.on('peer-whiteboard-state-change', onPeerWhiteboardStateChange);
    zmClient.on(`passively-stop-whiteboard`, onWhiteboardPassivelyStopChange);
    return () => {
      zmClient.off('whiteboard-status-change', onWhiteboardStatusChange);
      zmClient.off('peer-whiteboard-state-change', onPeerWhiteboardStateChange);
      zmClient.off(`passively-stop-whiteboard`, onWhiteboardPassivelyStopChange);
    };
  }, [zmClient, onWhiteboardStatusChange, onPeerWhiteboardStateChange, onWhiteboardPassivelyStopChange]);
  useMount(() => {
    if (presenter?.userId && status === WhiteboardStatus.Closed && containerRef.current) {
      wbClient?.startWhiteboardView(containerRef.current, presenter.userId);
    }
  });
  return {
    status,
    presenter,
    isCurrenPresenting: presenter?.userId === zmClient.getSessionInfo().userId,
    closeWhiteboard: onCloseWhiteboard,
    exportWhiteboard: onExportWhiteboard
  };
}
