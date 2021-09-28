import { Button, Card, Col, Typography, Row } from 'antd';
import React from 'react';
import { TsAit, TsAitTable } from '../../models/models';

type ChooseAitTableProps = {
  ait: TsAit;
  tables: TsAitTable[];
  onSelect: (selectedAitTable: TsAitTable) => void;
  onCancel: () => void;
};

export const ChooseAitTable = (props: ChooseAitTableProps) => {
  return (
    <>
      <Typography.Title level={5}>
        Choose a table of AIT #{props.ait.pid}:
      </Typography.Title>
      <Row
        gutter={[16, 16]}
        style={{ padding: '4px', height: '23vh', overflow: 'auto' }}
      >
        {props.tables.map((table: TsAitTable) => {
          return (
            <Col span={12} key={table.appId}>
              <div onClick={() => props.onSelect(table)}>
                <Card.Grid style={{ padding: '14px 24px' }}>
                  <Typography.Paragraph
                    strong
                  >{`App #${table.appId}`}</Typography.Paragraph>
                  <p>App Url: {table.url === '' ? '-' : table.url}</p>
                  <p>Version: {table.version || '-'}</p>
                  <p style={{ marginBottom: 0 }}>
                    Control Code: {table.controlCode || '-'}
                  </p>
                </Card.Grid>
              </div>
            </Col>
          );
        })}
      </Row>
      <Row gutter={[16, 16]}>
        <Button className="btn-margin-top" onClick={props.onCancel}>
          Cancel
        </Button>
      </Row>
    </>
  );
};
