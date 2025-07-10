import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, List, Typography } from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ZoomVideo, { BroadcastStreamingStatus } from '@zoom/videosdk';
import ZoomContext from '../../../context/zoom-context';
import './report-btn.scss';
const trackingId = Object.fromEntries(new URLSearchParams(location.search))?.customerJoinId;
const { Item: ListItem } = List;
const ReportBtn = () => {
  const [messageApi, msgContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const zmClient = useContext(ZoomContext);
  const [channelId, setChannelId] = useState<string>(
    zmClient.getBroadcastStreamingClient().getBroadcastStreamingStatus()?.channelId
  );
  const onChannelIdChange = useCallback(
    ({ status }: any) => {
      if (status === BroadcastStreamingStatus.InProgress) {
        const state = zmClient.getBroadcastStreamingClient().getBroadcastStreamingStatus();
        setChannelId(state.channelId);
      } else {
        setChannelId('');
      }
    },
    [zmClient]
  );
  useEffect(() => {
    zmClient.on('broadcast-streaming-status', onChannelIdChange);
    return () => {
      zmClient.off('broadcast-streaming-status', onChannelIdChange);
    };
  }, [zmClient, onChannelIdChange]);

  const infoList = useMemo(() => {
    const data = [
      {
        label: 'Video SDK version',
        value: ZoomVideo.VERSION
      },
      {
        label: 'JsMedia version',
        value: (window as any).JsMediaSDK_Instance?.version
      },
      {
        label: 'SharedArrayBuffer',
        value: `${window.crossOriginIsolated}`
      },
      {
        label: 'Session id(mid)',
        value: zmClient.getSessionInfo().sessionId
      },
      {
        label: 'Telemetry tracking id',
        value: trackingId ? window.atob(trackingId) : ''
      },
      {
        label: 'Broadcast streaming channel id',
        value: channelId
      }
    ];
    return (
      <List
        bordered
        dataSource={data}
        renderItem={(item) => (
          <ListItem>
            <Typography.Title level={5}>{item.label}:</Typography.Title>
            <Typography.Text style={{ textAlign: 'right' }}>{item.value}</Typography.Text>
          </ListItem>
        )}
      />
    );
  }, [zmClient, channelId]);
  const onInfoClick = async function () {
    modal.info({
      title: 'Session info',
      content: infoList,
      okText: 'Report log',
      onOk: async () => {
        // if (trackingId) {
        await zmClient.getLoggerClient().reportToGlobalTracing();
        messageApi.open({
          type: 'success',
          content: 'Successfully reported the log.'
        });
        // }
      },
      closable: true,
      icon: null,
      width: 520
    });
  };
  return (
    <>
      {msgContextHolder}
      {modalContextHolder}
      <div>
        <Button type="link" className="info-button" icon={<InfoCircleOutlined />} size="large" onClick={onInfoClick} />
      </div>
    </>
  );
};

export default ReportBtn;
