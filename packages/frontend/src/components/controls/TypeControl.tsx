import React, { useContext } from 'react';
import styled from 'styled-components';
import { Select, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import QueryParamsContext from '../../contexts/QueryParamsContext';
import { GREEK_BLUE } from '../../colors';
import { DataType } from '../../types';
import { Moment } from 'moment';

const TypeControl = () => {
    const { t } = useTranslation();
    const { updateQuery, dataType, selectedDate } = useContext(
        QueryParamsContext
    );

    return (
        <TypeControlWrapper>
            <TypeSelect
                bordered={false}
                defaultValue={dataType}
                onChange={(dataType) =>
                    updateQuery('dataType', dataType as DataType)
                }
            >
                <Select.Option value="cumulative">
                    {t('Cumulative')}
                </Select.Option>
                <Select.Option value="daily">{t('Daily')}</Select.Option>
            </TypeSelect>
            <EndDateSelect
                value={selectedDate}
                onChange={(value: Moment | null) =>
                    value &&
                    updateQuery('selectedDate', value.format('YYYY-MM-DD'))
                }
            />
        </TypeControlWrapper>
    );
};

export default TypeControl;

const TypeControlWrapper = styled.div`
    padding: 10px 20px;
    display: flex;
    align-items: center;
    background-color: #d6e4ff;
    @media (min-width: 768px) {
        padding: 20px 30px;
    }
`;

const TypeSelect = styled(Select)`
    text-align: left;
    background-color: ${GREEK_BLUE};
    width: 120px;
    height: 26px;
    && .ant-select-selector {
        height: 22px;
        background-color: ${GREEK_BLUE};
    }
    && .ant-select-selection-item {
        line-height: 22px;
    }
`;

const EndDateSelect = styled(DatePicker)`
    padding: 2px 10px;
    margin-left: 5px;
    height: 26px;
    width: 200px;
    @media (min-width: 768px) {
        width: 130px;
    }
`;
