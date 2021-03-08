import React, { createContext, useContext, useMemo } from 'react';
import {
    Stats,
    useAllCountryStats,
    useAllRegionStats,
} from '../hooks/useStats';
import QueryParamsContext from './QueryParamsContext';

export type StatsMap = { [key: string]: Stats };

interface StatsContextValues {
    isLoading: boolean;
    currentStats?: Stats;
    allStats?: StatsMap;
}

const CountryStatsContext = createContext<StatsContextValues>({
    isLoading: false,
    currentStats: undefined,
    allStats: undefined,
});

export const CountryStatsStore: React.FC = ({ children }) => {
    const { country, region, isRegion } = useContext(QueryParamsContext);
    const {
        data: allCountryStats,
        isLoading: allCountryLoading,
    } = useAllCountryStats();

    const {
        data: allRegionStats,
        isLoading: allRegionLoading,
    } = useAllRegionStats();

    const allPopulation = useMemo(() => {
        if (!allRegionStats) {
            return 0;
        }
        return Object.values(allRegionStats).reduce(
            (total, cur) => cur.population + total,
            0
        );
    }, [allRegionStats]);

    const allStats: StatsMap = useMemo(
        () => ({
            ...allCountryStats,
            ...allRegionStats,
        }),
        [allCountryStats, allRegionStats]
    );

    const currentStats = useMemo(() => {
        if (isRegion) {
            if (!region) {
                return { name: 'All Regions', population: allPopulation };
            }
            return allStats[region];
        }
        return !country
            ? { name: 'All Countries', population: allPopulation }
            : allStats[country];
    }, [allStats, isRegion, country, region, allPopulation]);

    return (
        <CountryStatsContext.Provider
            value={{
                isLoading: allRegionLoading || allCountryLoading,
                currentStats: currentStats,
                allStats,
            }}
        >
            {children}
        </CountryStatsContext.Provider>
    );
};
export default CountryStatsContext;
