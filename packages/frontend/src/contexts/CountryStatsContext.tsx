import React, { createContext, useContext } from 'react';
import {
    CountryStats,
    useAllCountryStats,
    useCountryStats,
} from '../hooks/useCountryStats';
import QueryParamsContext from './QueryParamsContext';

interface CountryStatsContextValues {
    isLoading: boolean;
    currentCountryStats?: CountryStats;
    allCountryStats?: { [key: string]: CountryStats };
}

const CountryStatsContext = createContext<CountryStatsContextValues>({
    isLoading: false,
    currentCountryStats: undefined,
    allCountryStats: undefined,
});

export const CountryStatsStore: React.FC = ({ children }) => {
    const { country } = useContext(QueryParamsContext);
    const {
        data: currentCountryStats,
        isLoading: currentCountryLoading,
    } = useCountryStats(country);
    const {
        data: allCountryStats,
        isLoading: allCountryLoading,
    } = useAllCountryStats();

    return (
        <CountryStatsContext.Provider
            value={{
                isLoading: currentCountryLoading || allCountryLoading,
                currentCountryStats,
                allCountryStats,
            }}
        >
            {children}
        </CountryStatsContext.Provider>
    );
};
export default CountryStatsContext;
