import React from 'react';
import classNames from 'classnames';
import { useDrag, useDrop } from '../../../hooks';
import './subsession-item.scss';
import { SubsessionStatus } from '@zoom/videosdk';
interface SubsessionProps {
  users: Array<{
    displayName: string;
    avatar?: string;
    userId: number;
    isInSubsession?: boolean;
  }>;
  subsessionId?: string;
  subsessionStatus: SubsessionStatus;
  onMoveUserToSubsession: Function;
  onAssignUserToSubsession: Function;
}

const getDisplayAvatarColorTag = (displayName: string) => {
  const totalCharCodeValue = displayName.split('').reduce((prev, cur) => {
    return prev + cur.charCodeAt(0);
  }, 0);
  return (totalCharCodeValue % 8) + 1;
};

const SubsessionItem = (props: SubsessionProps) => {
  const { users, subsessionId, subsessionStatus, onMoveUserToSubsession, onAssignUserToSubsession } = props;
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
          </li>
        );
      })}
    </ul>
  );
};

export default SubsessionItem;
