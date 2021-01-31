import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { Button } from 'antd';
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons';
import styled from 'styled-components';
import { useResizeObserver } from '../hooks/useResizeObserver';
import * as d3 from 'd3';
import moment from 'moment';

const PLAY_SPEED = 100;
// Chart margins
const margin = { top: 15, right: 30, bottom: 25, left: 25 };
const formatter = d3.timeFormat('%m-%d');
var formatDate = d3.timeFormat('%m/%d/%y');
const height = 100;

interface DateSliderProps {
    onUpdate: (value: moment.Moment) => void;
    selectedDate?: moment.Moment;
    dates: Date[];
}

const DateSlider = ({ dates, selectedDate, onUpdate }: DateSliderProps) => {
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
            d3.select('.label').attr('x', xAxis(h)).text(formatDate(h));
        },
        [xAxis]
    );

    const drawChart = useCallback(() => {
        const svg = d3.select(sliderRef.current) as any;
        const tickNumber = Math.min(10, Math.round((width - 130) / 60));
        svg.attr('width', width).attr('height', height);
        svg.selectAll('.ticks').remove();
        svg.selectAll('.handle').remove();
        svg.selectAll('.label').remove();

        const slider = svg
            .select('.slider')
            .attr(
                'transform',
                'translate(' + margin.left * 2 + ',' + height / 2 + ')'
            );

        svg.select('.track')
            .attr('x1', xAxis.range()[0])
            .attr('x2', xAxis.range()[1]);

        svg.select('.track-inset')
            .attr('x1', xAxis.range()[0])
            .attr('x2', xAxis.range()[1]);

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

        slider
            .insert('g', '.track-overlay')
            .attr('class', 'ticks')
            .attr('transform', 'translate(0,' + 18 + ')')
            .selectAll('text')
            .data(xAxis.ticks(tickNumber))
            .enter()
            .append('text')
            .attr('x', xAxis)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .text(function (d: any) {
                return formatter(d);
            });

        slider
            .insert('circle', '.track-overlay')
            .attr('class', 'handle')
            .attr('r', 9);

        slider
            .append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .text(formatDate(startDate))
            .attr('transform', 'translate(0,' + -25 + ')');
    }, [xAxis, startDate, onUpdate, width]);

    useEffect(() => {
        drawChart();
    }, [drawChart]);

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
                    <line className="track-overlay" />
                </g>
            </svg>
            <ControlButton
                type="primary"
                shape="circle"
                icon={isMoving ? <PauseCircleFilled /> : <PlayCircleFilled />}
                onClick={() => handleClick(!isMoving)}
            />
        </Wrapper>
    );
};

export default DateSlider;

const ControlButton = styled(Button)`
    position: absolute;
    right: 10px;
    top: 30px;
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

    .track {
        stroke: #000;
        stroke-opacity: 0.3;
        stroke-width: 10px;
    }

    .track-inset {
        stroke: #dcdcdc;
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
        stroke: #000;
        stroke-opacity: 0.5;
        stroke-width: 1.25px;
    }
`;
