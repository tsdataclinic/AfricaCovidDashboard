import React from 'react';
import { Menu } from 'antd';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { ABOUT_PATH, HOME_PATH, LEGAL_PATH, FEEDBACK_PATH } from '../Routes';
import { DARK_BLUE } from '../colors';
import LanguagePanel from './LanguagePanel';
import Logo from './Logo';

const AppMenu = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();

    return (
        <>
            <Logo />
            <Flex>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={[getMenuSelectedKey(pathname)]}
                >
                    <Option
                        key="dashboard"
                        icon={<i className="fas fa-chart-line"></i>}
                    >
                        <Link to={HOME_PATH}>{t('Dashboard')}</Link>
                    </Option>
                    <Option
                        key="about"
                        icon={<i className="fas fa-info-circle"></i>}
                    >
                        <Link to={ABOUT_PATH}>{t('About')}</Link>
                    </Option>

                    <Option
                        key="legal"
                        icon={<i className="fas fa-balance-scale"></i>}
                    >
                        <Link to={LEGAL_PATH}>{t('Legal')}</Link>
                    </Option>

                    <Option
                        key="feedback"
                        icon={<i className="fas fa-comments"></i>}
                    >
                        <Link to={FEEDBACK_PATH}>{t('feedback')}</Link>
                    </Option>
                </Menu>
                <LanguagePanel />
            </Flex>
        </>
    );
};

export default AppMenu;

const Option = styled(Menu.Item)`
    color: ${DARK_BLUE};
    display: flex;
    align-items: center;
    i {
        margin-right: 5px;
    }
`;

const Flex = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100vh - 80px);
    justify-content: space-between;
`;

const getMenuSelectedKey = (pathname: string) => {
    switch (pathname) {
        case ABOUT_PATH:
            return 'about';
        default:
            return 'dashboard';
    }
};
