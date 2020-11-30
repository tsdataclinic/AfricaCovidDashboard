import { useQuery } from 'react-query';

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
}

export type CountryTrends = { [k in string]: CountryTrend[] };

const getTrendForCountry = async (_: any, country: string | undefined) => {
    if (country === undefined) {
        return [];
    }
    const controller = new AbortController();
    const { signal } = controller;
    const promise = fetch(`/api/country/${country}/trends`, { signal });
    // Cancel the request if React Query calls the `promise.cancel` method
    (promise as any).cancel = () => controller.abort();

    const request = await promise;
    const result = await request.json();
    return result;
};

export function useCountryTrends(country: string | undefined) {
    return useQuery<CountryTrend[]>(
        ['countryTrend', country],
        getTrendForCountry,
        {
            initialData: [],
            initialStale: true,
        }
    );
}

const getAllCountryTrends = async (_: any) => {
    const controller = new AbortController();
    const { signal } = controller;

    const promise = fetch(`/api/country/trends`, { signal });
    // Cancel the request if React Query calls the `promise.cancel` method
    (promise as any).cancel = () => controller.abort();

    const request = await promise;
    const result = await request.json();
    return result;
};

export function useAllCountryTrends() {
    return useQuery<CountryTrends>(['allCountryTrend'], getAllCountryTrends);
}

export function useAfricaTrends() {
    return useCountryTrends('africa');
}
