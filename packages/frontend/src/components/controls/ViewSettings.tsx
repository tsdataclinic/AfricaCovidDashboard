import React, { useContext } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import QueryParamsContext from '../../contexts/QueryParamsContext';
import { DARK_BLUE } from '../../colors';
import InfoTooltip from '../InfoTooltip';

const ViewSettings = () => {
    const { updateQuery, selectedWindow } = useContext(QueryParamsContext);
    return (
        <ViewSettingsGroup>
            <Label>
                View Settings:{' '}
                <Info>
                    <InfoTooltip
                        message="Changing the view selection does not change cumulative counts. Cumulative counts are calculated from the first date of collected data."
                        top={3}
                        right={0}
                    />
                </Info>
            </Label>
            <Scale>
                <Group>
                    <Button
                        type={selectedWindow === 'FULL' ? 'primary' : 'default'}
                        style={{ marginRight: 5 }}
                        onClick={() => updateQuery('selectedWindow', 'FULL')}
                    >
                        Full History
                    </Button>
                    <Button
                        type={selectedWindow === '6M' ? 'primary' : 'default'}
                        style={{ marginRight: 5 }}
                        onClick={() => updateQuery('selectedWindow', '6M')}
                    >
                        6 Months
                    </Button>
                    <Button
                        type={selectedWindow === '1M' ? 'primary' : 'default'}
                        onClick={() => updateQuery('selectedWindow', '1M')}
                    >
                        1 Month
                    </Button>
                </Group>
            </Scale>
        </ViewSettingsGroup>
    );
};

export default ViewSettings;

const ViewSettingsGroup = styled.div`
    text-align: left;
    font-size: 14px;
    width: 300px;
    .ant-btn-primary {
        background-color: ${DARK_BLUE};
    }
`;

const Group = styled.div`
    margin-right: 10px;
`;

const Scale = styled.div`
    display: flex;
    flex-direction: row;
`;

const Label = styled.label`
    font-size: 0.75rem;
    font-weight: 900;
    margin-right: 0.25rem;
`;

const Info = styled.span`
    position: relative;
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 2px;
`;
