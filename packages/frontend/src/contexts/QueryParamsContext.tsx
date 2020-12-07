import { noop } from 'lodash';
import { Moment } from 'moment';
import { createContext } from 'react';
import { SeachQueryKey, SearchQueryValue } from '../hooks/useQueryParams';
import { Category, DataType } from '../types';

interface QueryParamsContextProps {
    country: string;
    updateCountry: (country?: string) => void;
    selectedDate?: Moment;
    updateQuery: (key: SeachQueryKey, value: SearchQueryValue) => void;
    dataType: DataType;
    category: Category;
}

const QueryParamsContext = createContext<QueryParamsContextProps>({
    country: '',
    updateCountry: noop,
    selectedDate: undefined,
    updateQuery: noop,
    dataType: 'cumulative' as DataType,
    category: 'confirmed' as Category,
});

export default QueryParamsContext;
