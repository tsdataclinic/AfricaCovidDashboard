import { useMemo } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Category, DataType } from '../types';
import { CountryTrend } from './useCountryTrends';
import { GlobalRange } from './useGlobalRanges';

const getTrendKey = (
    category: Category,
    dataType: DataType,
    isPrediction: boolean
) => {
    let trendKey: keyof CountryTrend = 'confirmed';
    if (dataType === 'daily') {
        if (category === 'confirmed') {
            trendKey = isPrediction ? 'daily_prediction' : 'new_case';
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

// const regionMap={
//     "Western Africa":,
//     "Northen Africa":,
//     "Southern Africa":,
//     "Cenrtal Africa":,
//     "Eastern Africa":
// }

export const useGLLayers = (
    mapData: any,
    regions: any,
    selectedCountry: string | undefined,
    selectedRegion: string | undefined,
    isRegion: boolean,
    scaledData: { [k in string]: CountryTrend } | undefined,
    isPrediction: boolean,
    dataType: DataType,
    category: Category,
    per100k: boolean,
    colorScale: any,
    onHover: (info: any) => void
) => {
    const layers = useMemo(() => {
        let trendKey = getTrendKey(category, dataType, isPrediction);
        let layers = [];
        if (mapData) {
            layers.push(
                new GeoJsonLayer({
                    id: 'countries',
                    getFillColor: (f: any) => {
                        let datum = scaledData
                            ? scaledData[f.properties.iso3 as string]
                            : null;
                        let col = colorScale(datum, trendKey);
                        let opacity = 200;
                        if (
                            selectedCountry &&
                            f.properties.iso3 !== selectedCountry
                        ) {
                            opacity = 150;
                        }
                        return [col[0], col[1], col[2], opacity];
                    },
                    getLineColor: [200, 200, 200, 255],
                    stroked: true,
                    pickable: true,
                    data: mapData,
                    getLineWidth: 1,
                    lineWidthUnits: 'pixels',
                    onHover: onHover,
                    updateTriggers: {
                        getLineColor: [selectedCountry, colorScale, per100k],
                        getPosition: [selectedCountry],
                        getFillColor: [selectedCountry, colorScale, per100k],
                    },
                    dataComparator: () => false,
                })
            );
            layers.push(
                new GeoJsonLayer({
                    id: 'selected country border',
                    data: mapData,
                    getLineWidth: 1,
                    lineWidthUnits: 'pixels',
                    filled: false,
                    stroked: true,
                    getLineColor: (f) =>
                        f.properties.iso3 === selectedCountry && !isRegion
                            ? [0, 0, 0, 255]
                            : [255, 0, 0, 0],
                    updateTriggers: {
                        getLineColor: [selectedCountry, isRegion],
                    },
                })
            );
        }

        if (regions) {
            layers.push(
                new GeoJsonLayer({
                    id: 'region',
                    data: regions,
                    getLineWidth: 2,
                    lineWidthUnits: 'pixels',
                    filled: false,
                    stroked: true,
                    getLineColor: (f) =>
                        f.properties.region === selectedRegion && isRegion
                            ? [0, 0, 0, 255]
                            : [255, 0, 0, 0],
                    updateTriggers: {
                        getLineColor: [selectedRegion, isRegion],
                    },
                })
            );
        }
        return layers;
    }, [
        mapData,
        regions,
        selectedCountry,
        selectedRegion,
        isRegion,
        scaledData,
        colorScale,
        isPrediction,
        per100k,
    ]);
    return layers;
};
