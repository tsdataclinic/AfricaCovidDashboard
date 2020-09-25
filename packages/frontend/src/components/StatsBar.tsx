import React from 'react';
import { Card, Skeleton, Statistic } from 'antd';
import { Category, DataType } from '../types';
import { GREEN, GREY, RED } from '../colors';
import styled from 'styled-components';

interface TrendDatum {
    confirmed: number;
    date: string;
    deaths: number;
    recoveries: number;
    new_confirmed: number;
    new_deaths: number;
    new_recoveries: number;
}

interface StatsBarProps {
    dataType: DataType;
    category: Category;
    selectCategory: (category: Category) => void;
    data?: TrendDatum;
    loading?: boolean;
}

interface StatsBarItem {
    label: String;
    value: keyof TrendDatum;
    category: Category;
    color: string;
}
const StatsBar: React.FC<StatsBarProps> = ({
    dataType,
    category,
    selectCategory,
    data,
    loading,
}) => {
    const items: StatsBarItem[] =
        dataType === 'cumulative'
            ? [
                  {
                      label: 'Confirmed',
                      value: 'confirmed',
                      category: 'confirmed',
                      color: RED,
                  },
                  {
                      label: 'Recovered',
                      value: 'recoveries',
                      category: 'recoveries',
                      color: GREEN,
                  },
                  {
                      label: 'Deaths',
                      value: 'deaths',
                      category: 'deaths',
                      color: GREY,
                  },
              ]
            : [
                  {
                      label: 'New Cases',
                      value: 'new_confirmed',
                      category: 'confirmed',
                      color: RED,
                  },
                  {
                      label: 'New Recoveries',
                      value: 'new_recoveries',
                      category: 'recoveries',
                      color: GREEN,
                  },
                  {
                      label: 'New Deaths',
                      value: 'new_deaths',
                      category: 'deaths',
                      color: GREY,
                  },
              ];

    return (
        <Container>
            {items.map((column) => {
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
    ${(props) =>
        props.selected &&
        `
    font-weight: bold;
  `};
    &:hover {
        cursor: pointer;
    }
`;
export default StatsBar;
