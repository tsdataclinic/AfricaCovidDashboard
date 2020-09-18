import React, { useState } from 'react';
import { Layout, Row, Col, Drawer, Tooltip, Button } from 'antd';
import { MenuUnfoldOutlined, SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import AppMenu from './AppMenu';
import LanguagePanel from './LanguagePanel';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [showDrawer, setDrawer] = useState(false);
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={navCollapsed}
                onCollapse={() => setNavCollapsed(!navCollapsed)}
                className="hide-small"
            >
                <AppMenu navCollapsed={navCollapsed} />
            </Sider>
            <StyledDrawer
                closable={false}
                placement="left"
                onClose={() => setDrawer(false)}
                visible={showDrawer}
                className="hide-large"
            >
                <AppMenu navCollapsed={false} />
            </StyledDrawer>
            <Main>
                <StyledHeader>
                    <Tooltip title="search">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<SearchOutlined />}
                        />
                    </Tooltip>

                    <Tooltip title="change language">
                        <LanguagePanel />
                    </Tooltip>
                    <Tooltip title="menu" className="hide-large">
                        <Button
                            shape="circle"
                            icon={<MenuUnfoldOutlined />}
                            onClick={() => setDrawer(true)}
                        />
                    </Tooltip>
                </StyledHeader>
                <Content>
                    <Row>
                        <Col xs={24} lg={16}>
                            Responsive Table Placeholder
                        </Col>
                        <Col xs={24} lg={8}>
                            Responsive Chart
                        </Col>
                    </Row>
                </Content>
            </Main>
        </Layout>
    );
};

export default AppLayout;

const StyledHeader = styled(Header)`
    background: white;
    padding: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 16px;
    &.ant-layout-header {
        height: 48px;
    }
`;

const Main = styled(Content)`
    height: 100vh;
`;

const StyledDrawer = styled(Drawer)`
    .ant-drawer-body {
        padding: 0;
        background: #001529;
    }
`;
