import { useQuery } from 'react-query';

const IgnoreRegions = ['Indian Ocean'];

const getAvailableRegions = async () => {
    const request = await fetch('/api/country/region');
    const result = await request.json();
    return result.filter((region: string) => !IgnoreRegions.includes(region));
};

export function useAvailableRegions() {
    return useQuery<string[]>('availableRegions', getAvailableRegions, {
        initialData: [],
        initialStale: true,
    });
}
