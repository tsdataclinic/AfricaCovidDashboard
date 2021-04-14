import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DARK_BLUE, HINT_GREY } from '../colors';

const Logo = () => {
    const { t } = useTranslation();

    return (
        <LogoWrapper to="/">
            <LogoTop>
                <i className="fas fa-globe-africa"></i>
                <LogoHeader>{t('Africa COVID')}</LogoHeader>
            </LogoTop>
            <LogoDescription className="hide-small">
                Understand the covid pandemic in Africa
            </LogoDescription>
        </LogoWrapper>
    );
};

export default Logo;

const LogoWrapper = styled(Link)`
    padding: 20px 10px;
    text-align: left;
    display: block;
`;

const LogoTop = styled.div`
    color: ${DARK_BLUE};
    font-weight: 900;
    display: flex;
    align-items: center;
`;

const LogoHeader = styled.span`
    padding-left: 5px;
`;

const LogoDescription = styled.div`
    color: ${HINT_GREY};
    font-size: 10px;
`;
