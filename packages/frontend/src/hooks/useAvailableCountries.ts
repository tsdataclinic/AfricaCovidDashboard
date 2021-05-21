import { useQuery } from 'react-query';
import { countryNameMapping } from '../utils';

const getAvailableCountries = async () => {
    const request = await fetch('/api/country/');
    const result = await request.json();

    return result.map((country: any) => ({
        ...country,
        name: countryNameMapping(country.name),
    }));
};

export function useAvailableCountries() {
    return useQuery('availableCountries', getAvailableCountries);
}

export type Country = {
    name: string;
    iso3: string;
    continent: string;
    region: string;
};
