export interface CountryParam {
    country: string;
}

export type DataType = 'cumulative' | 'daily';
export type Category = 'confirmed' | 'active' | 'discovered' | 'Deceased';

export interface SearchQuery {
    selectedDate?: string;
    dataType?: DataType;
    categofy?: Category;
}
