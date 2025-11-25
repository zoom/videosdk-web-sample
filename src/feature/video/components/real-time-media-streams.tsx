import { RealTimeMediaStreamsStatus } from '@zoom/videosdk';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';

const BUTTON_TIP_TEXT_MAP = {
  [RealTimeMediaStreamsStatus.NoSubscription]: 'No subscription',
  [RealTimeMediaStreamsStatus.StartFailed]: 'Start failed',
  [RealTimeMediaStreamsStatus.None]: 'None',
  [RealTimeMediaStreamsStatus.Start]: 'Start RTMS',
  [RealTimeMediaStreamsStatus.Pause]: 'Pause',
  [RealTimeMediaStreamsStatus.Stop]: 'Stop'
};

export interface RTMSButtonProps {
  text: string;
  tipText: string;
  icon: string;
  onClick?: () => void;
}

export const rtmsStatusIcon = {
  text: 'Status',
  tipText: 'RTMS Status',
  icon: 'icon-rtms-animated'
};

export const getRealTimeMediaStreamsButtons = (status: RealTimeMediaStreamsStatus, isHost: boolean) => {
  let buttons: RTMSButtonProps[] = [];

  if (
    [
      RealTimeMediaStreamsStatus.None,
      RealTimeMediaStreamsStatus.StartFailed,
      RealTimeMediaStreamsStatus.NoSubscription,
      RealTimeMediaStreamsStatus.Stop
    ].includes(status as RealTimeMediaStreamsStatus)
  ) {
    buttons = [
      {
        text: 'Start',
        tipText: 'Start RTMS',
        icon: 'icon-rtms'
      }
    ];
  } else if (status === RealTimeMediaStreamsStatus.Start) {
    if (!isHost) return [rtmsStatusIcon];
    buttons = [
      rtmsStatusIcon,
      {
        text: 'Pause',
        tipText: 'Pause RTMS',
        icon: 'icon-recording-pause'
      },
      {
        text: 'Stop',
        tipText: 'Stop RTMS',
        icon: 'icon-recording-stop'
      }
    ];
  } else if (status === RealTimeMediaStreamsStatus.Pause) {
    if (!isHost) return [rtmsStatusIcon];
    buttons = [
      rtmsStatusIcon,
      {
        text: 'Resume',
        tipText: 'Resume RTMS',
        icon: 'icon-recording-resume'
      },
      {
        text: 'Stop',
        tipText: 'Stop RTMS',
        icon: 'icon-recording-stop'
      }
    ];
  }
  return buttons;
};

const RealTimeMediaStreamsButton = (props: RTMSButtonProps) => {
  const { tipText, icon, onClick } = props;
  return (
    <Tooltip title={tipText}>
      <Button
        className={classNames('vc-button')}
        icon={<IconFont type={icon} />}
        // eslint-disable-next-line react/jsx-boolean-value
        ghost={true}
        shape="circle"
        size="large"
        onClick={onClick}
      />
    </Tooltip>
  );
};

export { RealTimeMediaStreamsButton };
