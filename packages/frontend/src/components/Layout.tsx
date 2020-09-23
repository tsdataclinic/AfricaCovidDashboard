import React, { useState } from 'react';
import { Layout, Row, Col, Drawer, Tooltip, Button } from 'antd';
import { MenuUnfoldOutlined, SearchOutlined } from '@ant-design/icons';
import { CountryMenu } from './CountryMenu';
import { CountryStats } from './CountryStats';
import styled from 'styled-components';
import AppMenu from './AppMenu';
import LanguagePanel from './LanguagePanel';
import { TrendTable } from './TrendTable';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
        'Egypt'
    );
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
                    <CountryMenu
                        selectedCountry={selectedCountry}
                        onCountrySelected={setSelectedCountry}
                    />
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
                            <TrendTable country={selectedCountry} />
                        </Col>

                        <Col xs={24} lg={8}>
                            <CountryStats country={selectedCountry} />
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
