import React from 'react';
import {
  Layout,
  Button,
  Divider,
  Form,
  message,
  Tag,
  Popconfirm,
  PageHeader,
} from 'antd';
import './App.css';
import 'antd/dist/antd.css';

import InputContainer from './components/InputContainer';
import PluginContainer from './components/PluginContainer';
import OutputContainer from './components/OutputContainer';
import {
  runTsp,
  fetchSessionKey,
  sessionLogout,
  fetchServerStatus,
  stopTsp,
} from './services/requests';
import { ServerStatus, TsAit } from './models/models';
import { Landing } from './components/Landing/Landing';
import {
  ServiceInUseModal,
  ServiceDeadModal,
} from './components/Modals/ServiceModals';
import { TspLogModal } from './components/Modals/TspLogModal';
import { ResultModal } from './components/Modals/ResultModal';
import { Header } from './components/Header';
import { validateTspParams } from './services/validation';
import { SyncOutlined } from '@ant-design/icons';

const FETCH_STATUS_INTERVAL_SEC: number = parseInt(
  process.env.REACT_APP_FETCH_STATUS_INTERVAL_SEC || '3'
);

function App() {
  /**
   * states
   */

  // session
  const [startedSession, setStartedSession]: [boolean, any] =
    React.useState(false);
  const [tspStatus, setTspStatus]: [string, any] = React.useState('free');

  // log
  const [tspLog, setTspLog]: [string[], any] = React.useState([]);

  // modals
  const [tspLogModal, setTspLogModal]: [boolean, any] = React.useState(false);
  const [resultModal, setResultModal]: [string, any] = React.useState('no');

  // plugins
  const [plugin, setPlugin]: [string, any] = React.useState('play');
  const [aits, setAits]: [TsAit[], any] = React.useState([]); // replace_aits
  const [aitToReplace, setAitToReplace]: [TsAit | undefined, any] =
    React.useState(undefined); // replace_aits

  // general
  const [form] = Form.useForm();

  /**
   * reset the plugin params to use if input changes
   */
  const resetPlugin = () => {
    setAitToReplace(undefined);
    setPlugin('play');
  };

  /**
   * reset form and states
   */
  const resetForm = React.useCallback(() => {
    form.resetFields();
    setAitToReplace(undefined);
    setPlugin('play');
    setAits([]);
  }, [form]);

  // function to fetch the server state
  const fetchStatus = React.useCallback(async () => {
    const response: {
      status?: ServerStatus;
      error?: number;
    } = await fetchServerStatus();

    if (response.error) {
      // server dead
      if (response.error === 500) {
        setTspStatus('dead');
      }
      // session timed out
      else if (response.error === 403) {
        message.error('Session Timeout');
        resetForm();
        setStartedSession(false);
      }
      // server in use
      else if (response.error === 401) {
        setTspStatus('inuse');
      }
      return;
    } else {
      const status = response.status as ServerStatus;

      // tsp busy
      if (status.busy) {
        tspStatus !== 'busy' && setTspStatus('busy');
        return;
      } else {
        setTspStatus('free');
      }

      const fetchedLog = [
        ...status.error.map((x: string) => 'ERROR: ' + x),
        ...status.log.map((x: string) => 'LOG: ' + x),
      ];

      // tsp log
      if (
        fetchedLog &&
        (tspLog.length !== fetchedLog.length ||
          !tspLog.every((e: string, i: number) => e === fetchedLog![i]))
      )
        setTspLog(fetchedLog);

      return;
    }
  }, [resetForm, tspLog, tspStatus]);

  /**
   * useEffect
   */
  React.useEffect(() => {
    // start session if a local key is given
    const localKey = localStorage.getItem('sessionkey');
    localKey && setStartedSession(true);

    /**
     * polling with setInterval
     * - source: https://blog.bitsrc.io/polling-in-react-using-the-useinterval-custom-hook-e2bcefda4197
     */
    const interval = setInterval(async () => {
      startedSession && (await fetchStatus());
    }, FETCH_STATUS_INTERVAL_SEC * 1000);

    (async () => startedSession && (await fetchStatus()))();

    return () => clearInterval(interval);
  }, [startedSession, tspStatus, fetchStatus]);

  /**
   * CASE 1: NO STARTED SESSION
   */
  if (!startedSession)
    return (
      <Layout className="layout">
        <Landing onClick={() => setStartedSession(true)} />
      </Layout>
    );
  /**
   * CASE 2: TSP IN USE
   */ else if (tspStatus === 'inuse')
    return (
      <Layout className="layout">
        <ServiceInUseModal
          onClick={async () => {
            await sessionLogout(resetForm);
            await fetchSessionKey();
          }}
        />
      </Layout>
    );
  /**
   * CASE 3: SERVER DEAD
   */ else if (tspStatus === 'dead')
    return (
      <Layout className="layout">
        <ServiceDeadModal />
      </Layout>
    );
  /**
   * CASE 4: LOGGED IN
   */ else
    return (
      <Layout className="layout">
        {/** MODALS */}
        <TspLogModal
          visible={tspLogModal}
          onCancel={() => setTspLogModal(false)}
          tspLog={tspLog}
        />
        <ResultModal
          visible={resultModal !== 'no'}
          onCancel={() => setResultModal('no')}
          type={resultModal}
        />

        {/** HEADER */}
        <Header
          tspLog={tspLog}
          setTspLogModal={setTspLogModal}
          logout={async () => {
            await sessionLogout(resetForm);
            setStartedSession(false);
          }}
        />

        {/** FORM */}
        <Layout.Content className="layout-content">
          <div className="container-tsp-busy">
            <Popconfirm
              title="Abort TSP?"
              onConfirm={async () => await stopTsp()}
            >
              <Tag
                icon={<SyncOutlined spin />}
                color="processing"
                className="tag-tsp-busy"
                visible={tspStatus === 'busy'}
              >
                TSP is busy...
              </Tag>
            </Popconfirm>
          </div>
          <Form
            form={form}
            initialValues={{
              input: { type: 'file' },
              output: { type: 'drop' },
            }}
            layout="vertical"
            style={{ height: '35%' }}
          >
            <InputContainer
              {...{
                setAits,
                resetPlugin,
                tspStatus,
              }}
            />
            <Divider />
            <OutputContainer />
          </Form>
          <Divider />
          <PluginContainer
            {...{ aits, setAitToReplace, plugin, setPlugin, form }}
          />
          <Divider />
          <div className="container-run">
            <Form
              form={form}
              onFinish={async (values: any) => {
                const params = validateTspParams(values, { aitToReplace });
                if (params.error) message.error(params.error);
                else {
                  const result = await runTsp(params.result!);
                  if (result.error) message.error(result.error);
                  else message.success('TSP finished!');
                }
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                className="result-btn"
                disabled={tspStatus === 'busy'}
                loading={tspStatus === 'busy'}
              >
                Run
              </Button>
              <Button onClick={() => resetForm()} className="result-btn">
                Reset
              </Button>
            </Form>
          </div>
          <Divider />
          <div className="container-result">
            <PageHeader
              title="Result Files"
              extra={[
                <Button onClick={() => setResultModal('xml')}>XML</Button>,
                <Button onClick={() => setResultModal('ts')}>TS</Button>,
              ]}
            />
          </div>
        </Layout.Content>
        <Layout.Footer className="layout-footer" />
      </Layout>
    );
}
export default App;
