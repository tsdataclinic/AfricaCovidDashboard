import { useQuery } from 'react-query';
import { CountryTrends, getTrendMap, TrendMap } from './useCountryTrends';

const getAllRegionTrends = async (_: any) => {
    const path = '/api/country/region/trends';
    return getTrendMap(path);
};

export function useAllRegionTrends() {
    return useQuery<TrendMap<CountryTrends>, Error>(
        ['allRegionTrend'],
        getAllRegionTrends,
        {
            initialData: { rolling7Days: {}, rawDaily: {} },
            initialStale: true,
        }
    );
}
