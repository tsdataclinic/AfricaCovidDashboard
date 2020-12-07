import { CountryTrend } from '../hooks/useCountryTrends';

const safeFormatInteger = (num: number | undefined): number =>
    num ? Math.round(num) : 0;
/**
 * Scale the provided trend datum by the specified amount. Useful for computing trend per X population
 * @param datum
 * @param scale
 */
export const scaleTrendDatum = (
    datum: CountryTrend,
    scale: number
): CountryTrend => {
    return {
        confirmed: safeFormatInteger(datum.confirmed * scale),
        date: datum.date,
        deaths: safeFormatInteger(datum.deaths * scale),
        new_case: safeFormatInteger(datum.new_case * scale),
        new_deaths: safeFormatInteger(datum.new_deaths * scale),
        new_recoveries: safeFormatInteger(datum.new_recoveries * scale),
        recoveries: safeFormatInteger(datum.recoveries * scale),
        days_since_first_case: safeFormatInteger(datum.days_since_first_case),
        confirmed_prediction: safeFormatInteger(
            (datum.confirmed_prediction || 0) * scale
        ),
        confirmed_prediction_lower: safeFormatInteger(
            (datum.confirmed_prediction_lower || 0) * scale
        ),
        confirmed_prediction_upper: safeFormatInteger(
            (datum.confirmed_prediction_upper || 0) * scale
        ),
    };
};
