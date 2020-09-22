import { useQuery } from 'react-query';

const getCountryStats = async (_: any, country: string) => {
    const request = await fetch(
        `${process.env.SERVER_URL}/country/${country}/stats`
    );
    const result = await request.json();
    return result;
};

export default function useCountryStats(country: string) {
    return useQuery(['countryStats', country], getCountryStats);
}
