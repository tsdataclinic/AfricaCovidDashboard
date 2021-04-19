import React from 'react';
import { Card, Skeleton, Statistic } from 'antd';
import { transparentize } from 'polished';
import { Category, DataType, StatsBarItem } from '../../types';
import styled from 'styled-components';
import { getCategories } from '../../helper';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { useTranslation } from 'react-i18next';
import { HINT_GREY } from '../../colors';
import { buttonize } from '../../utils/buttonize';
import SmallStatsBar from './SmallStatsBar';

interface StatsBarProps {
    dataType: DataType;
    category: Category;
    selectCategory: (category: Category) => void;
    data?: CountryTrend;
    loading?: boolean;
}

const StatsBar: React.FC<StatsBarProps> = ({
    dataType,
    category,
    selectCategory,
    data,
    loading,
}) => {
    const { t } = useTranslation();
    const items: StatsBarItem[] = getCategories(dataType, data?.isPrediction);
    return (
        <>
            <SmallStatsBar
                statsBarItems={items}
                loading={loading}
                selectCategory={selectCategory}
                data={data}
                category={category}
            />
            <Container className="hide-small">
                {items.map((column) => {
                    const value =
                        !data || data[column.value] === undefined
                            ? '--'
                            : (data[column.value] as number);
                    return (
                        <StyledCard
                            {...buttonize(() =>
                                selectCategory(column.category)
                            )}
                            selected={column.category === category}
                            color={column.color}
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
                                    valueStyle={{
                                        color: column.color,
                                        fontSize: '120%',
                                    }}
                                />
                            </Skeleton>
                        </StyledCard>
                    );
                })}
            </Container>
        </>
    );
};

const Container = styled.div`
    .ant-statistic-title {
        color: ${HINT_GREY};
    }
    @media (min-width: 768px) {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        position: relative;
        z-index: 100;
    }
`;
const StyledCard = styled(Card)<{ selected: boolean; color: string }>`
    flex: 1 1 30%;
    margin-right: 10px;
    &:last-child {
        margin-right: 0;
    }
    ${(props) =>
        props.selected &&
        `
    font-weight: bold;
    outline: ${props.color} solid 2px !important;
  `};
    &:hover {
        cursor: pointer;
    }
    &:focus {
        outline: initial;
    }
    > div {
        padding: min(6%, 24px);
    }
`;
export default StatsBar;
