import React from 'react';
import { Descriptions, Skeleton } from 'antd';
import useCountryStats from '../hooks/useCountryStats';

interface CountryStatsProps {
    country: string | undefined;
}

export function CountryStats({ country }: CountryStatsProps) {
    const { data, isFetching } = useCountryStats(country);

    if (isFetching || !country) {
        return <Skeleton active={isFetching}></Skeleton>;
    } else {
        return (
            <Descriptions title={country}>
                {Object.keys(data).map((key: string) => (
                    <Descriptions.Item label={key}>
                        {data[key]}
                    </Descriptions.Item>
                ))}
            </Descriptions>
        );
    }
}
