import { useState, useEffect } from 'react';
import { CountryTrends } from './useCountryTrends';
import { extent } from 'd3';

export const useDailyRange = (
    trends: CountryTrends | undefined,
    per100k: boolean,
    isLog: boolean
) => {
    const [range, setRange] = useState<any | null>(null);

    useEffect(() => {
        if (trends) {
            let all_deaths: number[] = [];
            let all_recoveries: number[] = [];
            let all_cases: number[] = [];

            Object.values(trends).forEach((days) => {
                days.forEach((d) => {
                    if (
                        d.new_deaths < 0 ||
                        d.new_recoveries < 0 ||
                        d.new_case < 0
                    ) {
                        console.log('negative count ', d);
                    }
                    all_deaths.push(d.new_deaths);
                    all_recoveries.push(d.new_recoveries);
                    all_cases.push(d.new_case);
                });
            });
            setRange({
                death: extent(all_deaths),
                recoveries: extent(all_recoveries),
                cases: extent(all_cases),
            });
        }
    }, [trends, per100k, isLog]);
    return range;
};
