import React, { useState, FunctionComponent } from 'react';
import { Layout, Drawer, Tooltip, Button } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import { CountryMenu } from './CountryMenu';
import styled from 'styled-components';
import AppMenu from './AppMenu';
import LanguagePanel from './LanguagePanel';
import { useParams, useHistory } from 'react-router-dom';
import { CountryParam } from '../types';
import { COUNTRY_PATH } from '../Routes';
import { useAllTrends } from '../hooks/useAllTrends';

const { Header, Sider, Content } = Layout;

const AppLayout: FunctionComponent = ({ children }) => {
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [showDrawer, setDrawer] = useState(false);
    const { country } = useParams<CountryParam>();
    const { push } = useHistory();
    const updateCountry = (country: string) => {
        push(`${COUNTRY_PATH}/${country}`);
    };

    const { data: trends } = useAllTrends();
    console.log('All trends ', trends);

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
                    {country && (
                        <CountryMenu
                            selectedCountry={country}
                            onCountrySelected={updateCountry}
                        />
                    )}

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
                <Content>{children}</Content>
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
