import React from 'react';
import { Select, Card, Skeleton, Statistic } from 'antd';
import { Category, StatsBarItem } from '../../types';
import styled from 'styled-components';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { useTranslation } from 'react-i18next';
import { buttonize } from '../../utils/buttonize';

export interface SmallStatsBarProps {
    category: Category;
    selectCategory: (category: Category) => void;
    data?: CountryTrend;
    loading?: boolean;
    statsBarItems: StatsBarItem[];
}

const SmallStatsBar = ({
    category,
    selectCategory,
    data,
    loading,
    statsBarItems,
}: SmallStatsBarProps) => {
    const { t } = useTranslation();
    return (
        <Container className="hide-large">
            <Select value={category} onSelect={selectCategory}>
                {statsBarItems.map((column) => {
                    const value =
                        !data || data[column.value] === undefined
                            ? '--'
                            : (data[column.value] as number);
                    return (
                        <Select.Option value={column.category}>
                            <StyledCard
                                {...buttonize(() =>
                                    selectCategory(column.category)
                                )}
                                selected={column.category === category}
                                bordered={false}
                                hoverable
                            >
                                <Skeleton
                                    active
                                    paragraph={{ rows: 2 }}
                                    loading={loading}
                                    key={column.category}
                                >
                                    <Statistic
                                        title={t(column.label)}
                                        value={value}
                                        precision={0}
                                        valueStyle={{
                                            color: column.color,
                                            fontSize: '120%',
                                        }}
                                    />
                                </Skeleton>
                            </StyledCard>
                        </Select.Option>
                    );
                })}
            </Select>
        </Container>
    );
};

const Container = styled.div`
    margin-bottom: 10px;
    .ant-select {
        width: 100%;
        height: 72px;
    }
    && .ant-select-selector {
        height: 72px;
        text-align: left;
        padding: 0;
    }
    .ant-card-hoverable:hover {
        box-shadow: none;
    }
`;
const StyledCard = styled(Card)<{ selected: boolean }>`
    flex: 1 1 30%;
    margin-right: 10px;
    padding: 10px;
    &:last-child {
        margin-right: 0;
    }
    ${(props) =>
        props.selected &&
        `
    font-weight: bold;
  `};
    &:hover {
        cursor: pointer;
    }
    &:focus {
        outline: initial;
    }
    .ant-card-body {
        padding: 0;
    }
`;
export default SmallStatsBar;