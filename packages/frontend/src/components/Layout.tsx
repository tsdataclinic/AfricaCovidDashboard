import React, { useState, FunctionComponent } from 'react';
import { Layout, Drawer } from 'antd';
import styled from 'styled-components';
import AppMenu from './AppMenu';
import LayoutHeader from './Header';
import useQueryParams from '../hooks/useQueryParams';
import QueryParamsContext from '../contexts/QueryParamsContext';
import { CountryStatsStore } from '../contexts/CountryStatsContext';

const { Header, Sider, Content } = Layout;

const AppLayout: FunctionComponent = ({ children }) => {
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [showDrawer, setDrawer] = useState(false);
    const {
        country,
        region,
        isRegion,
        dataType,
        category,
        updateQuery,
        selectedDate,
    } = useQueryParams();
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
                    <LayoutHeader openDrawer={() => setDrawer(true)} />
                </StyledHeader>
                <Content>
                    <QueryParamsContext.Provider
                        value={{
                            country,
                            region,
                            isRegion,
                            dataType,
                            category,
                            updateQuery,
                            selectedDate,
                        }}
                    >
                        <CountryStatsStore>{children}</CountryStatsStore>
                    </QueryParamsContext.Provider>
                </Content>
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
        height: auto;
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
