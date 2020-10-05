export interface CountryParam {
    country: string;
}

export type DataType = 'cumulative' | 'daily';
export type Category = 'confirmed' | 'recoveries' | 'deaths';
export type LookBackMonth = 'one_month' | 'three_month' | 'beginning';

export interface SearchQuery {
    selectedDate?: string;
    dataType?: DataType;
    categofy?: Category;
}

export interface TrendDatum {
    date: string;
    deaths: number;
    confirmed: number;
    recoveries: number;
    new_deaths: number;
    new_case: number;
    new_recoveries: number;
    days_since_first_case: number;
}

export interface StatsBarItem {
    label: String;
    value: keyof TrendDatum;
    category: Category;
    color: string;
}
