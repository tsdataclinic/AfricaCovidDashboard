import { CountryTrend } from './hooks/useCountryTrends';

export type DataType = 'cumulative' | 'daily';
export type Category = 'confirmed' | 'recoveries' | 'deaths';

export interface CountryTrendWithDelta extends CountryTrend {
    delta_death?: number;
    delta_confirmed?: number;
    delta_recoveries?: number;
    delta_confirmed_prediction?: number;
    delta_new_case?: number;
    delta_new_death?: number;
    delta_new_recoveries?: number;
}

export interface SearchQuery {
    selectedDate?: string;
    dataType?: DataType;
    categofy?: Category;
}

export interface StatsBarItem {
    label: string;
    value: keyof CountryTrend;
    category: Category;
    color: string;
}

export interface TimeseriesMapper {
    [key: number]: CountryTrendWithDelta;
}
