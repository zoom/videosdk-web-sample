import { useState, useContext, useEffect, useCallback, useLayoutEffect } from 'react';
import ZoomMediaContext from '../../../context/media-context';
import ZoomContext from '../../../context/zoom-context';
import { ShareStatus } from '@zoom/videosdk';
import { usePrevious } from '../../../hooks';
export function useAnnotation(shareParams: {
  shareStatus: ShareStatus;
  isRecieveSharing: boolean;
  activeSharingId: number;
}) {
  const { shareStatus, isRecieveSharing, activeSharingId } = shareParams;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const [canAnnotation, setCanAnnotation] = useState(!!mediaStream?.canDoAnnotation());
  const [isAnnotationStarted, setIsAnnotationStarted] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const previousActiveSharingId = usePrevious(activeSharingId);
  // Unified function to update canAnnotation based on SDK state
  // Note: mediaStream.canDoAnnotation() internally handles both viewer and presenter scenarios
  const updateCanAnnotation = useCallback(async () => {
    if (mediaStream) {
      const canDo = mediaStream.canDoAnnotation();
      setCanAnnotation(canDo);
      if (!canDo) {
        if (isAnnotationStarted) {
          await mediaStream.stopAnnotation();
        }
        setIsAnnotationStarted(false);
      }
    } else {
      setCanAnnotation(false);
    }
  }, [mediaStream, isAnnotationStarted]);

  const onRedoStatusChange = useCallback((payload: any) => {
    const { status } = payload;
    setCanRedo(status);
  }, []);

  const onUndoStatusChange = useCallback((payload: any) => {
    const { status } = payload;
    setCanUndo(status);
  }, []);

  const onAnnotationViewerDrawRequest = useCallback(async () => {
    if (!isAnnotationStarted) {
      await mediaStream?.startAnnotation();
      setIsAnnotationStarted(true);
    }
  }, [isAnnotationStarted, mediaStream]);

  const onActiveShareChange = useCallback(() => {
    updateCanAnnotation();
  }, [updateCanAnnotation]);

  const onAnnotationPrivilegeChange = useCallback(
    async (_payload: any) => {
      // const { isAnnotationEnabled } = payload;
      // Update annotation capability based on privilege change
      updateCanAnnotation();
    },
    [updateCanAnnotation]
  );
  const onToggleAnnotation = useCallback(async () => {
    if (mediaStream) {
      if (!isAnnotationStarted) {
        await mediaStream.startAnnotation();
        setIsAnnotationStarted(true);
      } else {
        await mediaStream.stopAnnotation();
        setIsAnnotationStarted(false);
      }
    }
  }, [isAnnotationStarted, mediaStream]);

  // Update canAnnotation when mediaStream or shareStatus changes
  useEffect(() => {
    updateCanAnnotation();

    // Auto-stop annotation if share is paused
    if (shareStatus === ShareStatus.Paused && isAnnotationStarted && mediaStream) {
      mediaStream.stopAnnotation().then(() => {
        setIsAnnotationStarted(false);
      });
    }
  }, [mediaStream, shareStatus, isAnnotationStarted, updateCanAnnotation]);
  useLayoutEffect(() => {
    if (
      !!previousActiveSharingId &&
      !!activeSharingId &&
      previousActiveSharingId !== activeSharingId &&
      isAnnotationStarted
    ) {
      mediaStream
        ?.stopAnnotation()
        .catch((_e) => {
          //
        })
        .finally(() => {
          setIsAnnotationStarted(false);
        });
    }
  }, [previousActiveSharingId, activeSharingId, isAnnotationStarted, mediaStream]);
  useEffect(() => {
    if (mediaStream) {
      setCanAnnotation(mediaStream?.canDoAnnotation());
    }
  }, [isRecieveSharing, mediaStream]);

  useEffect(() => {
    zmClient.on('annotation-redo-status', onRedoStatusChange);
    zmClient.on('annotation-undo-status', onUndoStatusChange);
    zmClient.on('annotation-viewer-draw-request', onAnnotationViewerDrawRequest);
    zmClient.on('annotation-privilege-change', onAnnotationPrivilegeChange);
    zmClient.on('share-content-dimension-change', onActiveShareChange);

    return () => {
      zmClient.off('annotation-redo-status', onRedoStatusChange);
      zmClient.off('annotation-undo-status', onUndoStatusChange);
      zmClient.off('annotation-viewer-draw-request', onAnnotationViewerDrawRequest);
      zmClient.off('annotation-privilege-change', onAnnotationPrivilegeChange);
      zmClient.off('share-content-dimension-change', onActiveShareChange);
    };
  }, [
    zmClient,
    onRedoStatusChange,
    onUndoStatusChange,
    onAnnotationViewerDrawRequest,
    onAnnotationPrivilegeChange,
    onActiveShareChange
  ]);
  return {
    canAnnotation,
    canRedo,
    canUndo,
    isAnnotationStarted,
    onToggleAnnotation
  };
}
