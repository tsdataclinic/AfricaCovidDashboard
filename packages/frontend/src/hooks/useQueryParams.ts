import { useCallback, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Category, CountryParam, DataType } from '../types';
import qs from 'query-string';
import { COUNTRY_PATH } from '../Routes';
import moment, { Moment } from 'moment';

type SeachQueryKey = 'selectedDate' | 'dataType' | 'category';
type SearchQueryValue = Moment | DataType | Category | null;

const useQueryParams = () => {
    const { country } = useParams<CountryParam>();
    const {
        push,
        location: { pathname, search },
    } = useHistory();

    const updateCountry = useCallback(
        (country: string | undefined) => {
            if (country !== undefined) {
                push(`${COUNTRY_PATH}/${country}${search}`);
            } else {
                push(`/${search}`);
            }
        },
        [push, search]
    );

    const updateQuery = useCallback(
        (key: SeachQueryKey, value: SearchQueryValue) => {
            const searchParams = qs.parse(search.replace('?', ''));
            const parseValue =
                key === 'selectedDate'
                    ? (value as Moment).format('YYYY-MM-DD')
                    : value;
            const newSearch = { ...searchParams, key: parseValue };
            push(`${pathname}?${qs.stringify(newSearch)}`);
        },
        [pathname, push]
    );

    const { selectedDate, dataType, categoy } = useMemo(
        () => qs.parse(search.replace('?', '')),
        [search]
    );

    return {
        country,
        updateCountry,
        selectedDate: selectedDate ? moment(selectedDate) : undefined,
        updateQuery,
        dataType: (dataType || 'cumulative') as DataType,
        categoy: (categoy || 'confirmed') as Category,
    };
};

export default useQueryParams;
