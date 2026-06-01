import { Modal, Input, Button, Steps, Typography, Space, Alert, Divider, Tooltip, Spin, List } from 'antd';
import {
  CopyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useCallback, useContext, useMemo, useEffect, useState } from 'react';
import classNames from 'classnames';
import ZoomContext from '../../../context/zoom-context';
import MeetingArgsContext from '../../../context/meeting-args-context';
import './rtmp-ingestion-modal.scss';

const { Text, Paragraph } = Typography;

const BACKEND_BASE_URL = '[BACKEND SERVICE URL]';

async function createRtmpStream(sdkSignature: string, sessionId: string, streamName: string) {
  const body = new URLSearchParams({ token: sdkSignature, session_id: sessionId, stream_name: streamName });
  const response = await fetch(`${BACKEND_BASE_URL}/[CREATE RTMP STREAM PATH]`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  const data = await response.json();
  if (data.code === 34016) {
    const err: any = new Error(data.message || 'Stream limit reached');
    err.code = 34016;
    throw err;
  }
  if (!response.ok) {
    throw new Error(data.message || `Request failed (HTTP ${response.status})`);
  }
  if (!data.stream_id) {
    throw new Error(data.message || 'Invalid response from server');
  }
  return data as { stream_id: string; stream_url: string; stream_key: string };
}

interface ExistingStream {
  stream_id: string;
  stream_name: string;
}

async function listRtmpStreams(sdkSignature: string): Promise<ExistingStream[]> {
  const url = `${BACKEND_BASE_URL}/[LIST RTMP STREAM PATH]`;
  const response = await fetch(url, {
    mode: 'cors',
    headers: { Authorization: `Bearer ${sdkSignature}` }
  });
  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status})`);
  }
  const data = await response.json();
  return (data.stream_ingestions ?? data.streams ?? data ?? []) as ExistingStream[];
}

async function deleteRtmpStream(sdkSignature: string, streamId: string) {
  const body = new URLSearchParams({ token: sdkSignature, stream_id: streamId });
  const response = await fetch(`${BACKEND_BASE_URL}/[DELETE RTMP STREAM PATH]`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status})`);
  }
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------
interface StreamIngestionInfo {
  stream_id: string;
  stream_url: string;
  stream_key: string;
}

interface IncomingStreamStatus {
  isRTMPConnected: boolean;
  isStreamPushed: boolean;
  streamId?: string;
}

export interface RtmpIngestionModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const StatusRow = ({ connected, label }: { connected: boolean; label: string }) => (
  <div className={classNames('status-row', { connected })}>
    {connected ? <CheckCircleOutlined className="status-icon" /> : <CloseCircleOutlined className="status-icon" />}
    <span className="status-label">{label}</span>
  </div>
);

const CopyableField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="copyable-field">
      <Text type="secondary" className="field-label">
        {label}
      </Text>
      <Input
        readOnly
        value={value}
        suffix={
          <Tooltip title={copied ? 'Copied!' : 'Copy'}>
            <CopyOutlined className={classNames('copy-icon', { copied })} onClick={handleCopy} />
          </Tooltip>
        }
      />
    </div>
  );
};

