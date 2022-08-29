import React, { useState, useCallback } from 'react';
import { InputNumber, Radio, Button } from 'antd';
import { SubsessionAllocationPattern } from '@zoom/videosdk';
import './subsession-create.scss';
interface SubsessionCreateProps {
  onCreateSubsession: (subsessionNumber: number, pattern: SubsessionAllocationPattern) => void;
  totalParticipantsSize: number;
}
const SubsessionCreate = (props: SubsessionCreateProps) => {
  const { onCreateSubsession, totalParticipantsSize } = props;
  const [subsessionNumber, setSubsessionNumber] = useState<number>(1);
  const [pattern, setPattern] = useState<SubsessionAllocationPattern>(SubsessionAllocationPattern.Automatically);
  let subsessionSize = ``;
  if (pattern === SubsessionAllocationPattern.Automatically) {
    const quotient = (totalParticipantsSize - 1) / subsessionNumber;
    if (Math.floor(quotient) === Math.ceil(quotient)) {
      subsessionSize = `${quotient}`;
    } else {
      subsessionSize = `${Math.floor(quotient)}-${Math.ceil(quotient)}`;
    }
  }
  const onRadioChange = useCallback((event) => {
    setPattern(event.target.value);
  }, []);

  const onInputChange = useCallback((value) => {
    setSubsessionNumber(value);
  }, []);
  const onCreateClick = useCallback(() => {
    onCreateSubsession(subsessionNumber, pattern);
  }, [subsessionNumber, pattern, onCreateSubsession]);
  return (
    <div className="room-create">
      <h2 className="room-create-title">
        Create <InputNumber min={1} value={subsessionNumber} onChange={onInputChange} /> subsessions
      </h2>
      <Radio.Group value={pattern} onChange={onRadioChange} className="room-create-option">
        <Radio value={SubsessionAllocationPattern.Automatically} key={SubsessionAllocationPattern.Automatically}>
          Assign automatically
        </Radio>
        <Radio value={SubsessionAllocationPattern.Manually} key={SubsessionAllocationPattern.Manually}>
          Assign manually
        </Radio>
      </Radio.Group>
      <div className="room-create-footer">
        <Button type="primary" onClick={onCreateClick}>
          {' '}
          Create
        </Button>
        {pattern === SubsessionAllocationPattern.Automatically && (
          <span className="room-create-tip">{subsessionSize} participants per subsession</span>
        )}
      </div>
    </div>
  );
};
export default SubsessionCreate;
