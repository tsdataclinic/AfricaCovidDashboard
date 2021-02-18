import { noop } from 'lodash';
import { Moment } from 'moment';
import { createContext } from 'react';
import { SeachQueryKey, SearchQueryValue } from '../hooks/useQueryParams';
import { Category, DataType } from '../types';

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
}

const QueryParamsContext = createContext<QueryParamsContextProps>({
    country: '',
    region: '',
    isRegion: false,
    isLog: false,
    per100K: false,
    selectedDate: undefined,
    updateQuery: noop,
    dataType: 'cumulative' as DataType,
    category: 'confirmed' as Category,
});

export default QueryParamsContext;
