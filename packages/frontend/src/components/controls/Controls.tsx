import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import TopControl from './TopControl';
import TypeControl from './TypeControl';
import DateSlider, { DateSliderProps } from './DateSlider';
import DataSettings from './DataSettings';
import ViewSettings from './ViewSettings';
import { useUpdated } from '../../hooks/useUpdated';

const SMALL_TOGGLE_KEY = 'small_screen_toggle_key';
const getLocalToggle = () => localStorage.getItem(SMALL_TOGGLE_KEY) === 'true';
const updateLocalToggle = (value: string) =>
    localStorage.setItem(SMALL_TOGGLE_KEY, value);

const Controls = ({
    dates,
    selectedDate,
    onUpdate,
    lastNonPredictedDate,
}: DateSliderProps) => {
    const [showSmallToggle, setShowSmallToggle] = useState(getLocalToggle());
    const handleToggle = useCallback(() => {
        updateLocalToggle(showSmallToggle ? 'false' : 'true');
        setShowSmallToggle(!showSmallToggle);
    }, [showSmallToggle]);
    const { data } = useUpdated();

    return (
        <>
            <TopControl
                handleToggle={handleToggle}
                selectedToggle={showSmallToggle}
                lastUpdatedDate={data}
            />
            <BottomControl showToggle={showSmallToggle}>
                <SettingWrapper className="hide-large">
                    <DataSettings />
                    <ViewSettings />
                </SettingWrapper>

                <TypeControl />
                <DateSliderWrapper>
                    <DateSlider
                        dates={dates}
                        selectedDate={selectedDate}
                        onUpdate={onUpdate}
                        lastNonPredictedDate={lastNonPredictedDate}
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

const BottomControl = styled.div<{ showToggle: boolean }>`
    background-color: #f0f5ff;
    display: none;
    ${(props) => props.showToggle && 'display: block;'}
    @media (min-width: 768px) {
        display: flex;
    }
`;

const SettingWrapper = styled.div`
    padding: 10px 20px;
`;
