import { useQuery } from 'react-query';

const getAvailableRegions = async () => {
    const request = await fetch('/api/country/region');
    const result = await request.json();
    return result;
};

export function useAvailableRegions() {
    return useQuery<string[]>('availableRegions', getAvailableRegions, {
        initialData: [],
        initialStale: true,
    });
}
