import { type LiveVideo, type LiveVideoContainer, VideoQuality } from '@zoom/videosdk/broadcast-streaming';
import {
  type DetailedHTMLProps,
  type DOMAttributes,
  type HTMLAttributes,
  useEffect,
  useContext,
  useRef,
  useState,
  useCallback
} from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, message, Modal, Form, Input } from 'antd';
import StreamingContext from './context/streaming-context';
import classNames from 'classnames';
import { IconFont } from '../component/icon-font';
import AudioVideoStatisticModal from './audio-video-statistic';
import 'antd/dist/antd.min.css';
import './streaming.scss';
interface AppProps {
  args: {
    signature: string;
    channelId: string;
  };
}
type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>;
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['live-video']: DetailedHTMLProps<HTMLAttributes<LiveVideo>, LiveVideo> & { class?: string };
      ['live-video-container']: CustomElement<LiveVideoContainer> & { class?: string };
    }
  }
}
function StreamingApp(props: AppProps) {
  const {
    args: { signature, channelId }
  } = props;
  const streaming = useContext(StreamingContext);
  const liveVideoRef = useRef<LiveVideo | null>(null);
  const invokeRef = useRef(false);
  const [cid, setCid] = useState(channelId);
  const [status, setStatus] = useState('initial');
  const [statisticVisible, setStatisticVisible] = useState(false);
  const [channelForm] = Form.useForm();
  useEffect(() => {
    if (liveVideoRef.current) {
      if (cid && signature && !invokeRef.current) {
        invokeRef.current = true;
        streaming.attachStreaming(cid, signature, VideoQuality.Video_720P, liveVideoRef.current);
        liveVideoRef.current.setAttribute('controls', 'true');
      }
    }
    return () => {
      if (liveVideoRef.current) {
        invokeRef.current = false;
        streaming.detachStreaming(cid, liveVideoRef.current);
      }
    };
  }, [streaming, cid, signature]);
  const onConnectionChange = useCallback((payload: any) => {
    const { state } = payload;

    if (state === 'Fail') {
      Modal.error({
        title: 'Join streaming failed',
        content: `Join streaming failed. reason:${payload.reason ?? ''}`
      });
    }
    setStatus(state);
  }, []);
  const onAutoPlayFailed = useCallback(() => {
    message.warn('Stream audio play failed. Click anywhere to recover');
    ['click', 'touch'].forEach((event) => {
      document.addEventListener(
        event,
        () => {
          if (liveVideoRef.current) {
            liveVideoRef.current.setAttribute('muted', 'false');
          }
        },
        { once: true }
      );
    });
  }, []);
  const onChangeChannelId = useCallback(() => {
    Modal.confirm({
      title: 'Change channel ID',
      content: (
        <Form form={channelForm}>
          <Form.Item label="Channel ID:" name="channelId" required>
            <Input />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const data = await channelForm.validateFields();
          const { channelId } = data;
          setCid(channelId);
        } catch (e) {
          console.warn(e);
        }
      },
      onCancel: () => {
        // pass
      }
    });
  }, [channelForm]);
  const onStatisticClick = useCallback(() => {
    if (!statisticVisible) {
      setStatisticVisible(true);
    }
  }, [statisticVisible]);
  const onStreamingEnd = useCallback(() => {
    message.warn('Broadcast streaming is ended!', 3);
  }, []);
  useEffect(() => {
    if (status === 'Connected' && !!liveVideoRef.current) {
      liveVideoRef.current.addEventListener('ended', onStreamingEnd);
    }
    return () => {
      liveVideoRef.current?.removeEventListener('ended', onStreamingEnd);
    };
  }, [status, onStreamingEnd]);
  useEffect(() => {
    streaming.on('auto-play-audio-failed', onAutoPlayFailed);
    streaming.on('connection-change', onConnectionChange);
    return () => {
      streaming.off('auto-play-audio-failed', onAutoPlayFailed);
      streaming.off('connection-change', onConnectionChange);
    };
  }, [streaming, onAutoPlayFailed, onConnectionChange]);

  return (
    <div className="app-container">
      <h2 className="title">Channel ID:{cid}</h2>
      <div className="stream-container">
        <div className={classNames('loading-layer', { show: status === 'initial' })}>
          <LoadingOutlined style={{ fontSize: '86px', color: '#fff' }} />
        </div>
        <live-video-container>
          <live-video ref={liveVideoRef} />
        </live-video-container>
      </div>
      <div className="tool-bar">
        {/* <Button
          type="ghost"
          shape="circle"
          className="vc-button"
          size="large"
          onClick={onChangeChannelId}
          icon={<IconFont type="icon-channel" />}
        /> */}
        <Button
          type="ghost"
          shape="circle"
          className="vc-button"
          size="large"
          onClick={onStatisticClick}
          icon={<IconFont type="icon-statistic" />}
        />
      </div>
      <AudioVideoStatisticModal visible={statisticVisible} setVisible={setStatisticVisible} />
    </div>
  );
}
export default StreamingApp;
