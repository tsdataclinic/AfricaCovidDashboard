import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';

interface AfrticaMapProps {}

const INITIAL_VIEW_STATE = {
    longitude: 32.58252,
    latitude: 0.347596,
    zoom: 2,
    pitch: 0,
    bearing: 0,
};

export const AfricaMap: React.FC<AfrticaMapProps> = ({}) => {
    return (
        <DeckGL
            width="100%"
            height="100%"
            controller={true}
            layers={[]}
            initialViewState={INITIAL_VIEW_STATE}
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
