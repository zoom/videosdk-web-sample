import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ZoomClient, MediaStream } from '../../../index-types';
import { ApprovedState, RemoteControlAppStatus, RemoteControlSessionStatus } from '@zoom/videosdk';
import { message, Modal, Checkbox } from 'antd';
export function useRemoteControl(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  selfShareView: HTMLCanvasElement | HTMLVideoElement | null,
  shareView: HTMLCanvasElement | null
) {
  const [isControllingUser, setIsControllingUser] = useState(mediaStream?.isControllingUserRemotely());
  const [controllingUser, setControllingUser] = useState<{ userId: number; displayName: string } | null>(null);
  const isDownloadAppRef = useRef(false);
  const launchModalRef = useRef<any>(null);
  const runAsAdminRef = useRef<any>(null);
  const onInControllingChange = useCallback((payload: any) => {
    const { isControlling } = payload;
    setIsControllingUser(isControlling);
  }, []);
  const onControlApproveChange = useCallback(
    (payload: any) => {
      const { state } = payload;
      if (state === ApprovedState.Approved) {
        if (shareView) {
          const viewport = shareView.parentElement;
          if (viewport) {
            mediaStream?.startRemoteControl(viewport);
          }
        }
      } else {
        message.info('Your remote control request is rejected');
      }
    },
    [mediaStream, shareView]
  );
  const onReceiveRemoteControlRequest = useCallback(
    (payload: any) => {
      const { userId, displayName, isSharingEntireScreen } = payload;
      if (isSharingEntireScreen) {
        setControllingUser({ userId, displayName });
      }
      Modal.confirm({
        title: `${displayName} is requesting remote control of your screen`,
        content: isSharingEntireScreen ? (
          <>
            <div>
              In order to control your screen, you must install Zoom Remote Control app with a size of 4 MB to continue.
              You can regain control at any time by clicking on your screen.
            </div>
            {navigator.platform?.startsWith('Win') && (
              <div style={{ color: '#999', marginTop: '20px' }}>
                <Checkbox ref={runAsAdminRef}>Enable the RemoteControl App to control of all applications</Checkbox>
              </div>
            )}
          </>
        ) : (
          'To be controlled, you must share your entire screen instead of a tab or window. After sharing the entire screen, you’ll be requested again.'
        ),
        okText: isSharingEntireScreen ? 'Approve' : 'Select Entire Screen',
        cancelText: 'Decline',
        onOk: async () => {
          if (isSharingEntireScreen) {
            mediaStream?.approveRemoteControl(userId, !!runAsAdminRef.current?.input?.checked);
          } else {
            await mediaStream?.stopShareScreen();
            if (selfShareView) {
              await mediaStream?.startShareScreen(selfShareView, { displaySurface: 'monitor' });
            }
          }
        },
        onCancel: () => {
          mediaStream?.declineRemoteControl(userId);
          setControllingUser(null);
        }
      });
    },
    [mediaStream, selfShareView]
  );
  const onRemoteControlAppStatusChange = useCallback(
    (payload: any) => {
      if (payload === RemoteControlAppStatus.Uninstalled || payload === RemoteControlAppStatus.Unknown) {
        const { displayName, userId } = controllingUser || {};
        launchModalRef.current = Modal.confirm({
          title: `${displayName} is requesting remote control of your screen`,
          content:
            'Click "Download App" to get started. Once the app is installed, click "Open App" to launch the app to join the remote control session.',
          okText: 'Download',
          cancelText: 'Decline',
          onOk: async () => {
            if (!isDownloadAppRef.current) {
              const isChrome = /chrome/i.test(navigator.userAgent);
              const aLink = document.createElement('a');
              aLink.href = mediaStream?.getRemoteControlAppDownloadUrl() || '';
              aLink.target = isChrome ? '_self' : '_blank';
              aLink.rel = 'noreferrer';
              if (!isChrome) {
                aLink.download = 'true';
              }
              aLink.click();
              isDownloadAppRef.current = true;
              launchModalRef.current?.update({ okText: 'Launch' });
              // eslint-disable-next-line prefer-promise-reject-errors
              return Promise.reject('');
            } else {
              await mediaStream?.launchRemoteControlApp();
            }
          },
          onCancel: () => {
            mediaStream?.declineRemoteControl(userId || 0);
            setControllingUser(null);
          }
        });
      } else if (payload === RemoteControlAppStatus.Unlaunched) {
        const { userId } = controllingUser || {};
        Modal.confirm({
          title: 'Remote control app launch timeout',
          content: 'Reapprove yongle yang to control your screen.',
          okText: 'Approve',
          cancelText: 'Decline',
          onOk: async () => {
            if (userId) {
              mediaStream?.approveRemoteControl(userId);
            }
          },
          onCancel: () => {
            if (userId) {
              mediaStream?.declineRemoteControl(userId);
              setControllingUser(null);
            }
          }
        });
      }
    },
    [controllingUser, mediaStream]
  );
  const onRemoteControlSessionChange = useCallback((payload: any) => {
    if (payload === RemoteControlSessionStatus.Ended) {
      setControllingUser(null);
    } else if (payload === RemoteControlSessionStatus.Started) {
      launchModalRef.current?.destroy();
    }
  }, []);
  useEffect(() => {
    zmClient.on('remote-control-in-control-change', onInControllingChange);
    zmClient.on('remote-control-approved-change', onControlApproveChange);
    zmClient.on('remote-control-request-change', onReceiveRemoteControlRequest);
    zmClient.on('remote-control-app-status-change', onRemoteControlAppStatusChange);
    zmClient.on('remote-control-controlled-status-change', onRemoteControlSessionChange);
    return () => {
      zmClient.off('remote-control-in-control-change', onInControllingChange);
      zmClient.off('remote-control-approved-change', onControlApproveChange);
      zmClient.off('remote-control-request-change', onReceiveRemoteControlRequest);
      zmClient.off('remote-control-app-status-change', onRemoteControlAppStatusChange);
      zmClient.off('remote-control-controlled-status-change', onRemoteControlSessionChange);
    };
  }, [
    zmClient,
    onInControllingChange,
    onControlApproveChange,
    onReceiveRemoteControlRequest,
    onRemoteControlAppStatusChange,
    onRemoteControlSessionChange
  ]);
  return { isControllingUser, controllingUser };
}
