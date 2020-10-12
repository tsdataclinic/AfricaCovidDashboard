import { D3_TRANSITION_DURATION } from '../constants';
import { useResizeObserver } from '../hooks/useResizeObserver';
import {
    abbreviateNumber,
    findTrendData,
    formatDateToStr,
    getCategories,
    getColor,
    getStatistic,
} from '../helper';
import styled from 'styled-components';
import { bisector, max, min } from 'd3-array';
import { axisBottom, AxisDomain, axisRight, AxisScale } from 'd3-axis';
import { scaleLinear, scaleLog, scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';
import { pointer, select } from 'd3-selection';
import { curveMonotoneX, line } from 'd3-shape';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Category, DataType, StatsBarItem } from '../types';
import { GREEN, GREY, RED } from '../colors';
import { CountryTrend } from '../hooks/useCountryTrends';

// Chart margins
const margin = { top: 15, right: 35, bottom: 25, left: 25 };
const formatter = timeFormat('%m-%d');

interface TimeseriesProps {
    timeseries: CountryTrend[];
    dates: Date[];
    dataType: DataType;
    isLog: boolean;
}

const Timeseries = ({
    timeseries,
    dates,
    dataType,
    isLog,
}: TimeseriesProps) => {
    const refs = useRef<(SVGSVGElement | null)[]>([]);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const dimensions = useResizeObserver(wrapperRef) || { width: 0, height: 0 };

    const [highlightedDate, setHighlightedDate] = useState(
        dates[dates.length - 1]
    );

    const categories: StatsBarItem[] = useMemo(() => getCategories(dataType), [
        dataType,
    ]);

    useEffect(() => {
        setHighlightedDate(dates[dates.length - 1]);
    }, [dates]);

    const getBarWidth = useCallback(() => {
        const T = dates.length;
        // Dimensions
        const { width } =
            dimensions || wrapperRef.current?.getBoundingClientRect();
        // Chart extremes
        const chartRight = width - margin.right;
        // Bar widths
        const axisWidth = chartRight - margin.left;
        return Math.min(4, axisWidth / (1.25 * T));
    }, [dates.length, dimensions]);

    useEffect(() => {
        const T = dates.length;
        // Dimensions
        const { width, height } =
            dimensions || wrapperRef.current?.getBoundingClientRect();
        // Chart extremes
        const chartRight = width - margin.right;
        const chartBottom = height - margin.bottom;
        const barWidth = getBarWidth();

        // Buffer space along y-axis
        const yBufferTop = 1.2;
        const yBufferBottom = 1.1;

        const xScale = scaleTime()
            .clamp(true)
            .domain(T ? [dates[0], dates[T - 1]] : [])
            .range([margin.left, chartRight]);

        // Number of x-axis ticks
        const numTicksX = width < 480 ? 4 : 7;

        const xAxis = (g: any) =>
            g.attr('class', 'x-axis').call(
                axisBottom(xScale)
                    .ticks(numTicksX)
                    .tickFormat((date) => formatter(date as Date))
            );

        const xAxis2 = (g: any, yScale: AxisScale<AxisDomain>) => {
            g.attr('class', 'x-axis2')
                .call(axisBottom(xScale).tickValues([]).tickSize(0))
                .select('.domain')
                .style('transform', `translateY(${yScale(0)}px)`);

            if (yScale(0) !== chartBottom)
                g.select('.domain').attr('opacity', 0.4);
            else g.select('.domain').attr('opacity', 0);
        };

        const yAxis = (g: any, yScale: AxisScale<number>) =>
            g.attr('class', 'y-axis').call(
                axisRight(yScale)
                    .ticks(4)
                    .tickFormat((num) => abbreviateNumber(num))
                    .tickPadding(4)
            );

        const generateYScale = (category: Category) => {
            if (isLog) {
                return scaleLog()
                    .clamp(true)
                    .domain([
                        Math.max(
                            1,
                            min(dates, (date) =>
                                getStatistic(
                                    findTrendData(timeseries, date),
                                    dataType,
                                    category
                                )
                            ) || 1
                        ),
                        Math.max(
                            10,
                            yBufferTop *
                                (max(dates, (date) =>
                                    getStatistic(
                                        findTrendData(timeseries, date),
                                        dataType,
                                        category
                                    )
                                ) || 1)
                        ),
                    ])
                    .nice()
                    .range([chartBottom, margin.top]);
            }

            const minNum =
                yBufferBottom *
                Math.min(
                    0,
                    min(dates, (date) =>
                        getStatistic(
                            findTrendData(timeseries, date),
                            dataType,
                            category
                        )
                    ) || 0
                );
            const maxNum = Math.max(
                1,
                yBufferTop *
                    (max(dates, (date) =>
                        getStatistic(
                            findTrendData(timeseries, date),
                            dataType,
                            category
                        )
                    ) || 0)
            );

            return scaleLinear()
                .clamp(true)
                .domain([minNum, maxNum])
                .nice(4)
                .range([chartBottom, margin.top]);
        };

        function mousemove(res: any) {
            const xm = pointer(res)[0];
            const date = xScale.invert(xm);
            if (date && dates.length > 0) {
                const bisectDate = bisector((date) => date).left;
                const index = bisectDate(dates, date, 1);
                const dateLeft = dates[index - 1];
                const dateRight = dates[index];
                setHighlightedDate(
                    date.valueOf() - dateLeft.valueOf() <
                        dateRight.valueOf() - date.valueOf()
                        ? dateLeft
                        : dateRight
                );
            }
        }

        function mouseout() {
            setHighlightedDate(dates[T - 1]);
        }

        /* Begin drawing charts */

        refs.current.forEach((ref, i) => {
            const svg = select(ref) as any;
            const t = svg.transition().duration(D3_TRANSITION_DURATION);

            const category = categories[i].category;
            const yScale = generateYScale(category);
            const color = getColor(category);

            /* X axis */
            svg.select('.x-axis')
                .style('transform', `translateY(${chartBottom}px)`)
                .transition(t)
                .call(xAxis);

            svg.select('.x-axis2').transition(t).call(xAxis2, yScale);

            /* Y axis */
            svg.select('.y-axis')
                .style('transform', `translateX(${chartRight}px)`)
                .transition(t)
                .call(yAxis, yScale);

            /* Path dots */
            const circles = svg
                .selectAll('circle')
                .data(dates, (date: Date) => date);

            circles.exit().style('fill-opacity', 0).remove();

            circles
                .enter()
                .append('circle')
                .attr('fill', color)
                .attr('stroke', color)
                .attr('cy', chartBottom)
                .attr('cx', (date: Date) => xScale(date))
                .attr('r', barWidth / 2)
                .merge(circles)
                .transition(t)
                .duration(200)
                .attr('cx', (date: Date) => xScale(date))
                .attr('cy', (date: Date) =>
                    yScale(
                        getStatistic(
                            findTrendData(timeseries, date),
                            dataType,
                            category
                        )
                    )
                );

            if (dataType === 'cumulative') {
                svg.selectAll('.stem')
                    .transition(t)
                    .attr('y1', yScale(0))
                    .attr('y2', yScale(0))
                    .remove();

                if (!dates.length) {
                    return;
                }
                const linePath = line()
                    .curve(curveMonotoneX)
                    .x((date) => xScale(date as any))
                    .y((date) =>
                        yScale(
                            getStatistic(
                                findTrendData(timeseries, date as any),
                                dataType,
                                category
                            )
                        )
                    );

                svg.selectAll('.trend')
                    .remove()
                    .data([dates])
                    .join(
                        (enter: any) =>
                            enter
                                .append('path')
                                .attr('class', 'trend')
                                .attr('fill', 'none')
                                .attr('stroke', color + '50')
                                .attr('stroke-width', 1)
                                .attr('d', linePath)
                                .call((enter: any) =>
                                    enter
                                        .attr('stroke-dashoffset', 1)
                                        .transition(t)
                                        .attr('stroke-dashoffset', 0)
                                ),
                        // TODO: fix the animations
                        (update: any) => update.attr('stroke-dasharray', null)
                        // .transition(t)
                        // .attrTween('d', function (
                        //     date: [number, number][]
                        // ) {
                        //     const previous = select('.trend').attr('d');
                        //     const current = linePath(date) || '';
                        //     return interpolatePath(previous, current);
                        // })
                    );
            } else {
                /* DAILY TRENDS */
                svg.selectAll('.trend').remove();

                svg.selectAll('.stem')
                    .data(dates, (date: Date) => date)
                    .join((enter: any) =>
                        enter
                            .append('line')
                            .attr('class', 'stem')
                            .attr('stroke-width', barWidth)
                            .attr('x1', (date: Date) => xScale(date))
                            .attr('y1', chartBottom)
                            .attr('x2', (date: Date) => xScale(date))
                            .attr('y2', chartBottom)
                    )
                    .transition(t)
                    .attr('stroke-width', barWidth)
                    .attr('x1', (date: Date) => xScale(date))
                    .attr('y1', yScale(0))
                    .attr('x2', (date: Date) => xScale(date))
                    .attr('y2', (date: Date) =>
                        yScale(
                            getStatistic(
                                findTrendData(timeseries, date),
                                dataType,
                                category
                            )
                        )
                    );
            }

            svg.selectAll('*').attr('pointer-events', 'none');
            svg.on('mousemove', mousemove)
                .on('touchmove', mousemove)
                .on('mouseout', mouseout)
                .on('touchend', mouseout);
        });
    }, [
        dataType,
        dimensions,
        getBarWidth,
        timeseries,
        dates,
        isLog,
        categories,
    ]);

    useEffect(() => {
        const barWidth = getBarWidth();
        refs.current.forEach((ref) => {
            const svg = select(ref);
            svg.selectAll('circle').attr('r', (date: any) =>
                date === highlightedDate ? barWidth : barWidth / 2
            );
        });
    }, [highlightedDate, getBarWidth]);

    const getStatisticDelta = useCallback(
        (category) => {
            if (!highlightedDate) return;
            const currCount = getStatistic(
                findTrendData(timeseries, highlightedDate),
                dataType,
                category
            );
            const prevDate =
                dates[dates.findIndex((date) => date === highlightedDate) - 1];

            const prevCount = getStatistic(
                findTrendData(timeseries, prevDate),
                dataType,
                category
            );
            return currCount - prevCount;
        },
        [timeseries, dates, highlightedDate, dataType]
    );

    const trail = useMemo(() => {
        const styles: any[] = [];

        [0, 0, 0, 0, 0].map((element, index) => {
            styles.push({
                animationDelay: `${index * 250}ms`,
            });
            return null;
        });
        return styles;
    }, []);

    return (
        <>
            <div className="Timeseries">
                {categories.map(({ category, label }, index) => {
                    const delta = getStatisticDelta(category);
                    const highlight = getStatistic(
                        findTrendData(timeseries, highlightedDate),
                        dataType,
                        category
                    );
                    return (
                        <Wrapper
                            key={category}
                            className={`svg-parent ${
                                index > 0 ? 'fadeInUp' : ''
                            } is-${category}`}
                            ref={wrapperRef}
                            style={trail[index]}
                        >
                            {highlightedDate && (
                                <div className={`stats is-${category}`}>
                                    <h5 className="title">{label}</h5>
                                    <h5 className="title">
                                        {formatDateToStr(highlightedDate)}
                                    </h5>
                                    <div className="stats-bottom">
                                        <h2>{highlight}</h2>
                                        <h6>
                                            {delta && delta > 0 ? '+' : ''}
                                            {delta}
                                        </h6>
                                    </div>
                                </div>
                            )}
                            <svg
                                ref={(element) => {
                                    refs.current[index] = element;
                                }}
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <g className="x-axis" />
                                <g className="x-axis2" />
                                <g className="y-axis" />
                            </svg>
                        </Wrapper>
                    );
                })}
            </div>
        </>
    );
};

