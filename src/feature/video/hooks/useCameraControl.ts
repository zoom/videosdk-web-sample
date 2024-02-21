import { useCallback, useEffect, useState, useContext } from 'react';
import { Modal, message } from 'antd';
import produce from 'immer';
import { CameraControlCmd } from '@zoom/videosdk';
import AvatarActionContext from '../context/avatar-context';
import { ZoomClient, MediaStream } from '../../../index-types';
export function useCameraControl(zmClient: ZoomClient, mediaStream: MediaStream | null) {
  const [isInControl, setIsInControl] = useState(false);
  const [controllingUserId, setControllingUserId] = useState(0);
  const [currentControlledUser, setCurrentControlledUser] = useState<{ userId: number; displayName: string }>({
    userId: 0,
    displayName: ''
  });
  const [cameraCapability, setCameraCapability] = useState<
    {
      userId: number;
      ptz: { pan: boolean; tilt: boolean; zoom: boolean };
    }[]
  >([]);
  const {
    dispatch,
    avatarActionState: { isControllingRemoteCamera }
  } = useContext(AvatarActionContext);
  const onReceiveFarEndControl = useCallback(
    ({ userId, displayName, currentControllingUserId, currentControllingDisplayName }: any) => {
      let message = `${displayName} request to control your camera?`;
      if (currentControllingUserId !== undefined) {
        message = `${displayName} want to take over the control of ${currentControllingDisplayName}?`;
      }
      Modal.confirm({
        title: 'Camera control',
        content: message,
        onOk: async () => {
          await mediaStream?.approveFarEndCameraControl(userId);
          setIsInControl(true);
        },
        onCancel: () => {
          mediaStream?.declineFarEndCameraControl(userId);
          setIsInControl(false);
        },
        okText: 'Approve',
        cancelText: 'Decline'
      });
    },
    [mediaStream]
  );
  const onReceiveFarEndControlResponse = useCallback(
    ({ isApproved, userId, displayName }: any) => {
      dispatch({ type: 'set-is-controlling-remote-camera', payload: isApproved });
      if (isApproved) {
        setCurrentControlledUser({ userId, displayName });
        message.info(`You can control ${displayName}'s camera now.`);
      } else {
        setCurrentControlledUser({ userId: 0, displayName: '' });
        message.warn(`${displayName} rejected your control request.`);
      }
    },
    [dispatch]
  );

  const onCameraInControlChange = useCallback(({ isControlled, userId }: any) => {
    if (isControlled) {
      message.info('Your camera is controlled by other one');
    } else {
      message.info('You can control your camera now.');
    }
    setIsInControl(isControlled);
    setControllingUserId(userId);
  }, []);
  const onCameraCapabilityChange = useCallback(({ userId, ptz }: any) => {
    setCameraCapability(
      produce((draft) => {
        const item = draft.find((i) => i.userId === userId);
        if (item) {
          item.ptz = ptz;
        } else {
          draft.push({ userId, ptz });
        }
      })
    );
  }, []);
  const turnLeft = useCallback(
    (range = 5) => {
      if (isControllingRemoteCamera) {
        mediaStream?.controlFarEndCamera({
          cmd: CameraControlCmd.Left,
          userId: currentControlledUser.userId,
          range
        });
      }
    },
    [mediaStream, isControllingRemoteCamera, currentControlledUser]
  );
  const turnRight = useCallback(
    (range = 5) => {
      if (isControllingRemoteCamera) {
        mediaStream?.controlFarEndCamera({
          cmd: CameraControlCmd.Right,
          userId: currentControlledUser.userId,
          range
        });
      }
    },
    [mediaStream, isControllingRemoteCamera, currentControlledUser]
  );
  const turnUp = useCallback(
    (range = 5) => {
      if (isControllingRemoteCamera) {
        mediaStream?.controlFarEndCamera({
          cmd: CameraControlCmd.Up,
          userId: currentControlledUser.userId,
          range
        });
      }
    },
    [mediaStream, isControllingRemoteCamera, currentControlledUser]
  );
  const turnDown = useCallback(
    (range = 5) => {
      if (isControllingRemoteCamera) {
        mediaStream?.controlFarEndCamera({
          cmd: CameraControlCmd.Down,
          userId: currentControlledUser.userId,
          range
        });
      }
    },
    [mediaStream, isControllingRemoteCamera, currentControlledUser]
  );
  const zoomIn = useCallback(
    (range = 5) => {
      if (isControllingRemoteCamera) {
        mediaStream?.controlFarEndCamera({
          cmd: CameraControlCmd.ZoomIn,
          userId: currentControlledUser.userId,
          range
        });
      }
    },
    [mediaStream, isControllingRemoteCamera, currentControlledUser]
  );
  const zoomOut = useCallback(
    (range = 5) => {
      if (isControllingRemoteCamera) {
        mediaStream?.controlFarEndCamera({
          cmd: CameraControlCmd.ZoomOut,
          userId: currentControlledUser.userId,
          range
        });
      }
    },
    [mediaStream, isControllingRemoteCamera, currentControlledUser]
  );
  const switchCamera = useCallback(() => {
    if (isControllingRemoteCamera) {
      mediaStream?.controlFarEndCamera({
        cmd: CameraControlCmd.SwitchCamera,
        userId: currentControlledUser.userId
      });
    }
  }, [mediaStream, isControllingRemoteCamera, currentControlledUser]);
  const stopControl = useCallback(() => {
    if (isInControl) {
      mediaStream?.declineFarEndCameraControl(controllingUserId);
    }
  }, [mediaStream, isInControl, controllingUserId]);

  useEffect(() => {
    zmClient.on('far-end-camera-request-control', onReceiveFarEndControl);
    zmClient.on('far-end-camera-response-control', onReceiveFarEndControlResponse);
    zmClient.on('far-end-camera-in-control-change', onCameraInControlChange);
    zmClient.on('far-end-camera-capability-change', onCameraCapabilityChange);
    return () => {
      zmClient.off('far-end-camera-request-control', onReceiveFarEndControl);
      zmClient.off('far-end-camera-response-control', onReceiveFarEndControlResponse);
      zmClient.off('far-end-camera-in-control-change', onCameraInControlChange);
      zmClient.off('far-end-camera-capability-change', onCameraCapabilityChange);
    };
  }, [
    zmClient,
    onReceiveFarEndControl,
    onReceiveFarEndControlResponse,
    onCameraInControlChange,
    onCameraCapabilityChange
  ]);
  return {
    turnLeft,
    turnRight,
    turnUp,
    turnDown,
    zoomIn,
    zoomOut,
    switchCamera,
    stopControl,
    cameraCapability: cameraCapability.find((c) => c.userId === currentControlledUser.userId)?.ptz,
    isInControl,
    currentControlledUser
  };
}
