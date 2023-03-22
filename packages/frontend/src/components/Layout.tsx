import React, { useState, FunctionComponent } from 'react';
import { Layout, Drawer } from 'antd';
import styled from 'styled-components';
import AppMenu from './AppMenu';
import SmallScreenHeader from './controls/SmallScreenHeader';
import { CountryStatsStore } from '../contexts/StatsContext';
import { WHITE } from '../colors';

const { Sider, Content } = Layout;

const NAV_SHADOW = '0px 2px 8px rgba(0,0,0,0.15';

const AppLayout: FunctionComponent = ({ children }) => {
    const [showDrawer, setDrawer] = useState(false);
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                className="hide-small"
                theme="light"
                style={{ boxShadow: NAV_SHADOW }}
            >
                <AppMenu />
            </Sider>
            <StyledDrawer
                closable={false}
                placement="left"
                onClose={() => setDrawer(false)}
                visible={showDrawer}
                className="hide-large"
                bodyStyle={{ backgroundColor: WHITE }}
            >
                <AppMenu />
            </StyledDrawer>
            <Main>
                <div
                    style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '1.25rem',
                        padding: 8,
                    }}
                >
                    This app is currently offline and under maintenance.
                </div>
                <SmallScreenHeader openDrawer={() => setDrawer(true)} />
                <Content style={{ flex: 1, height: '100%' }}>
                    <CountryStatsStore>{children}</CountryStatsStore>
                </Content>
            </Main>
        </Layout>
    );
};

export default AppLayout;

const Main = styled(Content)`
    height: 100vh;
    background: #f0f2f5;
`;

const StyledDrawer = styled(Drawer)`
    .ant-drawer-body {
        padding: 0;
        background: #001529;
    }
`;
