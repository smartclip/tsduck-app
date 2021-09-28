import { Modal } from 'antd';
import React from 'react';

type TspLogModalProps = {
  visible: boolean;
  onCancel: () => void;
  tspLog: string[];
};

export const TspLogModal = (props: TspLogModalProps) => (
  <Modal
    title="TSP Log"
    visible={props.visible}
    footer={null}
    onCancel={props.onCancel}
  >
    <div>
      {props.tspLog.length > 0 ? (
        props.tspLog.map((entry: string) => <p key={entry}>{entry}</p>)
      ) : (
        <p>No log entries.</p>
      )}
    </div>
  </Modal>
);
