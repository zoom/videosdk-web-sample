import { useRef, useState, useContext, useCallback, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { Dropdown, Button } from 'antd';
import { CheckOutlined, MoreOutlined } from '@ant-design/icons';
import ShareBar from './share-bar';
import ZoomContext from '../../../../context/zoom-context';
import ZoomMediaContext from '../../../../context/media-context';
import { type VideoPlayer, ShareViewQuality } from '@zoom/videosdk';
import { useMultiShare } from '../../hooks/useMultiShare';
import { usePrevious } from '../../../../hooks';
import { getAntdItem, getAntdDropdownMenu } from '../video-footer-utils';
import './share-view.scss';
import type { ShareViewProps } from './share-view-types';

const shareViewQualityOptions = [
  { label: 'Original', value: ShareViewQuality.Original },
  { label: 'High', value: ShareViewQuality.High },
  { label: 'Medium', value: ShareViewQuality.Medium },
  { label: 'Low', value: ShareViewQuality.Low }
];

const MultiShareView = forwardRef((props: ShareViewProps, ref: any) => {
  const { onShareViewActiveChange } = props;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const selfShareViewRef = useRef<(HTMLCanvasElement & HTMLVideoElement) | null>(null);
  const videoPlayerListRef = useRef<Record<string, VideoPlayer>>({});
  const { isRecieveSharing, shareStatus, shareUserList } = useMultiShare(zmClient, mediaStream);
  const [shareViewQualityMap, setShareViewQualityMap] = useState<Record<string, ShareViewQuality>>({});
  const shareUserIdList = useMemo(() => shareUserList.map((user) => user.userId), [shareUserList]);
  const previousShareUserIdList = usePrevious(shareUserIdList);
  useEffect(() => {
    const handleShareUserChanges = async () => {
      if (!_.isEqual(shareUserIdList, previousShareUserIdList)) {
        const addedUsers = shareUserIdList.filter((user) => !(previousShareUserIdList ?? []).includes(user));
        const removedUsers = (previousShareUserIdList ?? []).filter((user) => !shareUserIdList.includes(user));
        if (removedUsers.length > 0) {
          await Promise.all(
            removedUsers.map(async (userId) => {
              await mediaStream?.detachShareView(userId);
            })
          );
        }
        if (addedUsers.length > 0) {
          for (const userId of addedUsers) {
            const attachment = videoPlayerListRef.current[`${userId}`];
            if (attachment) {
              await mediaStream?.attachShareView(userId, attachment);
            }
          }
        }
      }
    };
    handleShareUserChanges();
  }, [mediaStream, shareUserIdList, previousShareUserIdList]);
  const setVideoPlayerRef = useCallback((userId: number, element: VideoPlayer | null) => {
    if (element) {
      videoPlayerListRef.current[`${userId}`] = element;
    }
  }, []);
  const onShareViewQualityChange = useCallback(
    async (userId: number, quality: ShareViewQuality) => {
      await mediaStream?.updateShareViewQuality(userId, quality);
      setShareViewQualityMap((prev) => ({ ...prev, [`${userId}`]: quality }));
    },
    [mediaStream]
  );
  useImperativeHandle(ref, () => {
    return {
      selfShareRef: selfShareViewRef.current
    };
  }, []);
  const [columns, rows] = useMemo(() => {
    const count = shareUserList.length;
    let [c, r] = [0, 0];
    if (count === 1) {
      c = 1;
      r = 1;
    } else if (count === 2) {
      c = 2;
      r = 1;
    } else if (count <= 4) {
      c = 2;
      r = 2;
    } else if (count <= 9) {
      c = 3;
      r = 3;
    }
    return [c, r];
  }, [shareUserList]);
  useEffect(() => {
    onShareViewActiveChange(isRecieveSharing);
  }, [isRecieveSharing, onShareViewActiveChange]);
  return (
    <>
      <ShareBar ref={selfShareViewRef} shareStatus={shareStatus} />
      <div
        className={classnames('share-view', {
          'share-view-in-sharing': isRecieveSharing
        })}
      >
        <video-player-container class="share-view-container">
          <ul
            className="share-view-list"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(128px, 1fr))`,
              gridTemplateRows: `repeat(${rows}, auto)`
            }}
          >
            {shareUserList.map((user) => {
              const currentQuality = shareViewQualityMap[`${user.userId}`] ?? ShareViewQuality.Original;
              const qualityMenu = shareViewQualityOptions.map((option) =>
                getAntdItem(option.label, `${option.value}`, currentQuality === option.value && <CheckOutlined />)
              );
              return (
                <div key={user.userId} className="share-view-cell">
                  <video-player
                    class="video-player"
                    ref={(element) => {
                      setVideoPlayerRef(user.userId, element);
                    }}
                  />
                  <Dropdown
                    menu={getAntdDropdownMenu(qualityMenu, ({ key }) =>
                      onShareViewQualityChange(user.userId, Number(key) as ShareViewQuality)
                    )}
                    placement="bottomRight"
                    trigger={['click']}
                  >
                    <Button icon={<MoreOutlined />} className="share-view-quality-button" type="primary" size="small" />
                  </Dropdown>
                  <span className="share-view-name-tag">{`${user.displayName}'s screen`}</span>
                </div>
              );
            })}
          </ul>
        </video-player-container>
      </div>
    </>
  );
});
export default MultiShareView;
