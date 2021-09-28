import { SmileOutlined, LoginOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import React from 'react';

type LandingProps = {
  onClick: () => void;
};

export const Landing = (props: LandingProps) => (
  <div className="landing">
    <Card
      className="landing-card"
      title={
        <>
          Welcome! <SmileOutlined />
        </>
      }
    >
      <Button
        icon={<LoginOutlined />}
        onClick={() => props.onClick()}
        type="primary"
      >
        Start a TSP session.
      </Button>
    </Card>
  </div>
);
