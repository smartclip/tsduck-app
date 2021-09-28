import { Modal, Typography, Button, Spin } from 'antd';
import React from 'react';

export const ServiceDeadModal = () => (
  <Modal visible={true} closable={false} footer={null} title="Service is dead.">
    <Typography.Paragraph>Please restart the TSP server.</Typography.Paragraph>
  </Modal>
);

type ServiceInUseModalProps = {
  onClick: () => void;
};

export const ServiceInUseModal = (props: ServiceInUseModalProps) => (
  <Modal
    visible={true}
    footer={
      <Button
        className="modal-btn"
        onClick={props.onClick}
        type="primary"
        danger
      >
        Abort running session
      </Button>
    }
    title={null}
    closable={false}
    bodyStyle={{
      padding: '50px',
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <Spin tip={'Service is already in use. Please wait.'} />
  </Modal>
);