const stepItems = [{ title: 'Create' }, { title: 'Configure & Bind' }, { title: 'Control' }];

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
const RtmpIngestionModal = (props: RtmpIngestionModalProps) => {
  const { visible, setVisible } = props;
  const zmClient = useContext(ZoomContext);
  const { signature: sdkSignature } = useContext(MeetingArgsContext);
  const incomingLiveStreamClient = useMemo(() => (zmClient as any).getIncomingLiveStreamClient(), [zmClient]);

  const [currentStep, setCurrentStep] = useState(0);
  const [streamName, setStreamName] = useState('My Incoming Stream');
  const [streamInfo, setStreamInfo] = useState<StreamIngestionInfo | null>(null);
  const [streamStatus, setStreamStatus] = useState<IncomingStreamStatus>({
    isRTMPConnected: false,
    isStreamPushed: false
  });
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isBinding, setIsBinding] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showStreamManager, setShowStreamManager] = useState(false);
  const [existingStreams, setExistingStreams] = useState<ExistingStream[]>([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState(false);
  const [deletingStreamId, setDeletingStreamId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const sessionId = (zmClient.getSessionInfo() as any)?.sessionId || '';

  const refreshStatus = useCallback(() => {
    try {
      const status = incomingLiveStreamClient?.getIncomingLiveStreamStatus?.();
      if (status) {
        setStreamStatus({
          isRTMPConnected: status.isRTMPConnected ?? false,
          isStreamPushed: status.isStreamPushed ?? false,
          streamId: status.streamId
        });
      }
    } catch {
      // status not available yet
    }
  }, [incomingLiveStreamClient]);

  const onIncomingLiveStreamStatus = useCallback((payload: any) => {
    setStreamStatus({
      isRTMPConnected: payload.isRTMPConnected ?? false,
      isStreamPushed: payload.isStreamPushed ?? false,
      streamId: payload.streamId
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    zmClient.on('incoming-live-stream-status', onIncomingLiveStreamStatus);
    return () => {
      zmClient.off('incoming-live-stream-status', onIncomingLiveStreamStatus);
    };
  }, [zmClient, visible, onIncomingLiveStreamStatus]);

  const loadStreams = useCallback(async () => {
    setError('');
    setIsLoadingStreams(true);
    try {
      const streams = await listRtmpStreams(sdkSignature);
      setExistingStreams(streams);
    } catch (e: any) {
      setError(e.message || 'Failed to load streams');
    } finally {
      setIsLoadingStreams(false);
    }
  }, [sdkSignature]);

  const handleDeleteStream = useCallback(
    async (streamId: string) => {
      setDeletingStreamId(streamId);
      try {
        await deleteRtmpStream(sdkSignature, streamId);
        setExistingStreams((prev) => prev.filter((s) => s.stream_id !== streamId));
      } catch (e: any) {
        setError(e.message || 'Failed to delete stream');
      } finally {
        setDeletingStreamId(null);
      }
    },
    [sdkSignature]
  );

  const handleDeleteAll = useCallback(async () => {
    setIsDeletingAll(true);
    setError('');
    const ids = existingStreams.map((s) => s.stream_id);
    const results = await Promise.allSettled(ids.map((id) => deleteRtmpStream(sdkSignature, id)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
      setError(`${failed} stream(s) failed to delete`);
    }
    const deletedIds = new Set(ids.filter((_, i) => results[i].status === 'fulfilled'));
    setExistingStreams((prev) => prev.filter((s) => !deletedIds.has(s.stream_id)));
    setIsDeletingAll(false);
  }, [sdkSignature, existingStreams]);

  const handleCreate = async () => {
    setError('');
    setIsCreating(true);
    try {
      const info = await createRtmpStream(sdkSignature, sessionId, streamName || 'My Incoming Stream');
      setStreamInfo(info);
      setShowStreamManager(false);
      setCurrentStep(1);
    } catch (e: any) {
      if (e.code === 34016) {
        setShowStreamManager(true);
        loadStreams();
      } else {
        setError(e.message || 'Failed to create stream ingestion');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const bindStream = async () => {
    if (!streamInfo) return;
    setError('');
    setIsBinding(true);
    try {
      await incomingLiveStreamClient.bindIncomingLiveStream(streamInfo.stream_id);
      setCurrentStep(2);
      refreshStatus();
    } catch (e: any) {
      setError(e.reason || 'Failed to bind stream');
    } finally {
      setIsBinding(false);
    }
  };

  const unbindStream = async () => {
    if (!streamInfo) return;
    setError('');
    setIsBinding(true);
    try {
      await incomingLiveStreamClient.unbindIncomingLiveStream(streamInfo.stream_id);
      setStreamStatus({ isRTMPConnected: false, isStreamPushed: false });
      setCurrentStep(1);
    } catch (e: any) {
      setError(e.reason || 'Failed to unbind stream');
    } finally {
      setIsBinding(false);
    }
  };

  const startStream = async () => {
    if (!streamInfo) return;
    setError('');
    setIsStreaming(true);
    try {
      await incomingLiveStreamClient.startIncomingLiveStream(streamInfo.stream_id);
    } catch (e: any) {
      setError(e.reason || 'Failed to start stream');
    } finally {
      setIsStreaming(false);
    }
  };

  const stopStream = async () => {
    if (!streamInfo) return;
    setError('');
    setIsStreaming(true);
    try {
      await incomingLiveStreamClient.stopIncomingLiveStream(streamInfo.stream_id);
    } catch (e: any) {
      setError(e.reason || 'Failed to stop stream');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="RTMP Ingestion"
      onCancel={() => setVisible(false)}
      footer={null}
      width={520}
      className="rtmp-ingestion-modal"
    >
      <Steps current={currentStep} size="small" items={stepItems} className="rtmp-steps" />

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          className="rtmp-error-alert"
        />
      )}

      {/* Step 0: Create Stream Ingestion */}
      {currentStep === 0 && !showStreamManager && (
        <div>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Create a stream ingestion via the backend. You&apos;ll receive the RTMP credentials needed to configure your
            streaming software (OBS, vMix, etc.).
          </Paragraph>
          <div className="field-row">
            <Text type="secondary" className="field-label">
              Session ID (auto-filled)
            </Text>
            <Input readOnly value={sessionId} className="session-id-input" />
          </div>
          <div className="field-row field-row-last">
            <Text type="secondary" className="field-label">
              Stream Name
            </Text>
            <Input
              placeholder="My Incoming Stream"
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
            />
          </div>
          <Button type="primary" block loading={isCreating} disabled={!sessionId} onClick={handleCreate}>
            Create Stream Ingestion
          </Button>
        </div>
      )}

      {/* Step 0: Stream Manager (shown when limit is reached) */}
      {currentStep === 0 && showStreamManager && (
        <div>
          <Alert
            message="Stream limit reached (20/20)"
            description="Delete unused streams below to free up capacity, then retry."
            type="warning"
            showIcon
            className="rtmp-error-alert"
          />
          <div className="stream-manager-header">
            <Text type="secondary" className="stream-manager-title">
              Existing Streams ({existingStreams.length})
            </Text>
            <Space size={8}>
              <Tooltip title="Reload list">
                <SyncOutlined className="refresh-icon" onClick={loadStreams} spin={isLoadingStreams} />
              </Tooltip>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={isDeletingAll}
                disabled={existingStreams.length === 0 || !!deletingStreamId}
                onClick={handleDeleteAll}
              >
                Delete All
              </Button>
            </Space>
          </div>
          <Spin spinning={isLoadingStreams}>
            <List
              className="stream-manager-list"
              dataSource={existingStreams}
              locale={{ emptyText: 'No streams found' }}
              renderItem={(stream) => (
                <List.Item
                  className="stream-manager-item"
                  actions={[
                    <Button
                      key="delete"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={deletingStreamId === stream.stream_id}
                      disabled={isDeletingAll}
                      onClick={() => handleDeleteStream(stream.stream_id)}
                    >
                      Delete
                    </Button>
                  ]}
                >
                  <div className="stream-manager-item-info">
                    <Text strong className="stream-manager-name">
                      {stream.stream_name || '(unnamed)'}
                    </Text>
                    <Text type="secondary" className="stream-manager-id">
                      {stream.stream_id}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Spin>
          <Divider className="stream-divider" />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={() => setShowStreamManager(false)}>Back</Button>
            <Button type="primary" loading={isCreating} disabled={!sessionId} onClick={handleCreate}>
              Retry Create
            </Button>
          </Space>
        </div>
      )}

      {/* Step 1: Configure & Bind */}
      {currentStep === 1 && streamInfo && (
        <div>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Configure your streaming software with the credentials below, then bind the stream to this session.
          </Paragraph>
          <CopyableField label="RTMP Server URL" value={streamInfo.stream_url} />
          <CopyableField label="Stream Key" value={streamInfo.stream_key} />
          <CopyableField label="Stream ID" value={streamInfo.stream_id} />
          <Divider className="stream-divider" />
          <Paragraph style={{ marginBottom: 16 }}>
            <Text strong>OBS Setup:</Text> Open OBS → Settings → Stream → set <Text code>Service: Custom</Text>, paste
            the URL and Key above, then click <Text code>Apply</Text>. Don&apos;t start streaming yet — bind first.
          </Paragraph>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(0)}>Back</Button>
            <Button type="primary" loading={isBinding} onClick={bindStream}>
              Bind Stream
            </Button>
          </Space>
        </div>
      )}

      {/* Step 2: Control Stream */}
      {currentStep === 2 && streamInfo && (
        <div>
          <div className="stream-status">
            <div className="stream-status-header">
              <Text type="secondary" className="status-title">
                Incoming Stream Status
              </Text>
              <Tooltip title="Refresh status">
                <SyncOutlined className="refresh-icon" onClick={refreshStatus} />
              </Tooltip>
            </div>
            <div className="status-rows">
              <StatusRow connected={streamStatus.isRTMPConnected} label="RTMP Connected" />
              <StatusRow connected={streamStatus.isStreamPushed} label="Stream Active" />
            </div>
            {!streamStatus.isRTMPConnected && (
              <Text type="secondary" className="status-hint">
                Waiting for your streaming software to connect…
              </Text>
            )}
            {streamStatus.isRTMPConnected && !streamStatus.isStreamPushed && (
              <Text className="status-hint connecting">
                Streaming software connected — click <strong>Start Stream</strong> to add it as a virtual participant.
              </Text>
            )}
            {streamStatus.isStreamPushed && (
              <Text className="status-hint live">Stream is live as a virtual participant in the session.</Text>
            )}
          </div>

          <CopyableField label="Stream ID" value={streamInfo.stream_id} />

          <Divider className="stream-divider" />

          <div className="control-buttons">
            <div className="start-stop-row">
              <Button
                type="primary"
                className="start-btn"
                disabled={!streamStatus.isRTMPConnected || streamStatus.isStreamPushed}
                loading={isStreaming}
                onClick={startStream}
              >
                Start Stream
              </Button>
              <Button
                danger
                className="stop-btn"
                disabled={!streamStatus.isStreamPushed}
                loading={isStreaming}
                onClick={stopStream}
              >
                Stop Stream
              </Button>
            </div>
            <Button
              block
              disabled={streamStatus.isStreamPushed || isStreaming}
              loading={isBinding}
              onClick={unbindStream}
            >
              Unbind Stream
            </Button>
          </div>

          <Text type="secondary" className="footer-hint">
            Stop the stream before unbinding. Unbind releases server-side resources.
          </Text>
        </div>
      )}
    </Modal>
  );
};

export default RtmpIngestionModal;
