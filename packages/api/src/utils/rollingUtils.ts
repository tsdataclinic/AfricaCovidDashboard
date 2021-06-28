import { TrendDatum } from '../country/country_types';

/** Smooth daily data by rolling average the data */
export const rollingDailyData = (
  trends: TrendDatum[],
  rollingDays: number,
): TrendDatum[] => {
  const sum: TrendDatum[] = [];
  const averageTrends: TrendDatum[] = [];
  trends.forEach((trend, index) => {
    if (sum.length >= rollingDays) {
      sum.shift();
    }

    sum.push(trend);
    averageTrends[index] = average(sum);
  });
  return averageTrends;
};

const average = (arr: TrendDatum[]): TrendDatum | undefined => {
  if (!arr || arr.length === 0) {
    return undefined;
  }

  const sum = {
    new_case: arr[0].new_case,
    new_deaths: arr[0].new_deaths,
    new_recoveries: arr[0].new_recoveries,
  };

  for (let i = 1; i < arr.length; i++) {
    sum.new_case = sum.new_case + arr[i].new_case;
    sum.new_deaths = sum.new_deaths + arr[i].new_deaths;
    sum.new_recoveries = sum.new_recoveries + arr[i].new_recoveries;
  }

  sum.new_case = Math.round(sum.new_case / arr.length);
  sum.new_deaths = Math.round(sum.new_deaths / arr.length);
  sum.new_recoveries = Math.round(sum.new_recoveries / arr.length);

  const lastData = arr[arr.length - 1];
  return { ...lastData, add: lastData.add, ...sum };
};
