import { useCallback, useEffect } from 'react';
import { ChatFileDownloadStatus, ChatFileUploadStatus } from '@zoom/videosdk';
import { Button } from 'antd';
import { CloseOutlined, FileImageOutlined } from '@ant-design/icons';
import { IconFont } from '../../../component/icon-font';
import { FileInfo } from '../chat-types';
import './chat-image-message-item.scss';
interface ChatImageMessageItemProps {
  file: FileInfo;
  id?: string;
  resendFile: (retryToken: string, fileUuid: string) => void;
  downloadFile: (id: string, blob?: boolean) => void;
}
const getImageErrorTip = (file: FileInfo) => {
  if (file.upload?.status === ChatFileUploadStatus.Fail) {
    return '- Click to resend';
  } else if (file.download?.status === ChatFileDownloadStatus.Fail) {
    return '- Click to retry';
  }
};
const ChatImageMessageItem = (props: ChatImageMessageItemProps) => {
  const { file, id, resendFile, downloadFile } = props;
  const isUploadLoading = file.upload && file.upload.status === ChatFileUploadStatus.InProgress;
  const isDownloadLoading = file.download && file.download.status === ChatFileUploadStatus.InProgress;
  const isLoading = isUploadLoading || isDownloadLoading;
  const isUploadError =
    file.upload && [ChatFileUploadStatus.Cancel, ChatFileUploadStatus.Fail].includes(file.upload.status);
  const isDownError = file.download && file.download.status === ChatFileDownloadStatus.Fail;
  const isError = isUploadError || isDownError;
  const { name, originalFileObjectUrl, upload, download } = file;

  const onImageLoad = useCallback(() => {
    if (
      originalFileObjectUrl &&
      !!id &&
      (upload?.status === ChatFileUploadStatus.Complete || download?.status === ChatFileDownloadStatus.Success)
    ) {
      window.URL.revokeObjectURL(originalFileObjectUrl);
    }
  }, [originalFileObjectUrl, upload, download, id]);
  const onCancelButtonClick = useCallback(() => {
    if (file.upload?.status === ChatFileUploadStatus.InProgress) {
      const {
        upload: { cancelFunc }
      } = file;
      cancelFunc();
    }
  }, [file]);
  const onImageItemClick = useCallback(
    (event: any) => {
      event.preventDefault();
      if (isUploadError && file.upload) {
        const {
          uuid,
          upload: { retryToken }
        } = file;
        if (retryToken && uuid) {
          resendFile(retryToken, uuid);
        }
      } else if (isDownError && file.download && id) {
        downloadFile(id);
      }
    },
    [isUploadError, isDownError, file, resendFile, downloadFile, id]
  );
  useEffect(() => {
    if (id && !file.download && !file.upload) {
      downloadFile(id, true);
    }
  }, [file, id, downloadFile]);
  return (
    <div className="chat-image-message-item" onClick={onImageItemClick}>
      {originalFileObjectUrl ? (
        <img className="chat-image-preview" src={originalFileObjectUrl} alt={name} onLoad={onImageLoad} />
      ) : (
        <FileImageOutlined className="chat-image-empty" />
      )}
      {isLoading && (
        <div className="chat-image-loading">
          <IconFont type="icon-loading" style={{ animation: 'loading 1s linear infinite' }} />
          {isUploadLoading && (
            <Button icon={<CloseOutlined />} type="ghost" title="Click to cancel" onClick={onCancelButtonClick} />
          )}
        </div>
      )}
      {isError && (
        <div className="chat-image-error">
          <IconFont type="icon-warning-circle" />
          <span className="chat-image-tip">{getImageErrorTip(file)}</span>
        </div>
      )}
    </div>
  );
};

export default ChatImageMessageItem;
