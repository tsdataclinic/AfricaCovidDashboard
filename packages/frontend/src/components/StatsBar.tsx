import React from 'react';
import { Alert, Card, Skeleton, Statistic } from 'antd';
import { Category, DataType, StatsBarItem } from '../types';
import styled from 'styled-components';
import { getCategories } from '../helper';
import { CountryTrend } from '../hooks/useCountryTrends';

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
    const items: StatsBarItem[] = getCategories(dataType, data?.isPrediction);
    if (data === undefined) {
        return <StyledAlert message="There is no data" type="error" />;
    }
    return (
        <Container>
            {items.map((column) => {
                return (
                    <Skeleton active loading={loading} key={column.category}>
                        <StyledCard
                            onClick={() => {
                                selectCategory(column.category);
                            }}
                            selected={column.category === category}
                            hoverable
                        >
                            <Statistic
                                title={column.label}
                                value={
                                    data[column.value] === undefined
                                        ? '--'
                                        : (data[column.value] as number)
                                }
                                precision={0}
                                valueStyle={{
                                    color: column.color,
                                    fontSize: '120%',
                                }}
                            />
                        </StyledCard>
                    </Skeleton>
                );
            })}
        </Container>
    );
};

const StyledAlert = styled(Alert)`
    margin: 0 20px;
`;

const Container = styled.div`
    display: flex;
    justify-content: space-between;
`;
const StyledCard = styled(Card)<{ selected: boolean }>`
    flex: 1 1 30%;
    margin: 10px;
    ${(props) =>
        props.selected &&
        `
    font-weight: bold;
  `};
    &:hover {
        cursor: pointer;
    }
    > div {
        padding: min(6%, 24px);
    }
`;
export default StatsBar;
