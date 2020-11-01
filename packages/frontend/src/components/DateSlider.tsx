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
    const [currentValue, setCurrentValue] = useState<number>();
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
                        setCurrentValue(event.x);
                        update(xAxis.invert(currentValue ? currentValue : 0));
                    })
            );

        slider
            .insert('g', '.track-overlay')
            .attr('class', 'ticks')
            .attr('transform', 'translate(0,' + 18 + ')')
            .selectAll('text')
            .data(xAxis.ticks(10))
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
    }, [xAxis, startDate, update, currentValue, width]);

    useEffect(() => {
        drawChart();
    }, [drawChart]);

    useEffect(() => {
        const newDate = xAxis.invert(currentValue ? currentValue : 0);
        update(newDate);
        const initSelectedDate = !selectedDate && currentValue !== undefined;
        const updateSelectedDate =
            selectedDate && !selectedDate.isSame(newDate, 'day');
        if (updateSelectedDate || initSelectedDate) {
            onUpdate(moment(newDate));
        }
    }, [xAxis, currentValue, selectedDate, onUpdate, update]);

    useEffect(() => {
        // init the start date to be the latest one
        const lastDate = moment(dates[dates.length - 1]);

        if (currentValue === undefined && xAxis(lastDate) >= 0) {
            setCurrentValue(xAxis(lastDate));
        }
    }, [selectedDate, currentValue, xAxis, dates]);

    useEffect(() => {
        return () => clearInterval(timer.current);
    }, []);

    const handleClick = useCallback(
        (moving: boolean) => {
            const step = () => {
                setCurrentValue((prev) => {
                    const newValue =
                        (prev ? prev : 0) + targetValue / dates.length;
                    const isSameDay = moment(xAxis.invert(prev || 0)).isSame(
                        xAxis.invert(newValue),
                        'day'
                    );
                    if (isSameDay || newValue > targetValue) {
                        // Stop play when reach end
                        setIsMoving(false);
                        if (timer.current) {
                            clearInterval(timer.current);
                        }
                        return 0;
                    }
                    return newValue;
                });
            };

            setIsMoving(moving);
            clearInterval(timer.current);
            if (moving) {
                timer.current = setInterval(step, 300);
            }
        },
        [targetValue, dates, xAxis]
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
        cursor: crosshair;
    }

    .handle {
        fill: #fff;
        stroke: #000;
        stroke-opacity: 0.5;
        stroke-width: 1.25px;
    }
`;