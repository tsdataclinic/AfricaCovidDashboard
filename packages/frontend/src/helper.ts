import {
    Category,
    CountryTrendWithDelta,
    DataType,
    StatsBarItem,
} from './types';
import moment from 'moment';
import { BLUE, GREY, ORANGE, PURPLE, RED, DARK_BLUE } from './colors';

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
    data?: CountryTrendWithDelta,
    isDelta?: boolean
) => {
    if (!data) {
        return 0;
    }

    const predictedDaily = safeGet(
        isDelta ? data.delta_daily_prediction : data.daily_prediction
    );

    const predictedCumulative = safeGet(
        isDelta ? data.delta_confirmed_prediction : data.confirmed_prediction
    );

    switch (category) {
        case 'confirmed':
            return type === 'daily'
                ? data.isPrediction
                    ? predictedDaily
                    : safeGet(isDelta ? data.delta_new_case : data.new_case)
                : data.isPrediction
                ? predictedCumulative
                : safeGet(isDelta ? data.delta_confirmed : data.confirmed);
        case 'recoveries':
            return type === 'daily'
                ? safeGet(
                      isDelta ? data.delta_new_recoveries : data.new_recoveries
                  )
                : safeGet(isDelta ? data.delta_recoveries : data.recoveries);
        case 'deaths':
            return type === 'daily'
                ? safeGet(isDelta ? data.delta_new_death : data.new_deaths)
                : safeGet(isDelta ? data.delta_death : data.deaths);
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
            return DARK_BLUE;
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
                  color: DARK_BLUE,
              },
              {
                  label: 'Deaths',
                  value: 'deaths',
                  category: 'deaths',
                  color: PURPLE,
              },
          ]
        : [
              isPrediction
                  ? {
                        label: 'New Cases Prediction',
                        value: 'daily_prediction',
                        category: 'confirmed',
                        color: RED,
                    }
                  : {
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
