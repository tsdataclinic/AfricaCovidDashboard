import React from 'react';
import {
    HeatMapOutlined,
    AreaChartOutlined,
    GithubOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { ABOUT_PATH, COUNTRY_PATH, FORECAST_PATH, HOME_PATH } from '../Routes';

interface MenuProps {
    navCollapsed: boolean;
}

const AppMenu = ({ navCollapsed }: MenuProps) => {
    const { t } = useTranslation();
    const { pathname } = useLocation();

    return (
        <>
            <Logo>
                {navCollapsed ? t('Africa') : t('Africa COVID Dashboard')}
            </Logo>
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={[getMenuSelectedKey(pathname)]}
                defaultOpenKeys={['exploration']}
            >
                <Menu.SubMenu
                    key="exploration"
                    icon={<HeatMapOutlined />}
                    title={t('Exploration')}
                >
                    <Menu.Item key="summary">
                        <Link to={HOME_PATH}>Summary</Link>
                    </Menu.Item>
                    <Menu.Item key="country">
                        <Link to={`${COUNTRY_PATH}/Egypt`}>Country Detail</Link>
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.Item key="forecast" icon={<AreaChartOutlined />}>
                    <Link to={FORECAST_PATH}>{t('Forecast')}</Link>
                </Menu.Item>
                <Menu.Item key="about" icon={<GithubOutlined />}>
                    <Link to={ABOUT_PATH}>{t('About')}</Link>
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

const getMenuSelectedKey = (pathname: string) => {
    if (pathname.indexOf(COUNTRY_PATH) > -1) {
        return 'country';
    }
    switch (pathname) {
        case HOME_PATH:
            return 'summary';
        case FORECAST_PATH:
            return 'forecast';
        case ABOUT_PATH:
            return 'about';
        default:
            return 'summary';
    }
};
