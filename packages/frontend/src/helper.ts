import { Category, DataType, StatsBarItem } from './types';
import moment from 'moment';
import { BLUE, GREY, ORANGE, PURPLE, RED } from './colors';
import { CountryTrend } from './hooks/useCountryTrends';

export const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
});

export const abbreviateNumber = (num: number) => {
    if (Math.abs(num) < 1e3) return numberFormatter.format(num);
    else if (Math.abs(num) >= 1e3 && Math.abs(num) < 1e6)
        return numberFormatter.format(num / 1e3) + 'K';
    else if (Math.abs(num) >= 1e6)
        return numberFormatter.format(num / 1e6) + 'M';

    return '';
};

export const getStatistic = (
    type: DataType,
    category: Category,
    data?: CountryTrend
) => {
    if (!data) {
        return 0;
    }

    switch (category) {
        case 'confirmed':
            return type === 'daily'
                ? safeGet(data.new_case)
                : safeGet(data.confirmed) || safeGet(data.confirmed_prediction);
        case 'recoveries':
            return type === 'daily'
                ? safeGet(data.new_recoveries)
                : safeGet(data.recoveries);
        case 'deaths':
            return type === 'daily'
                ? safeGet(data.new_deaths)
                : safeGet(data.deaths);
        default:
            return 0;
    }
};

const safeGet = (value?: number) => (value ? value : 0);

export const getColor = (category: Category) => {
    switch (category) {
        case 'confirmed':
            return ORANGE;
        case 'recoveries':
            return BLUE;
        case 'deaths':
            return PURPLE;
    }
};

export const convertDateStrToDate = (str: string) => moment(str).toDate();

export const getCategories = (
    dataType: DataType,
    isPrediction?: boolean
): StatsBarItem[] =>
    dataType === 'cumulative'
        ? [
              isPrediction
                  ? {
                        label: 'Confirmed Prediction',
                        value: 'confirmed_prediction',
                        category: 'confirmed',
                        color: RED,
                    }
                  : {
                        label: 'Confirmed',
                        value: 'confirmed',
                        category: 'confirmed',
                        color: ORANGE,
                    },
              {
                  label: 'Recovered',
                  value: 'recoveries',
                  category: 'recoveries',
                  color: BLUE,
              },
              {
                  label: 'Deaths',
                  value: 'deaths',
                  category: 'deaths',
                  color: PURPLE,
              },
          ]
        : [
              {
                  label: 'New Cases',
                  value: 'new_case',
                  category: 'confirmed',
                  color: ORANGE,
              },
              {
                  label: 'New Recoveries',
                  value: 'new_recoveries',
                  category: 'recoveries',
                  color: BLUE,
              },
              {
                  label: 'New Deaths',
                  value: 'new_deaths',
                  category: 'deaths',
                  color: GREY,
              },
          ];
