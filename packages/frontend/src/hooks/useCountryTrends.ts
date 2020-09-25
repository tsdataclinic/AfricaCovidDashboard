import { useQuery } from 'react-query';

const getTrendForCountry = async (_: any, country: string | undefined) => {
    const request = await fetch(`/api/country/${country}/trends`);
    const result = await request.json();
    return result;
};

export function useCountryTrends(country: string | undefined) {
    return useQuery(['countryTrend', country], getTrendForCountry);
}
