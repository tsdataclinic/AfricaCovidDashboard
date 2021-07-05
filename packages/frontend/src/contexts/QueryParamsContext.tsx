import React, { useState, useEffect, useCallback } from 'react';
import { noop } from 'lodash';
import { createContext } from 'react';
import { Category, DataType } from '../types';
import qs from 'query-string';
import { useHistory } from 'react-router-dom';
import moment, { Moment } from 'moment';

export type SeachQueryKey =
    | 'selectedWindow'
    | 'selectedDate'
    | 'dataType'
    | 'category'
    | 'country'
    | 'region'
    | 'isRegion'
    | 'isLog'
    | 'per100K';

export type SearchQueryValue =
    | Moment
    | DataType
    | Category
    | string
    | boolean
    | null;

export type SelectedWindow = 'FULL' | '6M' | '1M';

interface QueryParamsContextProps {
    country: string;
    region: string;
    isRegion: boolean;
    isLog: boolean;
    per100K: boolean;
    selectedDate?: Moment;
    updateQuery: (key: SeachQueryKey, value: SearchQueryValue) => void;
    dataType: DataType;
    category: Category;
    selectedWindow: SelectedWindow;
}

const DefaultParams: QueryParamsContextProps = {
    country: '',
    region: '',
    isRegion: false,
    isLog: false,
    per100K: false,
    selectedDate: moment(),
    updateQuery: noop,
    dataType: 'daily' as DataType,
    category: 'confirmed' as Category,
    selectedWindow: 'FULL',
};

const QueryParamsContext = createContext<QueryParamsContextProps>(
    DefaultParams
);

export const QueryParamsProvider: React.FC = ({ children }) => {
    const [state, setState] = useState<QueryParamsContextProps>(DefaultParams);

    const { push, location } = useHistory();

    //Load in the inital state
    useEffect(() => {
        let parsed: any = qs.parse(window.location.search.replace('?', ''));

        if (!moment.isMoment(parsed.selectedDate)) {
            parsed.selectedDate = moment(parsed.selectedDate);
        }

        if (parsed.isRegion) {
            parsed.isRegion = parsed.isRegion === 'true';
        }
        if (parsed.isLog) {
            parsed.isLog = parsed.isLog === 'true';
        }
        let parsedPlusDefault = {
            ...DefaultParams,
            ...parsed,
        };

        setState(parsedPlusDefault);
    }, []);

    //Update internal state and the query param
    const updateQuery = useCallback(
        (key: SeachQueryKey, value: SearchQueryValue) => {
            const parseValue = moment.isMoment(value)
                ? value.format('YYYY-MM-DD')
                : value;

            const regionParams =
                key === 'region'
                    ? { isRegion: true }
                    : key === 'country'
                    ? { isRegion: false }
                    : {};

            const newState = {
                ...state,
                [key]: parseValue,
                ...regionParams,
            };

            setState(newState);

            let { updateQuery, ...rest } = newState;

            push(
                `${location.pathname}?${qs.stringify({
                    ...rest,
                    selectedDate: moment(rest.selectedDate).format(
                        'YYYY-MM-DD'
                    ),
                })}`
            );
        },
        [state]
    );

    return (
        <QueryParamsContext.Provider
            value={{
                ...state,
                updateQuery,
                selectedDate: moment(state.selectedDate),
            }}
        >
            {children}
        </QueryParamsContext.Provider>
    );
};

export default QueryParamsContext;
