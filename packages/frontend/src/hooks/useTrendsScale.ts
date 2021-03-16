import { useContext, useMemo } from 'react';
import StatsContext from '../contexts/StatsContext';
import QueryParamsContext from '../contexts/QueryParamsContext';
import { scaleTrendDatum } from '../utils/trendUtils';
import { TimeseriesMapper } from '../types';
import { CountryTrend } from './useCountryTrends';
import moment from 'moment';

/** Get converted data by population */
const useTrendsScale = (trendData: CountryTrend[]) => {
    const { currentStats: statsData, isLoading: statsLoading } = useContext(
        StatsContext
    );
    const { per100K } = useContext(QueryParamsContext);

    const timeseries = useMemo(() => {
        // Remove duplicated data in same day;
        const timeseriesMapper: TimeseriesMapper = {};
        const cleanData: CountryTrend[] = [];
        trendData.forEach((item) => {
            const key = moment(item.date).startOf('day').valueOf();
            if (
                (timeseriesMapper[key] && !item.isPrediction) ||
                !timeseriesMapper[key]
            ) {
                timeseriesMapper[key] = item;
                cleanData.push(item);
            }
        });

        const population = statsData?.population;
        const multiplier =
            population && per100K ? (1 / population) * 100000 : 1;
        return cleanData.map((item) => scaleTrendDatum(item, multiplier));
    }, [trendData, statsData, per100K]);

    return {
        timeseries,
        statsLoading,
    };
};

export default useTrendsScale;
