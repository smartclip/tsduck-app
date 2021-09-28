import { InfoCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { Layout, Menu, Badge } from 'antd';
import React from 'react';

type HeaderProps = {
  tspLog: string[];
  setTspLogModal: (visible: boolean) => void;
  logout: () => void;
};

export const Header = (props: HeaderProps) => {
  return (
    <Layout.Header>
      <Menu
        className="layout-header"
        theme="dark"
        mode="horizontal"
        selectedKeys={[]}
      >
        <Menu.Item
          icon={<InfoCircleOutlined />}
          key="TSP Log"
          onClick={() => {
            props.setTspLogModal(true);
          }}
        >
          TSP Log <Badge count={props.tspLog.length}></Badge>
        </Menu.Item>

        <Menu.Item
          icon={<LogoutOutlined />}
          key="logout"
          onClick={props.logout}
        >
          End Session
        </Menu.Item>
      </Menu>
    </Layout.Header>
  );
};
