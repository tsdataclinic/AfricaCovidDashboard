import { useCallback, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Category, CountryParam, DataType } from '../types';
import qs from 'query-string';
import { COUNTRY_PATH } from '../Routes';
import moment, { Moment } from 'moment';

export type SeachQueryKey = 'selectedDate' | 'dataType' | 'category';
export type SearchQueryValue = Moment | DataType | Category | null;

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
            if (!value) {
                return;
            }
            const searchParams = qs.parse(search.replace('?', ''));
            const parseValue = moment.isMoment(value)
                ? value.format('YYYY-MM-DD')
                : value;
            const newSearch = { ...searchParams, [key]: parseValue };
            push(`${pathname}?${qs.stringify(newSearch)}`);
        },
        [pathname, push, search]
    );

    const { selectedDate, dataType, category } = useMemo(
        () => qs.parse(search.replace('?', '')),
        [search]
    );

    const selectedMoment = useMemo(
        () =>
            selectedDate && moment(selectedDate).isValid()
                ? moment(selectedDate)
                : undefined,
        [selectedDate]
    );
    return {
        country,
        updateCountry,
        selectedDate: selectedMoment,
        updateQuery,
        dataType: (dataType || 'cumulative') as DataType,
        category: (category || 'confirmed') as Category,
    };
};

export default useQueryParams;
