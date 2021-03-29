import i18nCountries from 'i18n-iso-countries';
import i18n from '../i18n';

const getSafeCountryCode = () => {
    if (i18n.language === 'sw') {
        // Missing country list file for SWAHILI
        return 'en';
    }
    return i18n.language;
};

/**
 * Return translated country name
 * @param isoCode country iso3 code
 */
export const getCountryName = (isoCode: string | number): string => {
    const name = i18nCountries.getName(isoCode, getSafeCountryCode());
    if (isoCode === 'CIV') {
        return "Côte d'Ivoire";
    } else {
        return name;
    }
};
