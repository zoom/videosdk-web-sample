import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useState, useContext } from 'react';
import ZoomContext from '../../../context/zoom-context';
import './report-btn.scss';
const ReportBtn = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const zmClient = useContext(ZoomContext);
  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Successfully reported the log.'
    });
  };
  const onReportClick = async function () {
    try {
      await zmClient.getLoggerClient().reportToGlobalTracing();
      success();
    } catch (e) {
      console.log(e);
    }
  };
  // @ts-ignore
  const { version } = JsMediaSDK_Instance;
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const mouseEnterHandler = () => {
    setIsTitleVisible(true);
  };
  const mouseLeaveHandler = () => {
    setIsTitleVisible(false);
  };
  return (
    <>
      {contextHolder}
      <div>
        <div id="jsmediaversion">{'jsmedia:' + version}</div>
        {isTitleVisible && <div id="report-title">Click to report log</div>}
        <Button
          type="link"
          className="report-button"
          onMouseEnter={mouseEnterHandler}
          onMouseLeave={mouseLeaveHandler}
          icon={<InfoCircleOutlined />}
          size="large"
          onClick={onReportClick}
        />
      </div>
    </>
  );
};

export default ReportBtn;
