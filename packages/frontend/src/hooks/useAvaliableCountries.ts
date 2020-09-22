import { useQuery } from 'react-query';

const getAvaliableCountries = async () => {
    const request = await fetch(`${process.env.SERVER_URL}/country/`);
    const result = await request.json();
    return result;
};

export default function useCountryStats(country: string) {
    return useQuery('avaliableCountries', getAvaliableCountries);
}