export default Timeseries;

const Wrapper = styled.div`
    position: relative;
    align-self: center;
    background: rgba(255, 7, 58, 0.12);
    border-radius: 5px;
    display: flex;
    position: relative;
    width: 100%;
    height: 10rem;
    margin-bottom: 1rem;

    .stats {
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        left: 0.5rem;
        padding: 0.25rem;
        pointer-events: none;
        position: absolute;
        top: 0.5rem;
    }

    svg {
        width: 100%;
        path,
        .tick,
        line {
            stroke: ${RED};
        }
        text {
            opacity: 0.5;
        }
    }

    &.is-recoveries {
        background: rgba(40, 167, 69, 0.12);
        h5.title,
        h2,
        h6 {
            color: ${GREEN};
        }
        svg {
            path,
            .tick,
            line {
                stroke: ${GREEN};
            }
        }
    }

    &.is-deaths {
        background: rgba(108, 117, 125, 0.06);
        h5.title,
        h2,
        h6 {
            color: ${GREY};
        }
        svg {
            path,
            .tick,
            line {
                stroke: ${GREY};
            }
        }
    }

    h5.title {
        margin: 0;
        transition: all 0.15s ease-in-out;
        opacity: 0.6;
        color: ${RED};
        font-weight: 900;
        line-height: 10px;
    }
    h2,
    h6 {
        color: ${RED};
        ont-weight: 400;
    }

    .stats-bottom {
        display: flex;
        align-items: center;
    }
`;
