import React, { useContext } from 'react';
import styled from 'styled-components';
import { Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import QueryParamsContext from '../../contexts/QueryParamsContext';

const DataSettings = () => {
    const { t } = useTranslation();
    const { updateQuery, isLog, per100K } = useContext(QueryParamsContext);

    return (
        <DataSettingsGroup>
            <Label>Data Settings:</Label>
            <Scale>
                <Group>
                    {t('Logarithmic')}:&nbsp;
                    <Switch
                        size="small"
                        checked={isLog}
                        onChange={() => updateQuery('isLog', !isLog)}
                    />
                </Group>

                <Group>
                    {t('Per 100K')}:&nbsp;
                    <Switch
                        size="small"
                        checked={per100K}
                        onChange={() => updateQuery('per100K', !per100K)}
                    />
                </Group>
            </Scale>
        </DataSettingsGroup>
    );
};

export default DataSettings;

const DataSettingsGroup = styled.div`
    text-align: left;
    font-size: 14px;
    width: 230px;
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