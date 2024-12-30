import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Modal, Table, Tabs } from 'antd';
import type { AudioQosData, VideoQosData } from '@zoom/videosdk';
import ZoomContext from '../../../context/zoom-context';
import MediaContext from '../../../context/media-context';
import { useMount } from '../../../hooks';
interface AudioVideoStatisticModalProps {
  visible: boolean;
  defaultTab?: string;
  isStartedAudio: boolean;
  isMuted: boolean;
  isStartedVideo: boolean;
  setVisible: (visible: boolean) => void;
}
interface ExtendedAudioQosData extends AudioQosData {
  timestamp: number;
}
interface ExtendedVideoQosData extends VideoQosData {
  timestamp: number;
}

const { TabPane } = Tabs;
const mult = '\u00D7';
const AudioMetrics = [
  {
    title: 'Frequency',
    value: 'sample_rate',
    format: (value: number) => `${value} khz`
  },
  {
    title: 'Bitrate',
    value: ['bitrate'],
    format: (value: number) => `${(value / 1024).toFixed(1)} kb/s`
  },
  {
    title: 'Latency',
    value: 'rtt',
    format: (value: number) => `${value} ms`
  },
  {
    title: 'Jitter',
    value: 'jitter',
    format: (value: number) => `${value} ms`
  },
  {
    title: 'Packet Loss - Avg(Max)',
    value: ['avg_loss', 'max_loss'],
    format: (value: number[]) => {
      const nv = value.map((s) => {
        return `${((Number(s) / 1000) * 100).toFixed(1)}%`;
      });
      const [avg, max] = nv;
      return `${avg} (${max})`;
    }
  }
];
const VideoMetrics = [
  {
    title: 'Latency',
    value: 'rtt',
    format: (value: number) => `${value} ms`
  },
  {
    title: 'Jitter',
    value: 'jitter',
    format: (value: number) => `${value} ms`
  },
  {
    title: 'Bandwidth',
    value: ['bandwidth'],
    format: (value: number) => `${(value / 1024).toFixed(1)} kb/s`
  },
  {
    title: 'Packet Loss - Avg(Max)',
    value: ['avg_loss', 'max_loss'],
    format: (value: number[]) => {
      const nv = value.map((s) => {
        return `${((Number(s) / 1000) * 100).toFixed(1)}%`;
      });
      const [avg, max] = nv;
      return `${avg} (${max})`;
    }
  },
  {
    title: 'Resolution',
    value: ['width', 'height'],
    format: (value: number[]) => {
      const [w, h] = value;
      if (w === 0 && h === 0) {
        return '-';
      }
      return `${w}${mult}${h}`;
    }
  },
  {
    title: 'Frame Per Second	',
    value: 'fps',
    format: (value: number) => `${value} fps`
  }
];
const AudioQosDataShape = {
  avg_loss: 0,
  jitter: 0,
  max_loss: 0,
  rtt: 0,
  sample_rate: 0,
  timestamp: 0,
  bandwidth: 0,
  bitrate: 0
};

