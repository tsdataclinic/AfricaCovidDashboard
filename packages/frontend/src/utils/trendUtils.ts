import moment from 'moment';
import isNil from 'lodash/isNil';
import { format } from 'd3';
import { CountryTrendWithDelta } from '../types';

const safeFormatInteger = (num: number | undefined): number =>
    num ? Math.round(num) : 0;

export const safeFormatFloat = (num: number | undefined): number =>
    num ? Number(num.toFixed(2)) : 0;

/**
 * Scale the provided trend datum by the specified amount. Useful for computing trend per X population
 * @param datum
 * @param scale
 */
export const scaleTrendDatum = (
    datum: CountryTrendWithDelta,
    scale: number,
    notInteger?: boolean
): CountryTrendWithDelta => {
    const formatter = notInteger ? safeFormatFloat : safeFormatInteger;
    const formattedData: CountryTrendWithDelta = { ...datum };
    Object.keys(datum).forEach((key) => {
        // @ts-ignore access key
        const data = datum[key];
        if (typeof data !== 'number') {
            // @ts-ignore access key
            formattedData[key] = data;
        } else if (key === 'days_since_first_case') {
            formattedData[key] = safeFormatInteger(data);
        } else {
            // @ts-ignore access key
            formattedData[key] = formatter(data * scale);
        }
    });
    return formattedData;
};

export const formatMonth = (d: Date) => moment(d).format('MMM YYYY');
export const formatDay = (d: Date) => moment(d).format('MMM DD YYYY');

export const formatNumber = (num: number) =>
    !isNil(num) ? format(',')(num) : '-';
