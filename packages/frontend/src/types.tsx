import { CountryTrend } from './hooks/useCountryTrends';

export type DataType = 'cumulative' | 'daily';
export type Category = 'confirmed' | 'recoveries' | 'deaths';
export type LookBackMonth = 'one_month' | 'three_month' | 'beginning';

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
