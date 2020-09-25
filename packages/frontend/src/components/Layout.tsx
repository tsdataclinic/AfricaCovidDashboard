import React, { useState, FunctionComponent } from 'react';
import { Layout, Drawer, Row } from 'antd';
import styled from 'styled-components';
import AppMenu from './AppMenu';
import HeaderRightControl from './header/HeaderRightControl';
import HeaderLeftControl from './header/HeaderLeftControl';

const { Header, Sider, Content } = Layout;

const AppLayout: FunctionComponent = ({ children }) => {
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
                    <Row justify="space-between" align="middle">
                        <HeaderLeftControl />
                        <HeaderRightControl
                            openDrawer={() => setDrawer(true)}
                        />
                    </Row>
                </StyledHeader>
                <Content>{children}</Content>
            </Main>
        </Layout>
    );
};

export default AppLayout;

const StyledHeader = styled(Header)`
    background: white;
    padding: 0 16px;
    line-height: 48px;
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
