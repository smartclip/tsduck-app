import React from 'react';
import { PageHeader, Input, Col, Radio, Row, Typography } from 'antd';
import { Form } from 'antd';

const OutputContainer = () => {
  /**
   * internal states
   */
  const [output, setOutput]: [string, any] = React.useState('drop');

  const FileOutput = () => (
    <Row>
      <Col span={8}>
        <Form.Item
          label="Insert File Name"
          name={['output', 'file']}
          rules={[{ required: true }]}
          className="standard-form-item"
        >
          <Input
            className="standard-select"
            placeholder="Enter output file name"
          ></Input>
        </Form.Item>
      </Col>
    </Row>
  );

  /**
   * structure
   */
  return (
    <div className="container-output">
      <PageHeader
        title="Output"
        extra={
          <Form.Item name={['output', 'type']}>
            <Radio.Group
              value={output}
              onChange={(e: any) => {
                setOutput(e.target.value);
              }}
            >
              <Radio.Button value="drop">Drop</Radio.Button>
              <Radio.Button value="live">Live</Radio.Button>
              <Radio.Button value="file">File</Radio.Button>
            </Radio.Group>
          </Form.Item>
        }
      />
      {output === 'file' ? (
        <FileOutput />
      ) : (
        <Typography.Paragraph>{`${
          output === 'live' ? 'Live' : 'No'
        } Output Option selected.`}</Typography.Paragraph>
      )}
    </div>
  );
};
export default OutputContainer;
