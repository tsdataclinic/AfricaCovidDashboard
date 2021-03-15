import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons';
import styled from 'styled-components';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import * as d3 from 'd3';
import moment, { Moment } from 'moment';
import { formatDay, formatMonth } from '../../utils/trendUtils';
import { WHITE } from '../../colors';

const PLAY_SPEED = 100;
// Chart margins
const margin = { top: 5, right: 5, bottom: 5, left: 25 };
const height = 60;

export interface DateSliderProps {
    onUpdate: (value: moment.Moment) => void;
    selectedDate?: moment.Moment;
    dates: Date[];
    lastNonPredictedDate?: Moment;
}

const DateSlider = ({
    dates,
    selectedDate,
    onUpdate,
    lastNonPredictedDate,
}: DateSliderProps) => {
    const [isMoving, setIsMoving] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const dimensions = useResizeObserver(wrapperRef) || { width: 0, height: 0 };
    const sliderRef = useRef<SVGSVGElement | null>();
    const timer = useRef<number>();
    const startDate = dates[0] || new Date();

    const endDate = dates[dates.length - 1] || new Date();
    const { width } = dimensions || wrapperRef.current?.getBoundingClientRect();

    const targetValue = width - margin.right;
    const xAxis = useMemo(
        () =>
            d3
                .scaleTime()
                .domain([startDate, endDate])
                .range([0, targetValue - margin.left * 4])
                .clamp(true),
        [startDate, endDate, targetValue]
    );

    const update = useCallback(
        (h: Date) => {
            // update position and text of label according to slider scale
            d3.select('.handle').attr('cx', xAxis(h));
            d3.select('.label').attr('x', xAxis(h)).text(formatDay(h));
        },
        [xAxis]
    );

    useEffect(() => {
        const drawChart = () => {
            const svg = d3.select(sliderRef.current) as any;
            const tickNumber = Math.min(10, Math.round((width - 130) / 70));

            svg.attr('width', width).attr('height', height);
            svg.selectAll('.ticks').remove();
            svg.selectAll('.handle').remove();
            svg.selectAll('.label').remove();
            svg.selectAll('.circle-ticks').remove();

            const slider = svg
                .select('.slider')
                .attr(
                    'transform',
                    'translate(' + margin.left + ',' + height / 2 + ')'
                );

            svg.select('.track')
                .attr('x1', xAxis.range()[0])
                .attr('x2', xAxis.range()[1]);

            svg.select('.track-inset')
                .attr('x1', xAxis.range()[0])
                .attr('x2', xAxis.range()[1]);

            slider
                .insert('g', '.track-overlay')
                .attr('class', 'ticks')
                .attr('transform', 'translate(0,' + 10 + ')')
                .selectAll('text')
                .data(xAxis.ticks(tickNumber))
                .enter()
                .append('text')
                .attr('x', xAxis)
                .attr('y', 10)
                .attr('text-anchor', 'middle')
                .text(function (d: any) {
                    return formatMonth(d);
                });

            slider

                .insert('g', '.track-overlay')
                .attr('class', 'circle-ticks')
                .selectAll('circle')
                .data(xAxis.ticks(tickNumber))
                .enter()
                .append('circle')
                .attr('cx', xAxis)
                .attr('cy', 0)
                .attr('r', 6)
                .attr('fill', WHITE)
                .attr('stroke', '#ADC6FF');

            slider
                .insert('circle', '.track-overlay')
                .attr('class', 'handle')
                .attr('r', 6);

            slider
                .append('text')
                .attr('class', 'label')
                .attr('text-anchor', 'middle')
                .attr('fill', '#0050B3')
                .text(formatDay(startDate))
                .attr('transform', 'translate(0,' + -15 + ')');

            // Has predicted data
            if (
                lastNonPredictedDate &&
                lastNonPredictedDate.isBefore(endDate, 'day')
            ) {
                svg.selectAll('.circle-ticks circle')
                    .filter(function (d: any) {
                        // find tickers that are predicted time
                        return lastNonPredictedDate.isBefore(d, 'day');
                    })
                    .attr('class', 'predicted-tick')
                    .attr('stroke-dasharray', 1);

                const startPosition = xAxis(lastNonPredictedDate.toDate());
                svg.select('.track-predicted')
                    .attr('x', startPosition)
                    .attr('width', xAxis.range()[1] - startPosition + 4)
                    .attr('transform', 'translate(0,' + -5 + ')');
            }
        };
        drawChart();
    }, [xAxis, startDate, width, lastNonPredictedDate, endDate]);

    // Control the postion of the selected circle
    useEffect(() => {
        const svg = d3.select(sliderRef.current) as any;
        const slider = svg.select('.slider');

        svg.select('.track-overlay')
            .attr('x1', xAxis.range()[0])
            .attr('x2', xAxis.range()[1])
            .call(
                d3
                    .drag()
                    .on('start.interrupt', function () {
                        slider.interrupt();
                    })
                    .on('start drag', function (event: any) {
                        const date = xAxis.invert(event.x ? event.x : 0);
                        onUpdate(moment(date));
                    })
            );
    }, [xAxis, onUpdate]);

    useEffect(() => {
        if (!selectedDate) {
            return;
        }
        update(selectedDate.toDate());
    }, [update, selectedDate]);

    useEffect(() => {
        if (dates.length === 0 || !dates[0]) {
            return;
        }

        const lastDate = moment(dates[dates.length - 1]);
        if (selectedDate === undefined) {
            // init the start date to be the latest one
            if (xAxis(lastDate) >= 0) {
                onUpdate(lastDate);
            }
            return;
        }

        if (selectedDate.isAfter(lastDate, 'day')) {
            onUpdate(lastDate);
            return;
        }

        if (selectedDate.isBefore(dates[0], 'day')) {
            onUpdate(moment(dates[0]));
        }
    }, [xAxis, dates, onUpdate, selectedDate]);

    useEffect(() => {
        return () => clearInterval(timer.current);
    }, []);

    const handleClick = useCallback(
        (moving: boolean) => {
            const step = () => {
                if (!selectedDate || !dates || !dates[0]) {
                    return;
                }
                const lastDate = dates[dates.length - 1];
                const nextDate = selectedDate.add(1, 'day');
                if (nextDate.isAfter(lastDate)) {
                    // Stop play when reach end
                    setIsMoving(false);
                    if (timer.current) {
                        clearInterval(timer.current);
                    }
                    onUpdate(moment(dates[0]));
                } else {
                    onUpdate(nextDate);
                }
            };

            setIsMoving(moving);
            clearInterval(timer.current);
            if (moving) {
                timer.current = setInterval(step, PLAY_SPEED);
            }
        },
        [dates, onUpdate, selectedDate]
    );

    return (
        <Wrapper ref={wrapperRef}>
            <svg
                ref={(element) => {
                    sliderRef.current = element;
                }}
            >
                <g className="slider">
                    <line className="track" />
                    <line className="track-inset" />
                    <rect className="track-predicted" rx="5" height="10" />
                    <line className="track-overlay" />
                </g>
            </svg>
            <ControlButton>
                {isMoving ? (
                    <PauseCircleFilled onClick={() => handleClick(false)} />
                ) : (
                    <PlayCircleFilled onClick={() => handleClick(true)} />
                )}
            </ControlButton>
        </Wrapper>
    );
};

export default DateSlider;

const ControlButton = styled.div`
    position: absolute;
    right: 10px;
    top: 5px;
    color: #096dd9;
    font-size: 30px;
    :hover {
        opacity: 0.8;
    }
`;

const Wrapper = styled.div`
    position: relative;
    .ticks {
        font-size: 10px;
    }

    .track,
    .track-inset,
    .track-overlay {
        stroke-linecap: round;
    }

    .track-predicted {
        stroke: #adc6ff;
        stroke-width: 2px;
        stroke-dasharray: 1;
        fill: #fff;
    }

    .track {
        stroke: #000;
        stroke-opacity: 0.3;
        stroke-width: 10px;
    }

    .track-inset {
        stroke: #adc6ff;
        stroke-width: 8px;
    }

    .track-overlay {
        pointer-events: stroke;
        stroke-width: 50px;
        stroke: transparent;
        cursor: pointer;
    }

    .handle {
        fill: #fff;
        stroke: #096dd9;
        stroke-width: 5px;
    }

    .label {
        font-size: 12px;
    }
`;
