import { useContext } from 'react';
import QueryParamsContext from '../contexts/QueryParamsContext';

export const useQueryParams = () => {
    let context = useContext(QueryParamsContext);
    return context;
};
