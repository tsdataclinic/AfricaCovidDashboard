import { useContext, useMemo } from 'react';
import StatsContext from '../contexts/StatsContext';
import QueryParamsContext from '../contexts/QueryParamsContext';
import { scaleTrendDatum } from '../utils/trendUtils';
import moment from 'moment';
import { CountryTrend } from './useCountryTrends';

/** Get converted data by population */
const useTrendsScale = (trendData: CountryTrend[], allDates: Date[]) => {
    const { currentStats: statsData, isLoading: statsLoading } = useContext(
        StatsContext
    );

    const { selectedDate, per100K } = useContext(QueryParamsContext);
    const dates = useMemo(() => {
        if (selectedDate) {
            return allDates.filter((d) => selectedDate.isSameOrAfter(d, 'day'));
        }
        return [];
    }, [allDates, selectedDate]);

    const timeseries = useMemo(() => {
        const population = statsData?.population;
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
    }, [trendData, statsData, per100K, dates]);

    return {
        timeseries,
        dates,
        statsLoading,
    };
};

export default useTrendsScale;
