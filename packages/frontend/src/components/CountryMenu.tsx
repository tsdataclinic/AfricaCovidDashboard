import React from 'react';
import { useAvailableCountries, Country } from '../hooks/useAvailableCountries';
import { Select } from 'antd';

interface CountryMenuProps {
    selectedCountry: string | undefined;
    onCountrySelected: (country: string) => void;
}

export function CountryMenu({
    selectedCountry,
    onCountrySelected
}: CountryMenuProps) {
    const { data: countries, isFetching, error } = useAvailableCountries();

    const handleCountryChange = (country: string) => {
        if (onCountrySelected) {
            onCountrySelected(country);
        }
    };
    if (isFetching) {
        return <p>Loading...</p>;
    } else if (error) {
        return <p>Could not reach the server</p>;
    }
    return (
        <Select
            showSearch
            value={selectedCountry}
            style={{ width: 150 }}
            onSelect={handleCountryChange}
            bordered={false}
            placeholder="select a country"
        >
            {countries.map((country: Country) => (
                <Select.Option key={country.name} value={country.iso3}>
                    {country.name}{' '}
                </Select.Option>
            ))}
        </Select>
    );
}
