import { Card, Col, Typography, Row } from 'antd';
import React from 'react';
import { TsAit } from '../../models/models';

type ChooseAitProps = {
  aits: TsAit[];
  onSelect: (selectedAit: TsAit) => void;
};

export const ChooseAit = (props: ChooseAitProps) => {
  return (
    <>
      <Typography.Title level={5}>Choose an AIT:</Typography.Title>
      <Row
        gutter={[16, 16]}
        style={{ padding: '4px', height: '28vh', overflow: 'auto' }}
      >
        {props.aits.map((ait: TsAit) => (
          <Col span={8} key={ait.pid}>
            <div onClick={() => props.onSelect(ait)}>
              <Card.Grid>
                <Typography.Paragraph
                  strong
                >{`PID #${ait.pid}`}</Typography.Paragraph>
                <p>Tables: {ait.tables.length}</p>
              </Card.Grid>
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
};
