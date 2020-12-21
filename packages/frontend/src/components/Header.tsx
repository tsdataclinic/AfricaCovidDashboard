import React from 'react';
import { Tooltip, Button, Row } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import LanguagePanel from './LanguagePanel';

interface HeaderProps {
    openDrawer: () => void;
}

const Header = ({ openDrawer }: HeaderProps) => (
    <Row justify="end" align="middle">
        <Tooltip title="change language">
            <LanguagePanel />
        </Tooltip>
        <Tooltip title="menu" className="hide-large">
            <Button
                shape="circle"
                icon={<MenuUnfoldOutlined />}
                onClick={openDrawer}
            />
        </Tooltip>
    </Row>
);

export default Header;
