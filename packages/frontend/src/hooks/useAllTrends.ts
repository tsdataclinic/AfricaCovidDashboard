import { useQuery } from 'react-query';

const getTrendsForAllCountries = async () => {
    const request = await fetch(`/api/country/trends`);
    const result = await request.json();
    return result;
};

export function useAllTrends() {
    return useQuery('countryTrend', getTrendsForAllCountries);
}
