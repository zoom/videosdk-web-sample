import { useContext } from 'react';
import classNames from 'classnames';
import { RollbackOutlined } from '@ant-design/icons';
import { IconFont } from '../../../component/icon-font';
import { Button, Tooltip } from 'antd';
import { useDrag, useDrop } from '../../../hooks';
import './subsession-item.scss';
import { SubsessionStatus } from '@zoom/videosdk';
import ZoomContext from '../../../context/zoom-context';
interface SubsessionProps {
  users: Array<{
    displayName: string;
    avatar?: string;
    userId: number;
    userGuid?: string;
    isInSubsession?: boolean;
    audio?: string;
    muted?: boolean;
    bVideoOn?: boolean;
    sharerOn?: boolean;
    bShareAudioOn?: boolean;
    isTalking?: boolean;
  }>;
  subsessionId?: string;
  subsessionStatus: SubsessionStatus;
  onMoveUserToSubsession: Function;
  onAssignUserToSubsession: Function;
  onMoveBackToMainSession: Function;
}

const getDisplayAvatarColorTag = (displayName: string) => {
  const totalCharCodeValue = displayName.split('').reduce((prev, cur) => {
    return prev + cur.charCodeAt(0);
  }, 0);
  return (totalCharCodeValue % 8) + 1;
};

const SubsessionItem = (props: SubsessionProps) => {
  const {
    users,
    subsessionId,
    subsessionStatus,
    onMoveUserToSubsession,
    onAssignUserToSubsession,
    onMoveBackToMainSession
  } = props;
  const zmClient = useContext(ZoomContext);
  const getProps = useDrag({});
  const [dropProps, { isHover }] = useDrop({
    onDom: (content: { userId: number; subsessionId?: string; displayName: string; avatar?: string }) => {
      if (subsessionId) {
        if (content.subsessionId && content.subsessionId !== subsessionId) {
          onMoveUserToSubsession(
            content.userId,
            subsessionId,
            content.subsessionId,
            content.displayName,
            content.avatar
          );
        } else if (!content.subsessionId) {
          onAssignUserToSubsession(content.userId, subsessionId, content.displayName, content.avatar);
        }
      }
    }
  });
  return (
    <ul className={classNames('room-item', { 'drop-over': isHover })} {...dropProps}>
      {users.map((item) => {
        const dragProps =
          subsessionStatus === SubsessionStatus.Closing
            ? {}
            : getProps({
                userId: item.userId,
                subsessionId,
                displayName: item.displayName,
                avatar: item.avatar
              });
        return (
          <li className="room-item-user" {...dragProps} key={item.userId}>
            <div className="room-item-user-title">
              {(subsessionStatus === SubsessionStatus.InProgress || subsessionStatus === SubsessionStatus.Closing) &&
                subsessionId && (
                  <i
                    className={classNames('room-item-user-status', {
                      'in-room': item.isInSubsession
                    })}
                  />
                )}
              {item.avatar ? (
                <img className="room-item-user-avatar" src={item.avatar} alt="" />
              ) : (
                <span
                  className={classNames(
                    'room-item-user-color-avatar',
                    `avatar${getDisplayAvatarColorTag(item.displayName)}`
                  )}
                >
                  {item.displayName.charAt(0)}
                </span>
              )}
              <span className="room-item-user-name">{item.displayName}</span>
            </div>
            {item.isInSubsession && (
              <div className="room-item-user-media-status">
                {item.audio === 'computer' ? (
                  item.muted ? (
                    <IconFont type="icon-participant-audio-muted" />
                  ) : item.isTalking ? (
                    <IconFont type="icon-participant-audio-unmuted-animated" />
                  ) : (
                    <IconFont type="icon-participant-audio-unmuted" />
                  )
                ) : (
                  ''
                )}
                {item.bVideoOn ? (
                  <IconFont type="icon-participant-video-on" />
                ) : (
                  <IconFont type="icon-participant-video-off" />
                )}
                {item.sharerOn && <IconFont type="icon-participant-sharing-screen" />}
                {item.bShareAudioOn && <IconFont type="icon-participant-sharing-desktop-audio" />}
                {item.userGuid !== zmClient.getCurrentUserInfo().userGuid &&
                  (zmClient.isHost() || zmClient.isManager()) && (
                    <Tooltip title="Move back to main session">
                      <Button
                        className="room-item-user-back-btn"
                        icon={<RollbackOutlined />}
                        // ghost={true}
                        size="small"
                        onClick={() => onMoveBackToMainSession(item.userId)}
                      />
                    </Tooltip>
                  )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default SubsessionItem;
