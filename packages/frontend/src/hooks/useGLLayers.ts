import { useState, useEffect, useMemo } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Category, DataType } from '../types';
import { CountryTrend } from './useCountryTrends';
import { useScaledData } from './useScaledData';
import { useColorScale } from './useColorScale';
import { GlobalRange } from './useGlobalRanges';
import { select } from 'd3-selection';

const getTrendKey = (
    category: Category,
    dataType: DataType,
    isPrediction: boolean
) => {
    let trendKey: keyof CountryTrend = 'confirmed';
    if (dataType === 'daily') {
        if (category === 'confirmed') {
            trendKey = 'new_case';
        } else if (category === 'recoveries') {
            trendKey = 'new_recoveries';
        } else if (category === 'deaths') {
            trendKey = 'new_deaths';
        }
    } else {
        if (category === 'confirmed') {
            trendKey = isPrediction ? 'confirmed_prediction' : 'confirmed';
        } else if (category === 'recoveries') {
            trendKey = 'recoveries';
        } else if (category === 'deaths') {
            trendKey = 'deaths';
        }
    }
    return trendKey;
};

export const useGLLayers = (
    mapData: any,
    selectedCountry: string | undefined,
    trendData: { [k in string]: CountryTrend } | undefined,
    isPrediction: boolean,
    dataType: DataType,
    category: Category,
    per100k: boolean,
    isLog: boolean,
    dailyRange: GlobalRange
) => {
    let scaledData = useScaledData(trendData, per100k);
    let colorScale = useColorScale(
        dataType,
        category,
        per100k,
        isLog,
        dailyRange
    );

    const layers = useMemo(() => {
        let trendKey = getTrendKey(category, dataType, isPrediction);

        return [
            new GeoJsonLayer({
                id: 'countries',
                getFillColor: (f: any) => {
                    let datum = scaledData
                        ? scaledData[f.properties.iso3 as string]
                        : null;
                    let col = colorScale(datum, trendKey);
                    let opacity = 240;
                    if (
                        selectedCountry &&
                        f.properties.iso3 !== selectedCountry
                    ) {
                        opacity = 150;
                    }
                    return [col[0], col[1], col[2], opacity];
                },
                getLineColor: [255, 255, 255, 255],
                stroked: true,
                pickable: true,
                data: mapData,
                getLineWidth: 1,
                lineWidthUnits: 'pixels',
                updateTriggers: {
                    getLineColor: [selectedCountry, colorScale, per100k],
                    getPosition: [selectedCountry],
                    getFillColor: [selectedCountry, colorScale, per100k],
                },
                dataComparator: () => false,
            }),
            new GeoJsonLayer({
                id: 'selected country border',
                data: mapData,
                getLineWidth: 1,
                lineWidthUnits: 'pixels',
                filled: false,
                stroked: true,
                getLineColor: (f) =>
                    f.properties.iso3 === selectedCountry
                        ? [0, 0, 0, 255]
                        : [255, 0, 0, 0],
                updateTriggers: {
                    getLineColor: [selectedCountry],
                },
            }),
        ];
    }, [mapData, selectedCountry, scaledData, colorScale, per100k]);
    return layers;
};
