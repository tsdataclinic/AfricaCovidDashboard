import React from 'react';
import { Skeleton, Card } from 'antd';
import Timeseries from './Timeseries';
import { DataType } from '../types';
import { CountryTrend } from '../hooks/useCountryTrends';
import { Moment } from 'moment';

interface TrendProps {
    trendData: CountryTrend[];
    statsLoading: boolean;
    dataType: DataType;
    dates: Date[];
    isLog: boolean;
    selectedDate?: Moment;
}

const Trend = ({
    trendData,
    dates,
    statsLoading,
    dataType,
    isLog,
    selectedDate,
}: TrendProps) => {
    return (
        <Card>
            <Skeleton active loading={statsLoading}>
                <Timeseries
                    timeseries={trendData}
                    dataType={dataType}
                    dates={dates}
                    isLog={isLog}
                    selectedDate={selectedDate}
                />
            </Skeleton>
        </Card>
    );
};

export default Trend;
