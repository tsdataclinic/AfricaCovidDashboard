import { useQuery } from 'react-query';

const getLastUpdatedTime = async () => {
    const request = await fetch('/api/country/updated');
    const result = await request.json();
    return result;
};

export function useUpdated() {
    return useQuery<string>('lastUpdatedTime', getLastUpdatedTime);
}
