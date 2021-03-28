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
        const mapper: TimeseriesMapper = {};
        const cleanData: CountryTrend[] = [];
        let prev = trendData[0];
        trendData.forEach((item) => {
            const key = moment(item.date).startOf('day').valueOf();
            if ((mapper[key] && !item.isPrediction) || !mapper[key]) {
                mapper[key] = item;
                // remove 0 data
                mapper[key].new_recoveries =
                    item.new_recoveries < 0 ? 0 : item.new_recoveries;
                // add delta value
                mapper[key].delta_confirmed =
                    mapper[key].confirmed - prev.confirmed;
                mapper[key].delta_death = mapper[key].deaths - prev.deaths;
                mapper[key].delta_recoveries =
                    mapper[key].recoveries - prev.recoveries;
                mapper[key].delta_confirmed_prediction =
                    (mapper[key].confirmed_prediction || 0) -
                    (prev.confirmed_prediction || prev.confirmed || 0);
                mapper[key].delta_new_case =
                    mapper[key].new_case - prev.new_case;
                mapper[key].delta_new_death =
                    mapper[key].new_deaths - prev.new_deaths;
                mapper[key].delta_new_recoveries =
                    mapper[key].new_recoveries - prev.new_recoveries;
                mapper[key].delta_daily_prediction =
                    (mapper[key].daily_prediction || 0) -
                    (prev.daily_prediction || prev.new_case || 0);
                prev = item;
                cleanData.push(item);
            }
        });

        const population = statsData?.population;
        const multiplier =
            population && per100K ? (1 / population) * 100000 : 1;
        return cleanData.map((item) =>
            scaleTrendDatum(item, multiplier, per100K)
        );
    }, [trendData, statsData, per100K]);

    return {
        timeseries,
        statsLoading,
    };
};

export default useTrendsScale;
