import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import CountryMenu, { CountryMenuProps } from './CountryMenu';
import DataSettings from './DataSettings';
import { WHITE } from '../../colors';

const TopControl = ({ selectedToggle, handleToggle }: CountryMenuProps) => (
    <TopControlWrapper justify="space-between" align="middle">
        <Col xs={24} md={12}>
            <CountryMenu
                handleToggle={handleToggle}
                selectedToggle={selectedToggle}
            />
        </Col>
        <Col xs={24} md={12} className="hide-small">
            <Row justify="end">
                <DataSettings />
            </Row>
        </Col>
    </TopControlWrapper>
);

export default TopControl;

const TopControlWrapper = styled(Row)`
    padding: 15px;
    background: ${WHITE};
    @media (min-width: 768px) {
        padding: 20px 30px;
    }
`;
