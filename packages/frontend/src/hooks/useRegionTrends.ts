import { useQuery } from 'react-query';
import { CountryTrends } from './useCountryTrends';

const getAllRegionTrends = async (_: any) => {
    const controller = new AbortController();
    const { signal } = controller;

    const promise = fetch(`/api/country/region/trends`, { signal });
    // Cancel the request if React Query calls the `promise.cancel` method
    (promise as any).cancel = () => controller.abort();

    const request = await promise;
    const result = await request.json();
    return result;
};

export function useAllRegionTrends() {
    return useQuery<CountryTrends>(['allRegionTrend'], getAllRegionTrends, {
        initialData: {},
        initialStale: true,
    });
}
