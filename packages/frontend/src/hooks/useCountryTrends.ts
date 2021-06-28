import { useQuery } from 'react-query';
import { DEFAULT_ROLLING_DAYS } from '../constants';

export interface CountryTrend {
    date: string;
    new_case: number;
    new_deaths: number;
    new_recoveries: number;
    days_since_first_case: number;
    deaths: number;
    recoveries: number;
    confirmed: number;
    isPrediction?: boolean;
    confirmed_prediction?: number;
    confirmed_prediction_lower?: number;
    confirmed_prediction_upper?: number;
    daily_prediction?: number;
    daily_prediction_lower?: number;
    daily_prediction_upper?: number;
}

export interface TrendMap<T> {
    rolling7Days: T;
    rawDaily: T;
}

export type CountryTrends = { [k in string]: CountryTrend[] };

export const getTrendMap = async (path: string) => {
    const controller = new AbortController();
    const { signal } = controller;
    const rolling = fetch(`${path}?rolling=${DEFAULT_ROLLING_DAYS}`, {
        signal,
    });
    const daily = fetch(path, { signal });

    const requests = await Promise.all([rolling, daily]);

    const [rolling7Days, rawDaily] = await Promise.all([
        requests[0].json(),
        requests[1].json(),
    ]);

    return { rolling7Days, rawDaily };
};

const getTrendForCountry = async (_: any, country: string | undefined) => {
    if (country === undefined) {
        return { rolling7Days: [], rawDaily: [] };
    }
    const path = `/api/country/${country}/trends`;
    return getTrendMap(path);
};

export function useCountryTrends(country: string | undefined) {
    return useQuery<TrendMap<CountryTrend[]>>(
        ['countryTrend', country],
        getTrendForCountry,
        {
            initialData: { rolling7Days: [], rawDaily: [] },
            initialStale: true,
        }
    );
}

const getAllCountryTrends = async (_: any) => {
    const path = '/api/country/trends';
    return getTrendMap(path);
};

export function useAllCountryTrends() {
    return useQuery<TrendMap<CountryTrends>, Error>(
        ['allCountryTrend'],
        getAllCountryTrends
    );
}

export function useAfricaTrends() {
    return useCountryTrends('africa');
}
