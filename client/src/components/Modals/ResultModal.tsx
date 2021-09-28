import { Modal, List, Input } from 'antd';
import React from 'react';
import { fetchOutputFiles } from '../../services/requests';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { downloadFile, fetchXml } from '../../services/requests';
import format from 'xml-formatter';

type ResultModalProps = {
  visible: boolean;
  onCancel: () => void;
  type: string;
};

export const ResultModal = (props: ResultModalProps) => {
  const [files, setFiles]: [string[], any] = React.useState([]);

  React.useEffect(() => {
    // fetch files
    (async () => {
      const fetchedFiles: any = await fetchOutputFiles();
      fetchedFiles &&
        fetchedFiles[props.type] &&
        setFiles(fetchedFiles[props.type]);
    })();
  });

  const TsItem = (item: string) => (
    <List.Item key={item}>
      <DownloadOutlined
        onClick={async () => {
          await downloadFile(item, 'ts');
        }}
      />
      {' ' + item}
    </List.Item>
  );

  const XmlItem = (item: string) => (
    <List.Item key={item}>
      <DownloadOutlined
        onClick={async () => {
          await downloadFile(item, 'xml');
        }}
      />
      <SearchOutlined
        className="standard-btn"
        onClick={async () => {
          const result = await fetchXml(item);
          result &&
            Modal.success({
              title: item,
              bodyStyle: { padding: 0 },
              content: (
                <Input.TextArea
                  autoSize
                  value={format(result, {
                    indentation: '  ',
                    filter: (node) => node.type !== 'Comment',
                    collapseContent: true,
                    lineSeparator: '\n',
                  })}
                />
              ),
              width: '75vw',
              closable: true,
              icon: null,
            });
        }}
      />
      {item}
    </List.Item>
  );

  return (
    <Modal
      title="Result Files"
      visible={props.visible}
      footer={null}
      onCancel={props.onCancel}
    >
      <List
        style={{
          height: '50%',
          overflow: 'auto',
          margin: '8px',
          width: '100%',
        }}
      >
        {files.map((item: string) =>
          props.type === 'xml' ? XmlItem(item) : TsItem(item)
        )}
      </List>
    </Modal>
  );
};
