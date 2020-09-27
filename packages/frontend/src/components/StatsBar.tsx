import React from 'react';
import { Card, Skeleton, Statistic } from 'antd';
import { Category, DataType, TrendDatum, StatsBarItem } from '../types';
import styled from 'styled-components';
import { getCategories } from '../helper';

interface StatsBarProps {
    dataType: DataType;
    category: Category;
    selectCategory: (category: Category) => void;
    data?: TrendDatum;
    loading?: boolean;
}

const StatsBar: React.FC<StatsBarProps> = ({
    dataType,
    category,
    selectCategory,
    data,
    loading
}) => {
    const items: StatsBarItem[] = getCategories(dataType);

    return (
        <Container>
            {items.map(column => {
                return (
                    <Skeleton active loading={data === undefined || loading}>
                        <StyledCard
                            onClick={() => {
                                selectCategory(column.category);
                            }}
                            selected={column.category === category}
                            hoverable
                        >
                            <Statistic
                                title={column.label}
                                value={data && data[column.value]}
                                precision={0}
                                valueStyle={{ color: column.color }}
                            />
                        </StyledCard>
                    </Skeleton>
                );
            })}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    justify-content: space-between;
`;
const StyledCard = styled(Card)<{ selected: boolean }>`
    flex: 1 0 0px;
    margin: 10px;
    ${props =>
        props.selected &&
        `
    font-weight: bold;
  `};
    &:hover {
        cursor: pointer;
    }
`;
export default StatsBar;
