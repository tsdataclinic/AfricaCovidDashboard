import React from 'react';
import { Row, Col, Select } from 'antd';
import styled from 'styled-components';
import { SeachQueryKey, SearchQueryValue } from '../../hooks/useQueryParams';
import { DataType } from '../../types';
import { useLocation } from 'react-router-dom';
import { ABOUT_PATH, FORECAST_PATH } from '../../Routes';
const { Option } = Select;

interface HeaderLeftControlProps {
    dataType: DataType;
    updateQuery: (key: SeachQueryKey, value: SearchQueryValue) => void;
}

const HeaderLeftControl = ({
    dataType,
    updateQuery,
}: HeaderLeftControlProps) => {
    const { pathname } = useLocation();
    const isHome = pathname !== FORECAST_PATH && pathname !== ABOUT_PATH;
    return (
        <Col span={12}>
            {isHome && (
                <Row align="middle">
                    <Text>Show</Text>
                    <Select
                        defaultValue={dataType}
                        style={{ width: 120, textAlign: 'left' }}
                        onChange={(dataType: DataType) =>
                            updateQuery('dataType', dataType)
                        }
                    >
                        <Option value="cumulative">Cumulative</Option>
                        <Option value="daily">Daily</Option>
                    </Select>
                </Row>
            )}
        </Col>
    );
};

const Text = styled.span`
    font-weight: bold;
    padding: 0 8px;
`;

export default HeaderLeftControl;
