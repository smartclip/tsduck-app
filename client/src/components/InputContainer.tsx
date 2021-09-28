import React from 'react';
import {
  PageHeader,
  Col,
  Select,
  Radio,
  Form,
  message,
  Checkbox,
  Typography,
  Row,
} from 'antd';

import {
  fetchAnalyze,
  fetchInputFiles,
  fetchLiveServices,
} from '../services/requests';
import { TsAit, TsService } from '../models/models';
import { UploadTool } from './Upload/UploadTool';

type InputContainerProps = {
  setAits: (tables: TsAit[]) => void;
  resetPlugin: () => void;
  tspStatus: any;
};

type ServiceSelectionProps = {
  setAits: (tables: TsAit[]) => void;
  aits: TsAit[];
  services: TsService[];
  disabled: boolean;
};

const ServiceSelection = (props: ServiceSelectionProps) => (
  <Form.Item
    label="Select Service"
    name={['plugins', 'zap']}
    initialValue={null}
    className="standard-form-item"
  >
    <Select
      allowClear
      className="standard-select"
      placeholder="no service selected"
      disabled={props.disabled}
      showSearch
      showArrow={false}
      filterOption={(input: any, option: any) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      onChange={(s: string) => {
        if (!s) {
          props.setAits(props.aits);
        } else {
          const selectedService: TsService = props.services.filter(
            (tsS: TsService) => tsS.name === s
          )[0];
          props.setAits(
            props.aits.filter((a: TsAit) => {
              return selectedService.pids.indexOf(a.pid) > -1;
            })
          );
        }
      }}
    >
      {props.services.map((s: TsService) => (
        <Select.Option key={s.name} value={s.name}>
          {s.name}
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);

const InputContainer = (props: InputContainerProps) => {
  /**
   * internal states
   */
  const [inputFiles, setInputFiles]: [string[], any] = React.useState([]);
  const [services, setServices]: [TsService[], any] = React.useState([]);
  const [aits, setAits]: [TsAit[], any] = React.useState([]);
  const [liveServices, setLiveServices]: [string[], any] = React.useState([]);
  const [liveTuningFile, setLiveTuningFile]: [string, any] = React.useState('');
  const [deliverySystem, setDeliverySystem]: [string, any] = React.useState('');

  const [file, setFile]: [string | undefined, any] = React.useState(undefined);
  const [input, setInput]: [string, any] = React.useState('file');

  /**
   * internal components
   */

  const doAnalyze = async (params: {
    type: 'live' | 'file';
    file?: string;
    service?: string;
  }) => {
    const analyze =
      params.type === 'live'
        ? await fetchAnalyze({ type: 'live', service: params.service })
        : params.type === 'file'
        ? await fetchAnalyze({ type: 'file', file: params.file })
        : { error: 'Unknown input type' };
    if (analyze) {
      props.setAits(analyze.result.aits);
      setAits(analyze.result.aits);
      setServices(analyze.result.services);
    } else {
      message.error('Problems with this input. Please check TSP Log.');
    }
  };

  const LiveInput = () => (
    <Row>
      <Col span={8}>
        <Form.Item
          label="Select Service"
          name={['plugins', 'zap']}
          initialValue={null}
          rules={[{ required: true }]}
          className="standard-form-item"
        >
          <Select
            allowClear
            showSearch
            showArrow={false}
            filterOption={(input: any, option: any) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            className="standard-select"
            placeholder="no service selected"
            onChange={async (s: string) => {
              await doAnalyze({ type: 'live', service: s });
            }}
          >
            {liveServices.map((s: string) => (
              <Select.Option key={s} value={s}>
                {s}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Typography.Paragraph
          className="small-info-with-top-space"
          disabled
        >{`Delivery system: ${deliverySystem}`}</Typography.Paragraph>
        <Typography.Paragraph
          disabled
          className="small-info"
        >{`Tuning file: ${liveTuningFile}`}</Typography.Paragraph>
      </Col>
    </Row>
  );

  const FileInput = () => (
    <Row>
      <Col span={8}>
        <Form.Item
          label="Select File"
          name={['input', 'file']}
          rules={[{ required: true }]}
          className="standard-form-item"
        >
          <Select
            disabled={props.tspStatus === 'busy'}
            value={file}
            showSearch
            showArrow={false}
            filterOption={(input: any, option: any) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            className="standard-select"
            placeholder="no file selected"
            onSelect={async (file: any) => {
              setFile(file);
              props.resetPlugin();
              await doAnalyze({ type: 'file', file });
            }}
          >
            {inputFiles.map((file: any) => (
              <Select.Option key={file} value={file}>
                {file}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item
          style={{ marginTop: '40px' }}
          name={['input', 'infinite']}
          valuePropName="checked"
        >
          <Checkbox>infinite</Checkbox>
        </Form.Item>
      </Col>
      <Col span={8}>
        <ServiceSelection
          setAits={setAits}
          aits={aits}
          services={services}
          disabled={props.tspStatus === 'busy' || !file}
        />
      </Col>
      <Col span={4}>
        <UploadTool
          existingFileNames={inputFiles}
          onUploadSuccess={async () => {
            const fetchedFiles: any = await fetchInputFiles();
            setInputFiles(fetchedFiles);
          }}
        />
      </Col>
    </Row>
  );

  /**
   * useEffect
   */

  React.useEffect(() => {
    (async () => {
      const fetchedFiles: any = await fetchInputFiles();
      fetchedFiles && setInputFiles(fetchedFiles);
      const fetchedLiveServices: any = await fetchLiveServices();
      if (fetchedLiveServices) {
        setLiveServices(fetchedLiveServices.channels);
        setLiveTuningFile(fetchedLiveServices.file);
        setDeliverySystem(fetchedLiveServices.system);
      }
    })();
  }, []);

  /**
   * structure
   */
  return (
    <div className="container-input">
      <PageHeader
        title="Input"
        extra={
          <Form.Item name={['input', 'type']}>
            <Radio.Group
              value={input}
              onChange={async (e: any) => {
                props.setAits([]);
                setInput(e.target.value);
              }}
            >
              <Radio.Button value="live">Live</Radio.Button>
              <Radio.Button value="file">File</Radio.Button>
            </Radio.Group>
          </Form.Item>
        }
      />
      {input === 'live' ? <LiveInput /> : <FileInput />}
    </div>
  );
};
export default InputContainer;
