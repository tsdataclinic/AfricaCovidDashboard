import React, { useCallback, useMemo } from 'react';
import { Skeleton } from 'antd';
import styled from 'styled-components';
import { useAllTrends } from '../hooks/useAllTrends';
import useQueryParams from '../hooks/useQueryParams';
import Timeseries from './Timeseries';
import { TrendDatum } from '../types';
import { convertDateStrToDate } from '../helper';

const Trend = () => {
    const { data, isFetching, error } = useAllTrends();
    const { country, dataType } = useQueryParams();

    const dates = useMemo(() => {
        if (!country || !data) {
            // TODO: summary
            return [];
        }
        return (
            data[country]?.map((item: TrendDatum) =>
                convertDateStrToDate(item.date)
            ) || []
        );
    }, [data, country]);

    if (isFetching) {
        return <Skeleton active={isFetching}></Skeleton>;
    } else if (error || !data) {
        return <p>Could not reach server</p>;
    }
    return (
        <TrendWrapper>
            <Timeseries
                timeseries={data[country] || []}
                dataType={dataType}
                dates={dates}
            />
        </TrendWrapper>
    );
};

export default Trend;

const TrendWrapper = styled.div`
    padding: 20px;
`;
