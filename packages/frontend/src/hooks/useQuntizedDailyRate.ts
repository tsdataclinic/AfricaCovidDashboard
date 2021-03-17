import { useState, useEffect, useContext } from 'react';
import { CountryTrends } from './useCountryTrends';
import StatsContext from '../contexts/StatsContext';

import * as d3 from 'd3';

export type DataRangeStats = {
    quantiles: d3.ScaleQuantile<number>;
    logExtent: [number, number];
};
export type DailyRange = { [index: string]: DataRangeStats };

export const useQuantizedDailyRate = (
    trends: CountryTrends | undefined,
    per100k: boolean,
    isLog: boolean
) => {
    const { allStats } = useContext(StatsContext);
    const [range, setRange] = useState<DailyRange | undefined>(undefined);

    useEffect(() => {
        if (trends && allStats) {
            let all_deaths: number[] = [];
            let all_recoveries: number[] = [];
            let all_cases: number[] = [];

            Object.entries(trends).forEach(([iso, days]) => {
                days.forEach((d) => {
                    if (
                        d.new_deaths < 0 ||
                        d.new_recoveries < 0 ||
                        d.new_case < 0
                    ) {
                        // console.log('negative count ', d);
                    } else {
                        let pop = allStats[iso]?.population;
                        let deaths = d.new_deaths;
                        let recoveries = d.new_recoveries;
                        let cases = d.new_case;

                        if (per100k) {
                            deaths = deaths / pop;
                            recoveries = recoveries / pop;
                            cases = cases / pop;
                        }
                        if (!per100k || pop > 0) {
                            all_deaths.push(deaths);
                            all_recoveries.push(recoveries);
                            all_cases.push(cases);
                        }
                    }
                });
            });
            setRange({
                deaths: {
                    quantiles: d3
                        .scaleQuantile()
                        .domain(all_deaths.filter((d) => d > 0)),
                    logExtent: d3.extent(all_deaths.filter((d) => d > 0)) as [
                        number,
                        number
                    ],
                },
                recoveries: {
                    quantiles: d3
                        .scaleQuantile()
                        .domain(all_recoveries.filter((d) => d > 0)),
                    logExtent: d3.extent(
                        all_recoveries.filter((d) => d > 0)
                    ) as [number, number],
                },
                confirmed: {
                    quantiles: d3
                        .scaleQuantile()
                        .domain(all_cases.filter((d) => d > 0)),
                    logExtent: d3.extent(all_cases.filter((d) => d > 0)) as [
                        number,
                        number
                    ],
                },
            });
        }
    }, [trends, per100k, isLog]);
    console.log('range is ', range);
    return range;
};