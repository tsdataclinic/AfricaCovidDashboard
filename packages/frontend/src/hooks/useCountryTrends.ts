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
    if (!country) {
        return [];
    }
    const request = await fetch(`/api/country/${country}/trends`);
    const result = await request.json();
    return result;
};

export function useCountryTrends(country: string | undefined) {
    return useQuery<CountryTrend[]>(
        ['countryTrend', country],
        getTrendForCountry
    );
}

export function useAllCountryTrends() {
    return useQuery<CountryTrends>(['countryTrend'], getTrendForCountry);
}
