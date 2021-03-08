import React from 'react';
import { Skeleton, Card } from 'antd';
import Timeseries from './Timeseries';
import { DataType } from '../types';

import { CountryTrend } from '../hooks/useCountryTrends';

interface TrendProps {
    trendData: CountryTrend[];
    statsLoading: boolean;
    dataType: DataType;
    dates: Date[];
    isLog: boolean;
}

const Trend = ({
    trendData,
    dates,
    statsLoading,
    dataType,
    isLog,
}: TrendProps) => {
    return (
        <Card>
            <Skeleton active loading={statsLoading}>
                <Timeseries
                    timeseries={trendData}
                    dataType={dataType}
                    dates={dates}
                    isLog={isLog}
                />
            </Skeleton>
        </Card>
    );
};

export default Trend;
