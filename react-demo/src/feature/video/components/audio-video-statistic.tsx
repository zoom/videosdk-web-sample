import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Modal, Table, Tabs } from 'antd';
import { AudioQosData, VideoQosData } from '@zoom/videosdk';
import ZoomContext from '../../../context/zoom-context';
import MediaContext from '../../../context/media-context';
import { useMount, useUnmount } from '../../../hooks';
interface AudioVideoStatisticModelProps {
  visible: boolean;
  defaultTab?: string;
  isStartedAudio: boolean;
  isMuted: boolean;
  isStartedVideo: boolean;
  setVisible: (visible: boolean) => void;
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
  sample_rate: 0
};

const VideoQosDataShape = {
  avg_loss: 0,
  fps: 0,
  height: 0,
  jitter: 0,
  max_loss: 0,
  rtt: 0,
  width: 0,
  sample_rate: 0
};
const getDataSouce = (
  streamMertics: typeof AudioMetrics | typeof VideoMetrics,
  encodingData: AudioQosData | VideoQosData | undefined,
  decodingData: AudioQosData | VideoQosData | undefined
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
const AudioVideoStatisticModel = (props: AudioVideoStatisticModelProps) => {
  const { visible, defaultTab, isStartedAudio, isStartedVideo, isMuted, setVisible } = props;
  const zmclient = useContext(ZoomContext);
  const { mediaStream } = useContext(MediaContext);
  const [tab, setTab] = useState(defaultTab || 'audio');
  const [audioEncodingStatistic, setAudioEncodingStatistic] = useState<AudioQosData>();
  const [audioDecodingStatistic, setAudioDecodingStatistic] = useState<AudioQosData>();
  const [videoEncodingStatistic, setVideoEncodingStatistic] = useState<VideoQosData>();
  const [videoDecodingStatistic, setVideoDecodingStatistic] = useState<VideoQosData>();
  const [shareEncodingStatistic, setShareEncodingStatistic] = useState<VideoQosData>();
  const [shareDecodingStatistic, setShareDecodingStatistic] = useState<VideoQosData>();
  const videoDecodeTimerRef = useRef(0);
  const audioDecodeTimerRef = useRef(0);
  const onTabChange = (key: string) => {
    setTab(key);
  };
  const clearAudioTimer = () => {
    if (audioDecodeTimerRef.current) {
      clearTimeout(audioDecodeTimerRef.current);
      audioDecodeTimerRef.current = 0;
    }
  };

  const clearVideoTimer = () => {
    if (videoDecodeTimerRef.current) {
      clearTimeout(videoDecodeTimerRef.current);
      videoDecodeTimerRef.current = 0;
    }
  };

  const onAudioStatisticChange = useCallback((payload) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setAudioEncodingStatistic({ ...restProps });
    } else {
      setAudioDecodingStatistic({ ...restProps });
      clearAudioTimer();
      // Reset audio decode data if no data come in over 2 seconds
      audioDecodeTimerRef.current = window.setTimeout(() => {
        setAudioDecodingStatistic(AudioQosDataShape);
      }, 2000);
    }
  }, []);
  const onVideoStatisticChange = useCallback((payload) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setVideoEncodingStatistic({ ...restProps });
    } else {
      setVideoDecodingStatistic({ ...restProps });
      clearVideoTimer();
      // Reset video decode data if no data come in over 2 seconds
      videoDecodeTimerRef.current = window.setTimeout(() => {
        setVideoDecodingStatistic(VideoQosDataShape);
      }, 2000);
    }
  }, []);
  const onShareStatisticChange = useCallback((payload) => {
    const {
      data: { encoding, ...restProps }
    } = payload;
    if (encoding) {
      setShareEncodingStatistic({ ...restProps });
    } else {
      setShareDecodingStatistic({ ...restProps });
      clearVideoTimer();
      // Reset video decode data if no data come in over 2 seconds
      videoDecodeTimerRef.current = window.setTimeout(() => {
        setShareDecodingStatistic(VideoQosDataShape);
      }, 2000);
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
    if (!isStartedAudio || isMuted) {
      setAudioEncodingStatistic(AudioQosDataShape);
    }
  }, [isStartedAudio, isMuted]);
  useEffect(() => {
    if (!isStartedVideo) {
      setVideoEncodingStatistic(VideoQosDataShape);
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
      setAudioDecodingStatistic(audioDecoding);
      setAudioEncodingStatistic(audioEncoding);
      setVideoDecodingStatistic(videoDecoding);
      setVideoEncodingStatistic(videoEncoding);
    }
  });
  useUnmount(() => {
    clearAudioTimer();
    clearVideoTimer();
  });
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

export default AudioVideoStatisticModel;
