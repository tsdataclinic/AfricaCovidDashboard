import React from 'react';
import { useAvailableCountries, Country } from '../hooks/useAvailableCountries';
import { useAvailableRegions } from '../hooks/useAvailableRegions';
import { Select } from 'antd';
import { SeachQueryKey, SearchQueryValue } from '../hooks/useQueryParams';
import { useTranslation } from 'react-i18next';
import { getCountryName } from '../utils/i18nUtils';

interface CountryMenuProps {
    isRegion: boolean;
    selectedRegion?: string;
    selectedCountry?: string;
    updateQuery: (key: SeachQueryKey, value: SearchQueryValue) => void;
}

export function CountryMenu({
    selectedCountry,
    isRegion,
    selectedRegion,
    updateQuery,
}: CountryMenuProps) {
    const { t } = useTranslation();
    const { data: countries, isFetching, error } = useAvailableCountries();
    const {
        data: regions,
        isFetching: isFetchingRegions,
        error: regionError,
    } = useAvailableRegions();
    const handleChange = (selected: string) => {
        if (isRegion) {
            updateQuery('region', selected);
            return;
        }
        updateQuery('country', selected);
    };

    if ((!isRegion && isFetching) || (isRegion && isFetchingRegions)) {
        return <p>{t('Loading...')}</p>;
    } else if ((!isRegion && error) || (isRegion && regionError)) {
        return <p>{t('Could not reach the server')}</p>;
    }

    if (isRegion && !Array.isArray(regions)) {
        return <p>{t('Could not reach the server')}</p>;
    }

    return (
        <Select
            showSearch
            value={isRegion ? selectedRegion : selectedCountry}
            style={{ width: 130 }}
            onSelect={handleChange}
            bordered={false}
            placeholder={
                isRegion ? t('select a region') : t('select a country')
            }
        >
            {isRegion
                ? regions?.map((region: string) => (
                      <Select.Option key={region} value={region}>
                          {t(region)}
                      </Select.Option>
                  ))
                : countries.map((country: Country) => (
                      <Select.Option key={country.name} value={country.iso3}>
                          {getCountryName(country.iso3)}
                      </Select.Option>
                  ))}
        </Select>
    );
}
