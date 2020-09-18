import React from 'react';
import {
    HeatMapOutlined,
    AreaChartOutlined,
    GithubOutlined
} from '@ant-design/icons';
import { Menu } from 'antd';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

interface MenuProps {
    navCollapsed: boolean;
}

const AppMenu = ({ navCollapsed }: MenuProps) => {
    const { t } = useTranslation();
    return (
        <>
            <Logo>
                {navCollapsed ? t('Africa') : t('Africa COVID Dashboard')}
            </Logo>
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['summary']}
                defaultOpenKeys={['exploration']}
            >
                <Menu.SubMenu
                    key="exploration"
                    icon={<HeatMapOutlined />}
                    title={t('Exploration')}
                >
                    <Menu.Item key="summary">Summary</Menu.Item>
                    <Menu.Item key="country">Country Detail</Menu.Item>
                    <Menu.Item key="map">Map Explorer</Menu.Item>
                </Menu.SubMenu>
                <Menu.Item key="forcast" icon={<AreaChartOutlined />}>
                    {t('Forcast')}
                </Menu.Item>
                <Menu.Item key="about" icon={<GithubOutlined />}>
                    {t('About')}
                </Menu.Item>
            </Menu>
        </>
    );
};

export default AppMenu;

const Logo = styled.div`
    color: white;
    padding: 20px;
`;
