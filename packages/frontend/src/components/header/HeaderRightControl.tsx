import React from 'react';
import { Tooltip, Button, Row, Col } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import { CountryMenu } from '../CountryMenu';
import LanguagePanel from '../LanguagePanel';
import useQueryParams from '../../hooks/useQueryParams';
import { useLocation } from 'react-router-dom';
import { ABOUT_PATH } from '../../Routes';

interface HeaderRightControlProps {
    openDrawer: () => void;
}

const HeaderRightControl = ({ openDrawer }: HeaderRightControlProps) => {
    const { country, updateCountry } = useQueryParams();
    const { pathname } = useLocation();
    const isNotAbout = pathname !== ABOUT_PATH;

    return (
        <Col span={12}>
            <Row justify="end" align="middle">
                {isNotAbout && (
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
                        onClick={openDrawer}
                    />
                </Tooltip>
            </Row>
        </Col>
    );
};

export default HeaderRightControl;
