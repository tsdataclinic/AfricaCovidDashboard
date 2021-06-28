import { useContext } from 'react';
// import { useHistory } from 'react-router-dom';
// import { Category, DataType } from '../types';
// import qs from 'query-string';
// import moment, { Moment } from 'moment';
// import { isNil } from 'lodash';
import QueryParamsContext from '../contexts/QueryParamsContext';

// export type SeachQueryKey =
//     | 'selectedDate'
//     | 'dataType'
//     | 'category'
//     | 'country'
//     | 'region'
//     | 'isRegion'
//     | 'isLog'
//     | 'per100K';

// export type SearchQueryValue =
//     | Moment
//     | DataType
//     | Category
//     | string
//     | boolean
//     | null;

// const useQueryParams = () => {
//     const {
//         push,
//         location: { pathname, search },
//     } = useHistory();

//     const updateQuery = useCallback(
//         (key: SeachQueryKey, value: SearchQueryValue) => {
//             if (isNil(value)) {
//                 return;
//             }

//             const searchParams = qs.parse(search.replace('?', ''));
//             console.log(
//                 'updating ',
//                 key,
//                 ' value ',
//                 value,
//                 ' existing ',
//                 searchParams
//             );

//             const parseValue = moment.isMoment(value)
//                 ? value.format('YYYY-MM-DD')
//                 : value;
//             const regionParams =
//                 key === 'region'
//                     ? { isRegion: true }
//                     : key === 'country'
//                     ? { isRegion: false }
//                     : {};
//             const newSearch = {
//                 ...searchParams,
//                 [key]: parseValue,
//                 ...regionParams,
//             };
//             push(`${pathname}?${qs.stringify(newSearch)}`);
//         },
//         [pathname, push, search]
//     );

//     const {
//         selectedDate,
//         dataType,
//         category,
//         country,
//         region,
//         isRegion,
//         isLog,
//         per100K,
//     } = useMemo(() => qs.parse(search.replace('?', '')), [search]);

//     const selectedMoment = useMemo(
//         () =>
//             selectedDate && moment(selectedDate).isValid()
//                 ? moment(selectedDate)
//                 : undefined,
//         [selectedDate]
//     );

//     return {
//         country: country as string,
//         region: region as string,
//         isRegion: isRegion === 'true',
//         isLog: isLog === 'true',
//         per100K: per100K !== 'false',
//         selectedDate: selectedMoment,
//         updateQuery,
//         dataType: (dataType || 'daily') as DataType,
//         category: (category || 'confirmed') as Category,
//     };
// };

export const useQueryParams = () => {
    let context = useContext(QueryParamsContext);
    return context;
};
