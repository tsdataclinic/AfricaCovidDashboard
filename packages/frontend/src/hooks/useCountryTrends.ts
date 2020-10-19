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
}

export type CountryTrends = { [k in string]: CountryTrend[] };

const getTrendForCountry = async (_: any, country: string | undefined) => {
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
            enabled: country,
            initialData: [],
        }
    );
}

export function useAllCountryTrends() {
    return useQuery<CountryTrends>(['countryTrend'], getTrendForCountry);
}
