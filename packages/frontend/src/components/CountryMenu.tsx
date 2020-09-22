import React from 'react';
import { useAvailableCountries } from '../hooks/useAvailableCountries';
import { Menu, Dropdown, Skeleton } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface CountryMenuProps {
    selectedCountry: string | undefined;
    onCountrySelected: (country: string) => void;
}

export function CountryMenu({
    selectedCountry,
    onCountrySelected,
}: CountryMenuProps) {
    const {
        status,
        data: countries,
        error,
        isFetching,
    } = useAvailableCountries();

    console.log(
        'status ',
        status,
        ' error ',
        error,
        ' isFetching ',
        isFetching
    );

    const handleCountryChange: (a: any) => void = ({ key }) => {
        if (onCountrySelected) {
            onCountrySelected(key);
        }
    };
    if (isFetching) {
        return <p>Loading...</p>;
    }
    return (
        <Dropdown
            overlay={() => (
                <Menu onClick={handleCountryChange}>
                    {countries.map((country: string) => (
                        <Menu.Item key={country}>{country} </Menu.Item>
                    ))}
                </Menu>
            )}
        >
            <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
            >
                {selectedCountry ? selectedCountry : 'Select a country'}
                <DownOutlined />
            </a>
        </Dropdown>
    );
}
