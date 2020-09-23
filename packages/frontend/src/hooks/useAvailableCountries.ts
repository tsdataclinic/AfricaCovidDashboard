import { useQuery } from 'react-query';

const getAvailableCountries = async () => {
    const request = await fetch(
        `${process.env.REACT_APP_API_LOCATION}/country/`
    );
    const result = await request.json();
    return result;
};

export function useAvailableCountries() {
    return useQuery('availableCountries', getAvailableCountries);
}
