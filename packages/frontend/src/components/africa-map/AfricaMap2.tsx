import React, { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { Category, DataType } from '../../types';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { GeoJsonLayer } from '@deck.gl/layers';
import { select } from 'd3-selection';
// import { FillStyleExtension } from '@deck.gl/extensions';

interface AfrticaMapProps {
    category: Category;
    dataType: DataType;
    selectedCountry?: string;
    selectedRegion?: string;
    isRegion: boolean;
    onRegionSelect?: (region: string) => void;
    onCountrySelect?: (country: string) => void;
    trendData?: { [k in string]: CountryTrend }; // Data should be a map of country A3 to trend datum
    loading?: boolean;
    isLog: boolean;
    per100k: boolean;
}

const INITIAL_VIEW_STATE = {
    longitude: 32.58252,
    latitude: 0.347596,
    zoom: 2,
    pitch: 0,
    bearing: 0,
};

export const AfricaMap: React.FC<AfrticaMapProps> = ({
    selectedCountry,
    onCountrySelect,
    category,
    dataType,
    trendData,
}) => {
    const [mapData, setMapData] = useState<any>(null);

    useEffect(() => {
        fetch('/africa.geojson')
            .then((r) => r.json())
            .then((result) => setMapData(result));
    }, []);

    const isPrediction = Object.keys(trendData || {}).find(
        (key) => trendData?.[key].isPrediction
    );

    const trendKey = useMemo(() => {
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
    }, [category, dataType, isPrediction]);

    const layers = useMemo(
        () => [
            new GeoJsonLayer({
                id: 'countries',
                getFillColor: (f: any) => [
                    288,
                    125,
                    96,
                    f.properties.iso3 === selectedCountry ? 200 : 100,
                ],
                getLineColor: (f: any) => {
                    console.log('features are ', f, ' ', f.properties.iso3);
                    return f.properties.iso3 == selectedCountry
                        ? [255, 0, 0, 255]
                        : [255, 255, 255, 255];
                },
                stroked: true,
                pickable: true,
                data: mapData,
                getLineWidth: 1,
                lineWidthUnits: 'pixels',
                getPosition: (f) => {
                    const z = f.properties.iso3 === selectedCountry ? 20 : 0;
                    return [...f.geometry.coordinates, z];
                },
                updateTriggers: {
                    getLineColor: [selectedCountry],
                    getPosition: [selectedCountry],
                    getFillColor: [selectedCountry],
                },
                // //@ts-ignore
                // fillPatternMask: true,
                // fillPatternAtlas:
                //     'https://raw.githubusercontent.com/visgl/deck.gl/master/examples/layer-browser/data/pattern.png',
                // fillPatternMapping:
                //     'https://raw.githubusercontent.com/visgl/deck.gl/master/examples/layer-browser/data/pattern.json',
                // extensions: [new FillStyleExtension({ pattern: true })],
                // getFillPattern: 'hatch-cross',
                // getFillPatternScale: 500,
                // getFillPatternOffset: [0, 0],
            }),
        ],
        [mapData, selectedCountry]
    );

    console.log('layers are ', layers);
    return (
        <DeckGL
            width="100%"
            height="100%"
            controller={true}
            layers={layers}
            initialViewState={INITIAL_VIEW_STATE}
            onHover={(info: any) => {}}
            onClick={(info: any) => {
                onCountrySelect(
                    info.object ? info.object.properties.iso3 : null
                );
            }}
        >
            <StaticMap
                mapboxApiAccessToken={
                    'pk.eyJ1Ijoic3R1YXJ0LWx5bm4iLCJhIjoiY2tua2Zob293MDh6YjJ1cHU3Y2t0cmhlMiJ9.emy07UbMMy0nLUxrfCfTEQ'
                }
                width={'100%'}
                height={'100%'}
                mapStyle="mapbox://styles/mapbox/light-v10"
            />
        </DeckGL>
    );
};
