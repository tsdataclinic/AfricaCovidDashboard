import { useRef, useContext, useState } from 'react';
import QueryParamsContext from '../contexts/QueryParamsContext';
import useInterval from '@use-it/interval';

export const usePlaybackControlls = () => {
    const { updateQuery, selectedDate } = useContext(QueryParamsContext);
    const [playing, setPlaying] = useState(false);

    const startPlaying = () => {
        setPlaying(true);
    };

    const stopPlaying = () => {
        setPlaying(false);
    };

    const togglePlaying = () => {
        setPlaying(!playing);
    };

    useInterval(
        () => {
            updateQuery('selectedDate', selectedDate!.add(1, 'day'));
        },
        playing ? 100 : null
    );

    return { startPlaying, stopPlaying, togglePlaying, playing };
};
