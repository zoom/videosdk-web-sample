import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, List, Typography } from 'antd';
import { useState, useContext, useMemo } from 'react';
import ZoomContext from '../../../context/zoom-context';
import './report-btn.scss';
const trackingId = Object.fromEntries(new URLSearchParams(location.search))?.telemetry_tracking_id;
const { Item: ListItem } = List;
const ReportBtn = () => {
  const [messageApi, msgContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const zmClient = useContext(ZoomContext);

  const infoList = useMemo(() => {
    const data = [
      {
        label: 'JsMedia version',
        value: (window as any).JsMediaSDK_Instance?.version
      },
      {
        label: 'Session id(mid)',
        value: zmClient.getSessionInfo().sessionId
      },
      {
        label: 'Telemetry tracking id',
        value: trackingId ? trackingId : ''
      }
    ];
    return (
      <List
        bordered
        dataSource={data}
        renderItem={(item) => (
          <ListItem>
            <Typography.Title level={5}>{item.label}:</Typography.Title>
            <Typography.Text>{item.value}</Typography.Text>
          </ListItem>
        )}
      />
    );
  }, [zmClient]);
  const onInfoClick = async function () {
    modal.info({
      title: 'Session info',
      content: infoList,
      okText: trackingId ? 'Report log' : 'Ok',
      onOk: async () => {
        if (trackingId) {
          await zmClient.getLoggerClient().reportToGlobalTracing();
          messageApi.open({
            type: 'success',
            content: 'Successfully reported the log.'
          });
        }
      },
      closable: true,
      icon: null,
      width: 520
    });
  };
  // @ts-ignore
  let meetingArgs: any = Object.fromEntries(new URLSearchParams(location.search));
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
