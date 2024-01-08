import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import './loading-layer.scss';

const LoadingLayer = (props: { content: any }) => {
  const { content } = props;
  return (
    <div className="loading-layer">
      <LoadingOutlined style={{ fontSize: '86px', color: '#fff' }} />
      <p className="loading-text">{content}</p>
    </div>
  );
};

export default LoadingLayer;
