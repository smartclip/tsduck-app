import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Modal, message } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React from 'react';

const SERVER_URL: string =
  process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:3001';

type UploadToolProps = {
  existingFileNames: string[];
  onUploadSuccess: () => void;
};

export const UploadTool = (props: UploadToolProps) => {
  const fileAlreadyExists = (name: string) =>
    props.existingFileNames.indexOf(name) > -1;

  const uploadProps = {
    accept: '.ts',
    action: (file: RcFile) => `${SERVER_URL}/api/tsfiles/input/${file.name}`,
    beforeUpload: (file: RcFile): Promise<any> => {
      return new Promise((resolve) => {
        if (fileAlreadyExists(file.name)) {
          Modal.confirm({
            content: `'${file.name}' already exists. Overwrite?`,
            onOk: () => {
              resolve(true);
            },
            onCancel: () => {
              resolve(Upload.LIST_IGNORE);
            },
          });
        } else return resolve(true);
      });
    },
    onChange: async (info: any) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} File uploaded successfully`);
        await props.onUploadSuccess();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} File upload failed.`);
      }
    },
  };

  return (
    <Upload className="upload" {...uploadProps}>
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};
