import React from 'react';
import { Skeleton, Card } from 'antd';
import Timeseries from './Timeseries';
import { DataType } from '../types';
import { CountryTrend } from '../hooks/useCountryTrends';
import { Moment } from 'moment';

interface TrendProps {
    trendData: CountryTrend[];
    rawDailyTimeseries: CountryTrend[];
    statsLoading: boolean;
    dataType: DataType;
    dates: Date[];
    isLog: boolean;
    selectedDate?: Moment;
    country: string;
    onSelectDate: (value: moment.Moment) => void;
}

const Trend = ({
    trendData,
    rawDailyTimeseries,
    dates,
    statsLoading,
    dataType,
    isLog,
    selectedDate,
    country,
    onSelectDate,
}: TrendProps) => {
    return (
        <Card>
            <Skeleton active loading={statsLoading}>
                <Timeseries
                    timeseries={trendData}
                    rawDailyTimeseries={rawDailyTimeseries}
                    dataType={dataType}
                    dates={dates}
                    isLog={isLog}
                    selectedDate={selectedDate}
                    country={country}
                    onSelectDate={onSelectDate}
                />
            </Skeleton>
        </Card>
    );
};

export default Trend;
