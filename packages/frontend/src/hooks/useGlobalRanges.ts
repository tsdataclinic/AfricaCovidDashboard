import { useState, useEffect, useContext } from 'react';
import { CountryTrends } from './useCountryTrends';
import StatsContext from '../contexts/StatsContext';

import * as d3 from 'd3';

export type GlobalRangeStats = {
    dailyScale: d3.ScaleQuantile<number>;
    dailyScaleLog: [number, number] & d3.ScaleQuantize<number>;
    cumulativeScale: [number, number] & d3.ScaleQuantize<number>;
    cumulativeScaleLog: [number, number] & d3.ScaleQuantize<number>;
};
export type GlobalRange = { [index: string]: GlobalRangeStats };

const createScales = (data: number[], cumulativeData: number[]) => {
    let zeroFilteredData = data.filter((d) => d > 0);
    let zeroFilteredLogData = zeroFilteredData.map((d) => Math.log10(d));
    let zeroFilteredCumulativeData = cumulativeData.filter((d) => d > 0);
    let zeroFilteredCumulativeLogData = zeroFilteredCumulativeData.map((d) =>
        Math.log10(d)
    );

    return {
        dailyScale: d3.scaleQuantile().domain(zeroFilteredData),
        // @ts-ignore
        dailyScaleLog: d3
            .scaleQuantize()
            .domain(d3.extent(zeroFilteredLogData)),
        // @ts-ignore
        cumulativeScale: d3
            .scaleQuantize()
            .domain(d3.extent(zeroFilteredCumulativeData)),
        // @ts-ignore
        cumulativeScaleLog: d3
            .scaleQuantize()
            .domain(d3.extent(zeroFilteredCumulativeLogData)),
    };
};

export const useGlobalRanges = (
    trends: CountryTrends | undefined,
    per100k: boolean,
    isLog: boolean
) => {
    const { allStats } = useContext(StatsContext);
    const [range, setRange] = useState<GlobalRange | undefined>(undefined);

    useEffect(() => {
        if (trends && allStats) {
            let all_deaths: number[] = [];
            let all_recoveries: number[] = [];
            let all_cases: number[] = [];

            let all_cumulative_deaths: number[] = [];
            let all_cumulative_recoveries: number[] = [];
            let all_cumulative_cases: number[] = [];

            Object.entries(trends).forEach(([iso, days]) => {
                days.forEach((d) => {
                    if (
                        d.new_deaths < 0 ||
                        d.new_recoveries < 0 ||
                        d.new_case < 0
                    ) {
                        // console.log('negative count ', d);
                    } else {
                        let pop = allStats[iso]?.population / 100000.0;
                        let deaths = d.new_deaths;
                        let recoveries = d.new_recoveries;
                        let cases = d.new_case;

                        let cumulative_deaths = d.deaths;
                        let cumulative_recoveries = d.recoveries;
                        let cumulative_cases = d.recoveries;

                        if (per100k) {
                            deaths = deaths / pop;
                            recoveries = recoveries / pop;
                            cases = cases / pop;
                            cumulative_deaths = deaths / pop;
                            cumulative_recoveries = cumulative_recoveries / pop;
                            cumulative_cases = cumulative_cases / pop;
                        }
                        if (!per100k || pop > 0) {
                            all_deaths.push(deaths);
                            all_recoveries.push(recoveries);
                            all_cases.push(cases);
                            all_cumulative_deaths.push(cumulative_deaths);
                            all_cumulative_recoveries.push(
                                cumulative_recoveries
                            );
                            all_cumulative_cases.push(cumulative_cases);
                        }
                    }
                });
            });
            setRange({
                deaths: createScales(all_deaths, all_cumulative_deaths),
                recoveries: createScales(
                    all_recoveries,
                    all_cumulative_recoveries
                ),
                confirmed: createScales(all_cases, all_cumulative_cases),
            });
        }
    }, [trends, per100k, isLog]);
    console.log('range is ', range);
    return range;
};
