import React, { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { Category, DataType } from '../../types';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { GlobalRange } from '../../hooks/useGlobalRanges';
import { useGLLayers } from '../../hooks/useGLLayers';
import { useScaledData } from '../../hooks/useScaledData';
import { useColorScale } from '../../hooks/useColorScale';
import { Legend } from './Legend';
import { ToolTip } from './ToolTip';
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
    longitude: 18.732386,
    latitude: -3.7277997,
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
    selectedRegion,
    per100k,
    isRegion,
}) => {
    const [mapData, setMapData] = useState<any>(null);
    const [regionGeo, setRegionGeo] = useState<any>(null);

    const [hoverInfo, setHoverInfo] = useState<any>(null);

    useEffect(() => {
        fetch('/africa.geojson')
            .then((r) => r.json())
            .then((result) => setMapData(result));
    }, []);

    useEffect(() => {
        fetch('/regions.geojson')
            .then((r) => r.json())
            .then((result) => setRegionGeo(result));
    }, []);
    const isPrediction = Object.keys(trendData || {}).find(
        (key) => trendData?.[key].isPrediction
    );

    const scaledData = useScaledData(trendData, per100k);

    let { colorScale, colors, bins } = useColorScale(
        dataType,
        category,
        per100k,
        isLog,
        dailyRange
    );

    const layers = useGLLayers(
        mapData,
        regionGeo,
        selectedCountry,
        selectedRegion,
        isRegion,
        scaledData,
        isPrediction,
        dataType,
        category,
        per100k,
        colorScale,
        (hoverInfo: any) => {
            console.log('Hover info ', hoverInfo);
            setHoverInfo(hoverInfo);
        }
    );

    let legendHeader = dataType === 'daily' ? 'Daily ' : 'Cumulative ';
    legendHeader =
        legendHeader +
        (category === 'confirmed' ? 'new cases' : category) +
        (per100k ? ' per 100k people' : '');

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
            {hoverInfo && hoverInfo.object && (
                <ToolTip
                    county={hoverInfo.object.properties.iso3}
                    countryProperties={hoverInfo.object.properties}
                    isPer100k={per100k}
                    isPrediction={isPrediction}
                    x={hoverInfo.x}
                    y={hoverInfo.y}
                    trendData={scaledData[hoverInfo.object.properties.iso3]}
                />
            )}
            <Legend
                header={legendHeader}
                colorScale={colorScale}
                colors={colors}
                bins={bins}
            />
        </DeckGL>
    );
};
