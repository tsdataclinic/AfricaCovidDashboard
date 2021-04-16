import React, { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { Category, DataType } from '../../types';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { GlobalRange } from '../../hooks/useGlobalRanges';
import { useGLLayers } from '../../hooks/useGLLayers';
import { defaultMaxListeners } from 'stream';
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
    dailyRange?: GlobalRange;
}

const INITIAL_VIEW_STATE = {
    longitude: 20.890111835079598,
    latitude: 5.590997915397574,
    zoom: 2.6677604216415842,
    pitch: 0,
    bearing: 0,
};

export const AfricaMap: React.FC<AfrticaMapProps> = ({
    selectedCountry,
    onCountrySelect,
    category,
    dataType,
    trendData,
    dailyRange,
    isLog,
    per100k,
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

    const layers = useGLLayers(
        mapData,
        selectedCountry,
        trendData,
        isPrediction,
        dataType,
        category,
        per100k,
        isLog,
        dailyRange
    );

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
            onDragEnd={(data) => {
                console.log('drag end data ', data);
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
