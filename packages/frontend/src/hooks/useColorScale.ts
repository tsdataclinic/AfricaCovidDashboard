import { rgba } from 'polished';
import { useCallback, useMemo } from 'react';
import { Category, DataType } from '../types';
import { CountryTrend } from './useCountryTrends';
import { GlobalRange } from './useGlobalRanges';
import chroma from 'chroma-js';

export const mapColors = {
    confirmed: [
        '#ffffcc',
        '#ffeda0',
        '#fed976',
        '#feb24c',
        '#fd8d3c',
        '#fc4e2a',
        '#e31a1c',
        '#bd0026',
        '#800026',
    ].map((c) => chroma(c).rgba()),
    recoveries: [
        '#f7fbff',
        '#deebf7',
        '#c6dbef',
        '#9ecae1',
        '#6baed6',
        '#4292c6',
        '#2171b5',
        '#08519c',
        '#08306b',
    ].map((c) => chroma(c).rgba()),
    deaths: [
        '#fcfbfd',
        '#efedf5',
        '#dadaeb',
        '#bcbddc',
        '#9e9ac8',
        '#807dba',
        '#6a51a3',
        '#54278f',
        '#3f007d',
    ].map((c) => chroma(c).rgba()),
};

export const useColorScale = (
    dataType: DataType,
    category: Category,
    per100k: boolean,
    isLog: boolean,
    dailyRange: GlobalRange | undefined
) => {
    let { scale, bins, colors } = useMemo(() => {
        if (dailyRange) {
            let colors = mapColors[category];
            let categoryScale = dailyRange[category as string];

            let colorScale: any = null;

            if (dataType == 'daily' && categoryScale) {
                if (isLog) {
                    colorScale = categoryScale.dailyScaleLog;
                } else {
                    colorScale = categoryScale.dailyScale;
                }
            } else {
                if (isLog) {
                    colorScale = categoryScale.cumulativeScaleLog;
                } else {
                    colorScale = categoryScale.cumulativeScale;
                }
            }

            colorScale.range(colors);
            let bins: number[] = [];

            if (isLog || dataType == 'cumulative') {
                bins = colorScale.thresholds();
                if (isLog) {
                    bins.map((t: number) => Math.pow(10, t));
                }
            } else {
                bins = colorScale.quantiles();
            }

            return { scale: colorScale, bins, colors };
        } else {
            return { scale: () => [200, 200, 200, 255], bins: [], colors: [] };
        }
    }, [per100k, category, dataType, isLog, dailyRange]);

    let colorScale = useCallback(
        (
            datum: CountryTrend | null,
            trendKey: string
        ): [number, number, number, number] => {
            if (!datum) {
                return [200, 200, 200, 255];
            }
            //@ts-ignore
            let v = datum[trendKey] as number;
            if (isLog) {
                v = Math.log(v);
            }
            if (v === 0) {
                return [255, 255, 255, 255];
            } else {
                return scale(v);
            }
        },
        [scale, isLog]
    );

    return { colorScale, bins, colors };
};
