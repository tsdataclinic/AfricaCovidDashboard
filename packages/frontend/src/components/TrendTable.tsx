import React from 'react';
import { Table, Skeleton } from 'antd';
import { useCountryTrends } from '../hooks/useCountryTrends';

interface TrendTableProps {
    country: string | undefined;
}

const columns = [
    {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: 'Deaths',
        dataIndex: 'deaths',
        key: 'deaths',
    },
    {
        title: 'Confirmed',
        dataIndex: 'confirmed',
        key: 'confirmed',
    },
    {
        title: 'Recoveries',
        dataIndex: 'recoveries',
        key: 'recoveries',
    },
    {
        title: 'New Deaths',
        dataIndex: 'new_deaths',
        key: 'new_deaths',
    },
    {
        title: 'New Cases',
        dataIndex: 'new_cases',
        key: 'new_cases',
    },
    {
        title: 'New Recoveries',
        dataIndex: 'new_recoveries',
        key: 'new_recoveries',
    },
    {
        title: 'Days since first case',
        dataIndex: 'days_since_first_case',
        key: 'days_since_first_case',
    },
];

export function TrendTable({ country }: TrendTableProps) {
    const { data, isFetching } = useCountryTrends(country);

    if (isFetching && !country) {
        return <Skeleton active={isFetching} />;
    } else {
        return <Table dataSource={data} columns={columns} />;
    }
}
