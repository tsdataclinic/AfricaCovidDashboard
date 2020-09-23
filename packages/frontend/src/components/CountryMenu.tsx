import React from 'react';
import { useAvailableCountries } from '../hooks/useAvailableCountries';
import { Select } from 'antd';

interface CountryMenuProps {
    selectedCountry: string | undefined;
    onCountrySelected: (country: string) => void;
}

export function CountryMenu({
    selectedCountry,
    onCountrySelected,
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
            defaultValue="Egypt"
            style={{ width: 120 }}
            onSelect={handleCountryChange}
            bordered={false}
        >
            {countries.map((country: string) => (
                <Select.Option key={country} value={country}>
                    {country}{' '}
                </Select.Option>
            ))}
        </Select>
    );
}
