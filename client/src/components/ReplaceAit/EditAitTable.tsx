import { Button, Card, Col, Form, Input, Typography, Row } from 'antd';
import React from 'react';
import { TsAit, TsAitTable } from '../../models/models';

type EditAitTableProps = {
  ait: TsAit;
  onCancel: () => void;
  onSubmit: (aitTable: TsAitTable) => void;
  table: TsAitTable;
};

export const EditAitTable = (props: EditAitTableProps) => {
  const [form] = Form.useForm();

  const formConf = { labelCol: { span: 3 }, wrapperCol: { span: 100 } };

  return (
    <>
      <Typography.Title level={5}>
        Edit Table #{props.table.appId} of AIT #{props.ait.pid}:
      </Typography.Title>
      <Form
        onFinish={(updatedValues: any) =>
          props.onSubmit({ appId: props.table.appId, ...updatedValues })
        }
        initialValues={props.table}
        layout="horizontal"
        form={form}
      >
        <Card.Grid hoverable={false} style={{ height: '36%' }}>
          <Row style={{ height: '28%', width: '100%' }}>
            <Col span={24}>
              <Form.Item
                label="App Name"
                name="appName"
                rules={[{ required: true }]}
                {...formConf}
              >
                <Input />
              </Form.Item>
              <Form.Item {...formConf} label="App URL" name="url">
                <Input />
              </Form.Item>
              <Form.Item
                {...formConf}
                label="Version"
                name="version"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                style={{ marginBottom: '8px' }}
                {...formConf}
                label="Control Code"
                name="controlCode"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ height: '4%' }}>
            <Form.Item>
              <Button
                style={{ marginRight: '16px' }}
                type="primary"
                onClick={() => form.submit()}
              >
                Submit
              </Button>
              <Button onClick={props.onCancel}>Cancel</Button>
            </Form.Item>
          </Row>
        </Card.Grid>
      </Form>
    </>
  );
};
