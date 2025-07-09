import { Modal, Table, Tabs } from 'antd';
import type { AudioQosData, VideoQosData } from '@zoom/videosdk';
import { useCallback, useContext, useEffect, useState } from 'react';
import StreamingContext from './context/streaming-context';
const { TabPane } = Tabs;
interface ExtendedAudioQosData extends AudioQosData {
  timestamp: number;
}
interface ExtendedVideoQosData extends VideoQosData {
  timestamp: number;
}
const mult = '\u00D7';
const AudioMetrics = [
  {
    title: 'Frequency',
    value: 'sample_rate',
    format: (value: number) => `${value} khz`
  },
  // {
  //   title: 'Bitrate',
  //   value: ['bitrate'],
  //   format: (value: number) => `${(value / 1024).toFixed(1)} kb/s`
  // },
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
const columns = [
  {
    title: 'Item Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Receive',
    dataIndex: 'receive',
    key: 'receive'
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
  decodingData: ExtendedAudioQosData | ExtendedVideoQosData | undefined
) => {
  return streamMertics.map((metrics, index) => {
    let send = '';
    let receive = '';
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
interface AudioVideoStatisticModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}
const AudioVideoStatisticModal = (props: AudioVideoStatisticModalProps) => {
  const { visible, setVisible } = props;
  const streaming = useContext(StreamingContext);
  const [tab, setTab] = useState('audio');
  const [audioDecodingStatistic, setAudioDecodingStatistic] = useState<ExtendedAudioQosData>(AudioQosDataShape);
  const [videoDecodingStatistic, setVideoDecodingStatistic] = useState<ExtendedVideoQosData>(VideoQosDataShape);
  const onTabChange = (key: string) => {
    setTab(key);
  };
  const onAudioStatisticChange = useCallback((payload: any) => {
    const { encoding, ...restProps } = payload;
    if (!encoding) {
      setAudioDecodingStatistic({ ...restProps, timestamp: Date.now() });
    }
  }, []);
  const onVideoStatisticChange = useCallback((payload: any) => {
    const { encoding, ...restProps } = payload;
    if (!encoding) {
      setVideoDecodingStatistic({ ...restProps, timestamp: Date.now() });
    }
  }, []);
  const audioDataSource = getDataSouce(AudioMetrics, audioDecodingStatistic);
  const videoDataSource = getDataSouce(VideoMetrics, videoDecodingStatistic);
  useEffect(() => {
    streaming.on('audio-statistic-data-change', onAudioStatisticChange);
    streaming.on('video-statistic-data-change', onVideoStatisticChange);
    return () => {
      streaming.off('audio-statistic-data-change', onAudioStatisticChange);
      streaming.off('video-statistic-data-change', onVideoStatisticChange);
    };
  }, [streaming, onAudioStatisticChange, onVideoStatisticChange]);
  return (
    <Modal open={visible} onCancel={() => setVisible(false)} destroyOnClose footer={null} title="Audio/Video Statistic">
      <div>
        <Tabs onChange={onTabChange} activeKey={tab} type="card" size="large">
          <TabPane tab="Audio" key="audio">
            <Table dataSource={audioDataSource} columns={columns} pagination={false} />
          </TabPane>
          <TabPane tab="Video" key="video">
            <Table dataSource={videoDataSource} columns={columns} pagination={false} />
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};
export default AudioVideoStatisticModal;