const VideoQosDataShape = {
  avg_loss: 0,
  fps: 0,
  height: 0,
  jitter: 0,
  max_loss: 0,
  rtt: 0,
  width: 0,
  sample_rate: 0,
  timestamp: 0,
  bandwidth: 0,
  bitrate: 0
};
const getDataSouce = (
  streamMertics: typeof AudioMetrics | typeof VideoMetrics,
  encodingData: ExtendedAudioQosData | ExtendedVideoQosData | undefined,
  decodingData: ExtendedAudioQosData | ExtendedVideoQosData | undefined
) => {
  return streamMertics.map((metrics, index) => {
    let send = '';
    let receive = '';
    if (encodingData) {
      let value;
      if (Array.isArray(metrics.value)) {
        value = metrics.value.map((m: string) => (encodingData as { [key: string]: any })[m]);
      } else {
        value = (encodingData as { [key: string]: any })[metrics.value];
      }
      send = value === 0 ? '-' : metrics.format(value);
    }
    if (decodingData) {
      let value;
      if (Array.isArray(metrics.value)) {
        value = metrics.value.map((m: string) => (decodingData as { [key: string]: any })[m]);
      } else {
        value = (decodingData as { [key: string]: any })[metrics.value];
      }
      receive = value === 0 ? '-' : metrics.format(value);
    }
    return {
      name: metrics.title,
      send,
      receive,
      key: index
    };
  });
};
const columns = [
  {
    title: 'Item Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Send',
    dataIndex: 'send',
    key: 'send'
  },
  {
    title: 'Receive',
    dataIndex: 'receive',
    key: 'receive'
  }
];
const AudioVideoStatisticModal = (props: AudioVideoStatisticModalProps) => {
  const { visible, defaultTab, isStartedAudio, isStartedVideo, isMuted, setVisible } = props;
  const zmclient = useContext(ZoomContext);
  const { mediaStream } = useContext(MediaContext);
  const [tab, setTab] = useState(defaultTab || 'audio');
  const [audioEncodingStatistic, setAudioEncodingStatistic] = useState<ExtendedAudioQosData>();
  const [audioDecodingStatistic, setAudioDecodingStatistic] = useState<ExtendedAudioQosData>();
  const [videoEncodingStatistic, setVideoEncodingStatistic] = useState<ExtendedVideoQosData>();
  const [videoDecodingStatistic, setVideoDecodingStatistic] = useState<ExtendedVideoQosData>();
  const [shareEncodingStatistic, setShareEncodingStatistic] = useState<ExtendedVideoQosData>();
  const [shareDecodingStatistic, setShareDecodingStatistic] = useState<ExtendedVideoQosData>();
  const timerRef = useRef(0);
  const onTabChange = (key: string) => {
    setTab(key);
  };

  const onAudioStatisticChange = useCallback((payload: any) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setAudioEncodingStatistic({ ...restProps, timestamp: Date.now() });
    } else {
      setAudioDecodingStatistic({ ...restProps, timestamp: Date.now() });
    }
  }, []);
  const onVideoStatisticChange = useCallback((payload: any) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setVideoEncodingStatistic({ ...restProps, timestamp: Date.now() });
    } else {
      setVideoDecodingStatistic({ ...restProps, timestamp: Date.now() });
    }
  }, []);
  const onShareStatisticChange = useCallback((payload: any) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setShareEncodingStatistic({ ...restProps, timestamp: Date.now() });
    } else {
      setShareDecodingStatistic({ ...restProps, timestamp: Date.now() });
    }
  }, []);
  const audioDataSource = getDataSouce(AudioMetrics, audioEncodingStatistic, audioDecodingStatistic);
  const videoDataSource = getDataSouce(VideoMetrics, videoEncodingStatistic, videoDecodingStatistic);
  const shareDataSource = getDataSouce(VideoMetrics, shareEncodingStatistic, shareDecodingStatistic);
  useEffect(() => {
    zmclient.on('audio-statistic-data-change', onAudioStatisticChange);
    zmclient.on('video-statistic-data-change', onVideoStatisticChange);
    zmclient.on('share-statistic-data-change', onShareStatisticChange);
    return () => {
      zmclient.off('audio-statistic-data-change', onAudioStatisticChange);
      zmclient.off('video-statistic-data-change', onVideoStatisticChange);
      zmclient.off('share-statistic-data-change', onShareStatisticChange);
    };
  }, [zmclient, onAudioStatisticChange, onVideoStatisticChange, onShareStatisticChange]);

  useEffect(() => {
    if (visible && mediaStream && zmclient.getSessionInfo().isInMeeting) {
      mediaStream.subscribeAudioStatisticData();
      mediaStream.subscribeVideoStatisticData();
      mediaStream.subscribeShareStatisticData();
    }
    return () => {
      if (zmclient.getSessionInfo().isInMeeting) {
        mediaStream?.unsubscribeAudioStatisticData();
        mediaStream?.unsubscribeVideoStatisticData();
        mediaStream?.unsubscribeShareStatisticData();
      }
    };
  }, [mediaStream, zmclient, visible]);
  useEffect(() => {
    if (!isStartedAudio || isMuted) {
      setAudioEncodingStatistic({ ...AudioQosDataShape, timestamp: Date.now() });
    }
  }, [isStartedAudio, isMuted]);
  useEffect(() => {
    if (!isStartedVideo) {
      setVideoEncodingStatistic({ ...VideoQosDataShape, timestamp: Date.now() });
    }
  }, [isStartedVideo]);
  useEffect(() => {
    if (defaultTab) {
      setTab(defaultTab);
    }
  }, [defaultTab]);
  useMount(() => {
    if (mediaStream) {
      const { encode: audioEncoding, decode: audioDecoding } = mediaStream.getAudioStatisticData();
      const { encode: videoEncoding, decode: videoDecoding } = mediaStream.getVideoStatisticData();
      setAudioDecodingStatistic({ ...audioDecoding, timestamp: Date.now() });
      setAudioEncodingStatistic({ ...audioEncoding, timestamp: Date.now() });
      setVideoDecodingStatistic({ ...videoDecoding, timestamp: Date.now() });
      setVideoEncodingStatistic({ ...videoEncoding, timestamp: Date.now() });
    }
  });

  const checkQos = useCallback(() => {
    const now = Date.now();
    [
      audioEncodingStatistic,
      audioDecodingStatistic,
      videoEncodingStatistic,
      videoDecodingStatistic,
      shareEncodingStatistic,
      shareDecodingStatistic
    ].forEach((item, index) => {
      if (item?.timestamp !== 0 && now - (item?.timestamp as number) > 2000) {
        switch (index) {
          case 0:
            setAudioEncodingStatistic(AudioQosDataShape);
            break;
          case 1:
            setAudioDecodingStatistic(AudioQosDataShape);
            break;
          case 2:
            setVideoEncodingStatistic(VideoQosDataShape);
            break;
          case 3:
            setVideoDecodingStatistic(VideoQosDataShape);
            break;
          case 4:
            setShareEncodingStatistic(VideoQosDataShape);
            break;
          default:
            setShareDecodingStatistic(VideoQosDataShape);
        }
      }
    });
  }, [
    audioEncodingStatistic,
    audioDecodingStatistic,
    videoEncodingStatistic,
    videoDecodingStatistic,
    shareEncodingStatistic,
    shareDecodingStatistic
  ]);
  useEffect(() => {
    checkQos();
    clearInterval(timerRef.current);
    timerRef.current = window.setInterval(checkQos, 3000);
    return () => clearInterval(timerRef.current);
  }, [
    audioEncodingStatistic,
    audioDecodingStatistic,
    videoEncodingStatistic,
    videoDecodingStatistic,
    shareEncodingStatistic,
    shareDecodingStatistic,
    checkQos
  ]);
  return (
    <Modal
      open={visible}
      onCancel={() => setVisible(false)}
      destroyOnClose
      footer={null}
      title="Audio/Video/Share Statistic"
    >
      <div>
        <Tabs onChange={onTabChange} activeKey={tab} type="card" size="large">
          <TabPane tab="Audio" key="audio">
            <Table dataSource={audioDataSource} columns={columns} pagination={false} />
          </TabPane>
          <TabPane tab="Video" key="video">
            <Table dataSource={videoDataSource} columns={columns} pagination={false} />
          </TabPane>
          <TabPane tab="Share" key="share">
            <Table dataSource={shareDataSource} columns={columns} pagination={false} />
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default AudioVideoStatisticModal;
