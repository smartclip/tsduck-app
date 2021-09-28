import React from 'react';
import {
  PageHeader,
  Col,
  Form,
  Row,
  Typography,
  Input,
  Checkbox,
  Radio,
} from 'antd';
import { TsAit } from '../models/models';
import { ReplaceAitTables } from './ReplaceAit/ReplaceAitTables';

type PluginContainerProps = {
  aits: TsAit[];
  setAitToReplace: (ait?: TsAit) => void;
  plugin: string;
  setPlugin: (p: string) => void;
  form: any;
};

const PluginContainer = (props: PluginContainerProps) => {
  /**
   * structure
   */
  return (
    <div className="container-plugins">
      <Form form={props.form}>
        <PageHeader title="Action" />
        <Row style={{ height: '20%' }}>
          <Col span={4}>
            <Form.Item
              name={['plugins', 'synchronize']}
              valuePropName="checked"
            >
              <Checkbox>synchronized</Checkbox>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item
              name={['plugins', 'type']}
              style={{ width: '100%' }}
              initialValue="play"
            >
              <Radio.Group
                value={props.plugin}
                onChange={(e: any) => {
                  props.setPlugin(e.target.value);
                }}
              >
                <Radio.Button
                  disabled={props.aits.length === 0}
                  style={{ margin: '0 8px' }}
                  value="replace_ait"
                >
                  Replace AIT
                </Radio.Button>
                <Radio.Button
                  style={{ margin: '0 8px' }}
                  value="show_streamevent"
                >
                  Show Streamevent
                </Radio.Button>
                <Radio.Button style={{ margin: '0 8px' }} value="play">
                  Play
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        {props.plugin === 'replace_ait' && (
          <Row>
            <Col span={24}>
              <ReplaceAitTables
                aits={props.aits}
                setAitToReplace={props.setAitToReplace}
              />
            </Col>
          </Row>
        )}
        {props.plugin === 'show_streamevent' && (
          <>
            <Typography.Title level={5}>Get Stream Event XML:</Typography.Title>
            <Row>
              <Col span={8}>
                <Form.Item
                  label="Insert File Name"
                  name={['plugins', 'streamevent_file']}
                  rules={[{ required: true }]}
                  className="standard-form-item"
                >
                  <Input
                    className="standard-select"
                    placeholder="Enter file name"
                  ></Input>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
        {props.plugin === 'play' && (
          <Typography.Paragraph>
            No extra plugin selected. Ts file will be played unmodified.
          </Typography.Paragraph>
        )}
      </Form>
    </div>
  );
};
export default PluginContainer;
