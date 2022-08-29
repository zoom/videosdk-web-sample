import React, { useState, useCallback, useContext, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Dropdown, Menu } from 'antd';
import { SubsessionUserStatus, SubsessionStatus } from '@zoom/videosdk';
import ZoomContext from '../../context/zoom-context';
import SubsessionContext from '../../context/subsession-context';
import { useParticipantsChange } from './hooks/useParticipantsChange';
import { IconFont } from '../../component/icon-font';
import Video from '../video/video';
import VideoSingle from '../video/video-single';
import SubsessionCreate from './component/subsession-create';
import SubsessionManage from './component/subsession-manage';
import DraggableModal from './component/draggable-modal';
import { Participant } from '../../index-types';
import { SubsessionStatusDescription } from './subsession-constant';
import { useSubsessionCountdown } from './hooks/useSubsessionCountdown';
import { useInviteJoinSubsession } from './hooks/useInviteJoinRoom';
import { useBroadcastMessage } from './hooks/useBroadcastMessage';
import { useSubsessionTimeUp } from './hooks/useSubsessionTimeup';
import { useSubsession } from './hooks/useSubsession';
import { useSubsessionClosingCountdown } from './hooks/useSubsessionClosingCountdown';
import { usePrevious } from '../../hooks';
import { useAskForHelp } from './hooks/useAskForHelp';
import MediaContext from '../../context/media-context';
import './subsession.scss';
const SubsessionContainer: React.FunctionComponent<RouteComponentProps> = (props) => {
  const zmClient = useContext(ZoomContext);
  const subsessionClient = useContext(SubsessionContext);
  const { mediaStream } = useContext(MediaContext);
  const [visible, setVisible] = useState(false);
  const [closingModalVisible, setClosingModalVisible] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [participantsSize, setParticipantsSize] = useState(0);

  const {
    subsessions,
    subsessionStatus,
    userStatus,
    currentSubsession,
    unassignedUserList,
    subsessionOptions,
    setSubsessionOptions,
    createSubsessions,
    addSubsession,
    openSubsessions,
    assignUserToSubsession,
    moveUserToSubsession
  } = useSubsession(zmClient, subsessionClient);
  const { invitedToJoin, inviteVisible, setInviteVisible, setInviteAccepted } = useInviteJoinSubsession(zmClient);
  const { formattedSubsessionCountdown } = useSubsessionCountdown(zmClient, subsessionClient);
  useBroadcastMessage(zmClient);
  useSubsessionTimeUp(zmClient, subsessionClient, isHost, subsessionOptions.timerDuration);
  useAskForHelp(zmClient, subsessionClient);
  const closingCountdown = useSubsessionClosingCountdown(zmClient, subsessionStatus);
  const previousClosingCountdown = usePrevious(closingCountdown);
  const onParticipantsChange = useCallback(
    (participants: Participant[]) => {
      const isHost = zmClient.isHost();
      if (visible && !isHost) {
        setVisible(false);
      }
      setParticipantsSize(participants.length);
      setIsHost(isHost);
    },
    [visible, zmClient]
  );
  useParticipantsChange(zmClient, onParticipantsChange);

  const onModalClose = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (userStatus !== SubsessionUserStatus.InSubsession) {
      setClosingModalVisible(false);
    }
  }, [userStatus]);
  useEffect(() => {
    if (previousClosingCountdown === -1 && closingCountdown >= 0) {
      setClosingModalVisible(true);
    }
  }, [previousClosingCountdown, closingCountdown]);
  useEffect(() => {
    if (subsessionStatus !== SubsessionStatus.InProgress) {
      setInviteVisible(false);
    }
  }, [subsessionStatus, setInviteVisible]);
  let subsessionModalTitle = `Subsessions -${SubsessionStatusDescription[subsessionStatus]}`;
  let subsessionRemainingTitle;
  if (formattedSubsessionCountdown) {
    subsessionModalTitle = `${subsessionModalTitle} (${formattedSubsessionCountdown})`;
    subsessionRemainingTitle = `Remaining:${formattedSubsessionCountdown}`;
  }
  const onAttendeeBoMenuClick = useCallback(
    ({ key }) => {
      if (key === 'askHelp') {
        subsessionClient?.askForHelp();
      } else if (key === 'leaveRoom') {
        subsessionClient?.leaveSubsession();
      }
    },
    [subsessionClient]
  );
  const attendeeBoMenu = (
    <Menu onClick={onAttendeeBoMenuClick} className="attendee-bo-menu" theme="dark">
      {subsessionStatus === SubsessionStatus.InProgress && <Menu.Item key="askHelp">Ask for Help </Menu.Item>}
      <Menu.Item key="leaveRoom">Leave Subsession</Menu.Item>
    </Menu>
  );
  const isAttendeeReturnToMainSession =
    subsessionStatus === SubsessionStatus.InProgress &&
    currentSubsession.subsessionId &&
    currentSubsession.userStatus === SubsessionUserStatus.Invited;

  return (
    <div className="breakout-room-viewport">
      {mediaStream?.isSupportMultipleVideos() ? <Video {...props} /> : <VideoSingle {...props} />}
      {userStatus === SubsessionUserStatus.InSubsession && (
        <h2 className="room-info">You are in {currentSubsession.subsessionName}.</h2>
      )}
      {(isHost ||
        invitedToJoin || // invite to join
        isAttendeeReturnToMainSession) && ( // return to the main session
        <Button
          className="breakout-room-btn"
          shape="circle"
          icon={<IconFont type="icon-group" />}
          onClick={() => {
            if (isHost) {
              setVisible(true);
            } else if (isAttendeeReturnToMainSession) {
              subsessionClient?.joinSubsession(currentSubsession.subsessionId);
            } else {
              if (invitedToJoin?.accepted) {
                subsessionClient?.joinSubsession(invitedToJoin.subsessionId);
              } else {
                setInviteVisible(true);
              }
            }
          }}
        />
      )}
      {!isHost && userStatus === SubsessionUserStatus.InSubsession && (
        <Dropdown
          className="breakout-room-attendee-dropdown"
          overlay={attendeeBoMenu}
          trigger={['click']}
          placement="topLeft"
        >
          <Button shape="circle" icon={<IconFont type="icon-group" />} />
        </Dropdown>
      )}

      {isHost && (
        <DraggableModal title={subsessionModalTitle} visible={visible} onClose={onModalClose}>
          {subsessions.length === 0 && subsessionStatus === SubsessionStatus.NotStarted ? (
            <SubsessionCreate totalParticipantsSize={participantsSize} onCreateSubsession={createSubsessions} />
          ) : (
            <SubsessionManage
              subsessionStatus={subsessionStatus}
              userStatus={userStatus}
              currentSubsession={currentSubsession}
              subsessions={subsessions}
              subsessionOptions={{ ...subsessionOptions, ...setSubsessionOptions }}
              unassignedUserList={unassignedUserList}
              onAddSubsession={addSubsession}
              onOpenSubsessions={openSubsessions}
              onAssignUserToSubsession={assignUserToSubsession}
              onMoveUserToSubsession={moveUserToSubsession}
            />
          )}
        </DraggableModal>
      )}
      {invitedToJoin && (
        <DraggableModal
          title="Join Subsession"
          visible={inviteVisible}
          onClose={() => {
            setInviteVisible(false);
          }}
          okText="Join"
          cancelText="Not now"
          onOk={() => {
            subsessionClient?.joinSubsession(invitedToJoin.subsessionId);
            setInviteVisible(false);
            setInviteAccepted(true);
          }}
          onCancel={() => {
            setInviteVisible(false);
          }}
          width={400}
        >
          You have been assigned to {invitedToJoin.subsessionName}.
        </DraggableModal>
      )}
      {!isHost && subsessionRemainingTitle && <div className="room-remaining">{subsessionRemainingTitle}</div>}
      {!isHost && closingCountdown >= 0 && (
        <DraggableModal
          title="Subsessions"
          visible={closingModalVisible}
          onClose={() => {
            setClosingModalVisible(false);
          }}
          okText="Return to Main Session"
          onOk={() => {
            subsessionClient?.leaveSubsession();
            setClosingModalVisible(false);
          }}
          cancelText="Cancel"
          onCancel={() => {
            setClosingModalVisible(false);
          }}
        >
          <p style={{ fontWeight: 700 }}> Subsessions will close in {closingCountdown} seconds</p>
          <p>You will be returned to the main session automatically.</p>
        </DraggableModal>
      )}
    </div>
  );
};

export default SubsessionContainer;
