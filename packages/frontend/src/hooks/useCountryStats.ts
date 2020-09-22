import { useQuery } from 'react-query';

const getCountryStats = async (_: any, country: string | undefined) => {
    const request = await fetch(
        `${process.env.REACT_APP_API_LOCATION}/country/${country}/stats`
    );
    const result = await request.json();
    return result;
};

export default function useCountryStats(country: string | undefined) {
    return useQuery(['countryStats', country], getCountryStats);
}
