import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import {
    useAvailableCountries,
    Country,
} from '../../hooks/useAvailableCountries';
import { useAvailableRegions } from '../../hooks/useAvailableRegions';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getCountryName } from '../../utils/i18nUtils';
import QueryParamsContext from '../../contexts/QueryParamsContext';
import { GREEK_BLUE, WHITE, HIGHLIGHT_BLUE } from '../../colors';

const REGION_OPTIONS = [
    { value: 'Region', label: 'By Region' },
    { value: 'Country', label: 'By Country' },
];

export interface CountryMenuProps {
    handleToggle: () => void;
    selectedToggle: boolean;
}

const CountryMenu = ({ handleToggle, selectedToggle }: CountryMenuProps) => {
    const { t } = useTranslation();
    const { isRegion, updateQuery, region = '', country = '' } = useContext(
        QueryParamsContext
    );
    const { data: countries, isFetching, error } = useAvailableCountries();
    const {
        data: regions,
        isFetching: isFetchingRegions,
        error: regionError,
    } = useAvailableRegions();
    const handleChange = (selected: any) => {
        if (isRegion) {
            updateQuery('region', selected);
            return;
        }
        updateQuery('country', selected);
    };

    const handleChooseRegion = (selectedRegion: boolean) => {
        updateQuery('isRegion', selectedRegion);
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
        <Wrapper>
            <RegionSelect
                bordered={false}
                options={REGION_OPTIONS}
                value={isRegion ? 'Region' : 'Country'}
                onSelect={(selected) =>
                    handleChooseRegion(selected === 'Region')
                }
            ></RegionSelect>
            <CountryWrapper>
                <ListSelect
                    showSearch
                    value={isRegion ? region : country}
                    onSelect={handleChange}
                    // Search by ios3 and the country name
                    filterOption={(inputValue: string, option?: any) =>
                        option.value
                            .toLowerCase()
                            .indexOf(inputValue.toLowerCase()) >= 0 ||
                        option.children
                            .toLowerCase()
                            .indexOf(inputValue.toLowerCase()) >= 0
                    }
                    placeholder={
                        isRegion ? t('select a region') : t('select a country')
                    }
                >
                    {isRegion ? (
                        <Select.Option key="all" value={''}>
                            All Regions
                        </Select.Option>
                    ) : (
                        <Select.Option key="all" value={''}>
                            All Countries
                        </Select.Option>
                    )}
                    {isRegion
                        ? regions?.map((region: string) => (
                              <Select.Option key={region} value={region}>
                                  {t(region)}
                              </Select.Option>
                          ))
                        : countries.map((country: Country) => (
                              <Select.Option
                                  key={country.name}
                                  value={country.iso3}
                              >
                                  {getCountryName(country.iso3)}
                              </Select.Option>
                          ))}
                </ListSelect>
                <DrowdownTrigger
                    className="fas fa-sliders-h hide-large"
                    onClick={handleToggle}
                    selected={selectedToggle}
                />
            </CountryWrapper>
        </Wrapper>
    );
};

export default CountryMenu;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const RegionSelect = styled(Select)`
    background-color: ${GREEK_BLUE};
    width: 100%;
    text-align: left;
    margin-bottom: 5px;
    && .ant-select-selector {
        height: 22px;
    }
    && .ant-select-selection-item {
        line-height: 22px;
    }

    @media (min-width: 768px) {
        width: 110px;
    }
`;

const CountryWrapper = styled.div`
    display: flex;
`;

const ListSelect = styled(Select)`
    font-size: 30px;
    font-weight: 500;
    text-align: left;
    width: calc(100% - 50px);
    @media (min-width: 768px) {
        width: 275px;
    }
    && .ant-select-selector {
        height: 40px;
        line-height: 40px;
    }
    && .ant-select-selection-item {
        line-height: 40px;
    }
`;

const DrowdownTrigger = styled.i<{ selected: boolean }>`
    font-size: 30px;
    color: ${HIGHLIGHT_BLUE};
    border: 1px solid #d9d9d9;
    margin-left: 8px;
    padding: 0 2px;
    line-height: 38px;
    ${(props) =>
        props.selected && `color: ${WHITE}; background: ${HIGHLIGHT_BLUE}`}
`;
