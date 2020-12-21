import React from 'react';
import { Row, Select, Switch } from 'antd';
import styled from 'styled-components';
import { SeachQueryKey, SearchQueryValue } from '../hooks/useQueryParams';
import { DataType } from '../types';
import { CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CountryMenu } from './CountryMenu';
const { Option } = Select;

interface QueryControlProps {
    isRegion: boolean;
    region: string;
    country: string;
    dataType: DataType;
    updateQuery: (key: SeachQueryKey, value: SearchQueryValue) => void;
}

const QueryControl = ({
    dataType,
    updateQuery,
    country,
    isRegion,
    region,
}: QueryControlProps) => {
    const { t } = useTranslation();
    return (
        <Row align="middle" justify="end">
            <Select
                defaultValue={dataType}
                style={{ width: 120, textAlign: 'left' }}
                onChange={(dataType: DataType) =>
                    updateQuery('dataType', dataType)
                }
            >
                <Option value="cumulative">{t('Cumulative')}</Option>
                <Option value="daily">{t('Daily')}</Option>
            </Select>
            <Group>
                <Text>{t('Region')}</Text>
                <Switch
                    checkedChildren={<CheckOutlined />}
                    onClick={(checked) => updateQuery('isRegion', checked)}
                    checked={isRegion}
                />
                <CountryMenu
                    selectedCountry={country}
                    updateQuery={updateQuery}
                    isRegion={isRegion}
                    selectedRegion={region}
                />
            </Group>
        </Row>
    );
};

const Text = styled.span`
    font-weight: bold;
    padding: 0 8px;
`;

const Group = styled.div`
    margin-right: 10px;
`;
export default QueryControl;
