import React, { useContext, useMemo } from 'react';
import { Skeleton, Card } from 'antd';
import Timeseries from './Timeseries';
import { DataType } from '../types';
import moment, { Moment } from 'moment';
import { CountryTrend } from '../hooks/useCountryTrends';
import CountryStatsContext from '../contexts/CountryStatsContext';
import { scaleTrendDatum } from '../utils/trendUtils';

interface TrendProps {
    trendData: CountryTrend[];
    selectedDate?: Moment;
    dataType: DataType;
    country: string;
    allDates: Date[];
    isLog: boolean;
    per100K: boolean;
}

const Trend = ({
    trendData,
    dataType,
    allDates,
    isLog,
    per100K,
    selectedDate,
}: TrendProps) => {
    const {
        currentCountryStats: countryStatsData,
        isLoading: countryStatsLoading,
    } = useContext(CountryStatsContext);

    const dates = useMemo(() => {
        if (selectedDate) {
            return allDates.filter((d) => selectedDate.isSameOrAfter(d, 'day'));
        }
        return [];
    }, [allDates, selectedDate]);

    const timeseries = useMemo(() => {
        const population = countryStatsData?.population;
        const trimData =
            dates.length === 0
                ? []
                : trendData.filter(
                      (countryTrend) =>
                          moment(dates[0]).isSameOrBefore(
                              countryTrend.date,
                              'day'
                          ) &&
                          moment(dates[dates.length - 1]).isSameOrAfter(
                              countryTrend.date,
                              'day'
                          )
                  );
        if (population && per100K) {
            const multiplier = (1 / population) * 100000;
            return trimData.map((item) => scaleTrendDatum(item, multiplier));
        }
        return trimData;
    }, [trendData, countryStatsData, per100K, dates]);

    return (
        <Card>
            <Skeleton active loading={countryStatsLoading}>
                <Timeseries
                    timeseries={timeseries}
                    dataType={dataType}
                    dates={dates}
                    isLog={isLog}
                />
            </Skeleton>
        </Card>
    );
};

export default Trend;
