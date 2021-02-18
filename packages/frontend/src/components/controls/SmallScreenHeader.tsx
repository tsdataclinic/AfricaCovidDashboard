import React from 'react';
import { Tooltip, Button, Row, Layout } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Logo from '../Logo';

interface HeaderProps {
    openDrawer: () => void;
}

const Header = ({ openDrawer }: HeaderProps) => (
    <StyledHeader>
        <Row justify="space-between" align="middle" className="hide-large">
            <Logo />
            <Tooltip title="menu">
                <Button
                    shape="circle"
                    icon={<MenuUnfoldOutlined />}
                    onClick={openDrawer}
                />
            </Tooltip>
        </Row>
    </StyledHeader>
);

export default Header;

const StyledHeader = styled(Layout.Header)`
    background-color: transparent;
    padding: 0 16px;
    line-height: 48px;
    &.ant-layout-header {
        height: auto;
    }
`;
