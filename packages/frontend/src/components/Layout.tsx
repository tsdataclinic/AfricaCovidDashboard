import React, { useState, FunctionComponent } from 'react';
import { Layout, Drawer } from 'antd';
import styled from 'styled-components';
import AppMenu from './AppMenu';
import SmallScreenHeader from './controls/SmallScreenHeader';
import useQueryParams from '../hooks/useQueryParams';
import QueryParamsContext from '../contexts/QueryParamsContext';
import { CountryStatsStore } from '../contexts/CountryStatsContext';
import { WHITE } from '../colors';

const { Sider, Content } = Layout;

const NAV_SHADOW = '0px 2px 8px rgba(0,0,0,0.15';

const AppLayout: FunctionComponent = ({ children }) => {
    const [showDrawer, setDrawer] = useState(false);
    const {
        country,
        region,
        isRegion,
        dataType,
        category,
        updateQuery,
        selectedDate,
        isLog,
        per100K,
    } = useQueryParams();
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
                <SmallScreenHeader openDrawer={() => setDrawer(true)} />
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
                            isLog,
                            per100K,
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
