import { CountryProperties } from './types';

export const getCountryA3 = (properties: CountryProperties): string => {
    if (typeof properties.iso_a3 === 'string') {
        return properties.iso_a3;
    }
    if (typeof properties.sov_a3 === 'string') {
        return properties.sov_a3;
    }
    return '';
};
