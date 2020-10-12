import { Category, DataType, StatsBarItem } from './types';
import moment from 'moment';
import { GREEN, GREY, RED } from './colors';
import { CountryTrend } from './hooks/useCountryTrends';

export const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1
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
    data: CountryTrend,
    type: DataType,
    category: Category
) => {
    switch (category) {
        case 'confirmed':
            return type === 'daily' ? data.new_case : data.confirmed;
        case 'recoveries':
            return type === 'daily' ? data.new_recoveries : data.recoveries;
        case 'deaths':
            return type === 'daily' ? data.new_deaths : data.deaths;
        default:
            return 0;
    }
};

export const findTrendData = (
    timeseries: CountryTrend[],
    date: Date
): CountryTrend => {
    const trendData = timeseries?.find(item =>
        moment(date).isSame(moment(item.date), 'day')
    );

    return (
        trendData || {
            date: '',
            deaths: 0,
            confirmed: 0,
            recoveries: 0,
            new_deaths: 0,
            new_case: 0,
            new_recoveries: 0,
            days_since_first_case: 0
        }
    );
};

export const getColor = (category: Category) => {
    switch (category) {
        case 'confirmed':
            return RED;
        case 'recoveries':
            return GREEN;
        case 'deaths':
            return GREY;
    }
};

export const formatDateToStr = (date: Date) => moment(date).format('MMM DD');
export const convertDateStrToDate = (str: string) => moment(str).toDate();

export const getCategories = (dataType: DataType): StatsBarItem[] =>
    dataType === 'cumulative'
        ? [
              {
                  label: 'Confirmed',
                  value: 'confirmed',
                  category: 'confirmed',
                  color: RED
              },
              {
                  label: 'Recovered',
                  value: 'recoveries',
                  category: 'recoveries',
                  color: GREEN
              },
              {
                  label: 'Deaths',
                  value: 'deaths',
                  category: 'deaths',
                  color: GREY
              }
          ]
        : [
              {
                  label: 'New Cases',
                  value: 'new_case',
                  category: 'confirmed',
                  color: RED
              },
              {
                  label: 'New Recoveries',
                  value: 'new_recoveries',
                  category: 'recoveries',
                  color: GREEN
              },
              {
                  label: 'New Deaths',
                  value: 'new_deaths',
                  category: 'deaths',
                  color: GREY
              }
          ];
