import { useMemo, useContext } from 'react';
import { scaleTrendDatum } from '../utils/trendUtils';
import { CountryTrend } from './useCountryTrends';
import StatsContext from '../contexts/StatsContext';
import { mapValues, values, isEmpty } from 'lodash';

export const useScaledData = (
    trendData: { [k in string]: CountryTrend } | undefined,
    per100k: boolean
) => {
    const { allStats } = useContext(StatsContext);

    const scaledTrendData = useMemo(() => {
        if (!trendData || !allStats) {
            return trendData;
        }
        const scaled = mapValues(trendData, (datum, country_iso) => {
            const population = allStats[country_iso]?.population;
            if (!population) {
                return undefined;
            }
            if (per100k) {
                return scaleTrendDatum(datum, 100000.0 / population, true);
            } else {
                return datum;
            }
        });
        // filter out null values
        Object.keys(scaled).forEach(
            (key) => scaled[key] === undefined && delete scaled[key]
        );
        return scaled as { [key: string]: CountryTrend };
    }, [allStats, trendData, per100k]);

    return scaledTrendData;
};
