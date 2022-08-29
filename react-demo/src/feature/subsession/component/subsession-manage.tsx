import React, { useState, useCallback, useContext, useEffect } from 'react';
import { Collapse, Button, Popover } from 'antd';
import SubsessionContext from '../../../context/subsession-context';
import { SubsessionUserStatus, SubsessionStatus } from '@zoom/videosdk';
import { Participant } from '../../../index-types';
import { CurrentSubsession, Subsession } from '../subsession-types';
import SubsessionItem from './subsession-item';
import SubsessionOptions from './subsession-options';
import BroadcastPanel from './broadcast-panel';
import ZoomContext from '../../../context/zoom-context';
import './subsession-manage.scss';
import { useSubsessionClosingCountdown } from '../hooks/useSubsessionClosingCountdown';
const { Panel } = Collapse;
interface SubsessionManageProps {
  subsessionStatus: SubsessionStatus;
  userStatus: SubsessionUserStatus;
  currentSubsession: CurrentSubsession;
  unassignedUserList: Participant[];
  subsessions: Subsession[];
  subsessionOptions: any;
  onAddSubsession: () => void;
  onOpenSubsessions: () => void;
  onMoveUserToSubsession: Function;
  onAssignUserToSubsession: Function;
}
const SubsessionManage = (props: SubsessionManageProps) => {
  const {
    subsessionStatus,
    userStatus,
    currentSubsession,
    unassignedUserList,
    subsessions,
    subsessionOptions,
    onAddSubsession,
    onOpenSubsessions,
    onMoveUserToSubsession,
    onAssignUserToSubsession
  } = props;
  const [broadcastVisible, setBroadcastVisible] = useState<boolean>(false);
  const ssClient = useContext(SubsessionContext);
  const zmClient = useContext(ZoomContext);
  const closingCountdown = useSubsessionClosingCountdown(zmClient, subsessionStatus);
  const onBroadcastPopoverVisibleChange = useCallback((visible) => {
    setBroadcastVisible(visible);
  }, []);
  const closeBroadcastPopover = useCallback(() => {
    setBroadcastVisible(false);
  }, []);
  const onCloseSubsessionsClick = useCallback(() => {
    if (ssClient) {
      ssClient.closeAllSubsessions();
    }
  }, [ssClient]);
  const onJoinSubsessionClick = useCallback(
    (subsessionId: string) => {
      if (ssClient) {
        ssClient.joinSubsession(subsessionId);
      }
    },
    [ssClient]
  );
  const onLeaveSubsessionClick = useCallback(() => {
    if (ssClient) {
      ssClient.leaveSubsession();
    }
  }, [ssClient]);

  return (
    <div className="room-manage">
      <div className="room-list-wrap">
        <Collapse className="room-list" ghost>
          {subsessionStatus !== SubsessionStatus.Closing && unassignedUserList.length > 0 && (
            <Panel key="unassigned" header="unassigned" extra={unassignedUserList.length}>
              <SubsessionItem
                users={unassignedUserList}
                subsessionStatus={subsessionStatus}
                onMoveUserToSubsession={onMoveUserToSubsession}
                onAssignUserToSubsession={onAssignUserToSubsession}
              />
            </Panel>
          )}
          {subsessions.map((subsession) => {
            const { subsessionName, userList, subsessionId } = subsession;
            return (
              <Panel
                key={subsessionName}
                header={subsessionName}
                extra={
                  subsessionStatus === SubsessionStatus.InProgress ? (
                    currentSubsession.subsessionId === subsessionId ? (
                      <span>Joined</span>
                    ) : (
                      <Button
                        className="room-join"
                        onClick={(event) => {
                          event.stopPropagation();
                          onJoinSubsessionClick(subsessionId);
                        }}
                      >
                        Join
                      </Button>
                    )
                  ) : (
                    <span className="room-counts">{userList.length}</span>
                  )
                }
              >
                <SubsessionItem
                  users={userList}
                  subsessionId={subsessionId}
                  subsessionStatus={subsessionStatus}
                  onMoveUserToSubsession={onMoveUserToSubsession}
                  onAssignUserToSubsession={onAssignUserToSubsession}
                />
              </Panel>
            );
          })}
        </Collapse>
      </div>
      {subsessionStatus === SubsessionStatus.Closing && closingCountdown >= 0 ? (
        <div className="room-closing-coutdown">
          <p className="room-closing-coutdown-tip">All subsessions will close in {closingCountdown} seconds.</p>
          {userStatus === SubsessionUserStatus.InSubsession && (
            <>
              <p>You will be returned to the main session automatically</p>
              <Button className="room-closing-countdown-leave-btn" onClick={onLeaveSubsessionClick} type="default">
                Leave Subsession
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="room-actions">
          {(subsessionStatus === SubsessionStatus.NotStarted || subsessionStatus === SubsessionStatus.Closed) && (
            <Popover placement="top" trigger="click" content={<SubsessionOptions {...subsessionOptions} />}>
              <Button type="primary" className="room-options-btn" ghost>
                Options
              </Button>
            </Popover>
          )}
          <div className="room-actions-list">
            {subsessionStatus === SubsessionStatus.InProgress ? (
              <>
                <Popover
                  placement="top"
                  trigger="click"
                  content={<BroadcastPanel afterBroadcast={closeBroadcastPopover} />}
                  onVisibleChange={onBroadcastPopoverVisibleChange}
                  visible={broadcastVisible}
                >
                  <Button type="default">Broadcast Message to All</Button>
                </Popover>
                {userStatus === SubsessionUserStatus.InSubsession && (
                  <Button
                    onClick={() => {
                      ssClient?.leaveSubsession();
                    }}
                  >
                    Return to main session
                  </Button>
                )}
                <Button onClick={onCloseSubsessionsClick} danger>
                  Close All Subsessions
                </Button>
              </>
            ) : (
              <>
                <Button>Recreate</Button>
                <Button onClick={onAddSubsession}>Add a Subsession</Button>
                <Button onClick={onOpenSubsessions} type="primary">
                  Open All Subsessions
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SubsessionManage;
