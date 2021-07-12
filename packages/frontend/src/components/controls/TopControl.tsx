import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import CountryMenu, { CountryMenuProps } from './CountryMenu';
import DataSettings from './DataSettings';
import ViewSettings from './ViewSettings';
import { GREY, WHITE } from '../../colors';
import moment from 'moment';

interface TopControlProps extends CountryMenuProps {
    lastUpdatedDate?: string;
}

const TopControl = ({
    selectedToggle,
    handleToggle,
    lastUpdatedDate,
}: TopControlProps) => (
    <TopControlWrapper justify="space-between" align="middle">
        <Col xs={24} md={6}>
            <CountryMenu
                handleToggle={handleToggle}
                selectedToggle={selectedToggle}
            />
            {lastUpdatedDate && (
                <UpdatedText>
                    Last updated on{' '}
                    {moment(lastUpdatedDate).utc().format('lll')}
                </UpdatedText>
            )}
        </Col>
        <Col xs={24} md={18} className="hide-small">
            <Row justify="end">
                <DataSettings />
                <ViewSettings />
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

const UpdatedText = styled.div`
    text-align: left;
    margin-top: 5px;
    font-size: 11px;
    color: ${GREY};
`;
