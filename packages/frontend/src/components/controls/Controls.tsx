import React from 'react';
import styled from 'styled-components';
import TopControl from './TopControl';
import TypeControl from './TypeControl';
import DateSlider, { DateSliderProps } from './DateSlider';
import DataSettings from './DataSettings';

const Controls = ({ dates, selectedDate, onUpdate }: DateSliderProps) => {
    return (
        <>
            <TopControl />
            <BottomControl>
                <DataSettingWrapper className="hide-large">
                    <DataSettings />
                </DataSettingWrapper>

                <TypeControl />
                <DateSliderWrapper>
                    <DateSlider
                        dates={dates}
                        selectedDate={selectedDate}
                        onUpdate={onUpdate}
                    />
                </DateSliderWrapper>
            </BottomControl>
        </>
    );
};

export default Controls;

const DateSliderWrapper = styled.div`
    width: 100%;
    @media (min-width: 768px) {
        width: calc(100% - 350px);
    }
`;

const BottomControl = styled.div`
    background-color: #f0f5ff;
    @media (min-width: 768px) {
        display: flex;
    }
`;

const DataSettingWrapper = styled.div`
    padding: 10px 20px;
`;
