import { D3_TRANSITION_DURATION } from '../constants';
import { useResizeObserver } from '../hooks/useResizeObserver';
import {
    abbreviateNumber,
    convertDateStrToDate,
    formatDateToStr,
    getCategories,
    getColor,
    getStatistic,
} from '../helper';
import styled from 'styled-components';
import { bisector } from 'd3-array';
import { axisBottom, axisRight, AxisScale } from 'd3-axis';
import { scaleLinear, scaleLog, scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';
import { pointer, select } from 'd3-selection';
import { area, curveMonotoneX, line } from 'd3-shape';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Category, DataType, StatsBarItem } from '../types';
import { BLUE, LIGHT_ORANGE, ORANGE, PURPLE, RED } from '../colors';
import { CountryTrend } from '../hooks/useCountryTrends';
import moment from 'moment';
import { Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import { transparentize } from 'polished';

// Chart margins
const margin = { top: 15, right: 35, bottom: 25, left: 25 };
const formatter = timeFormat('%m-%d');

interface TimeseriesProps {
    timeseries: CountryTrend[];
    dates: Date[];
    dataType: DataType;
    isLog: boolean;
}

interface TimeseriesMapper {
    [key: number]: CountryTrend;
}

const Timeseries = ({
    timeseries,
    dates,
    dataType,
    isLog,
}: TimeseriesProps) => {
    const { t } = useTranslation();
    const refs = useRef<(SVGSVGElement | null)[]>([]);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const dimensions = useResizeObserver(wrapperRef) || { width: 0, height: 0 };

    const [highlightedDate, setHighlightedDate] = useState(
        dates[dates.length - 1]
    );

    const categories: StatsBarItem[] = useMemo(() => getCategories(dataType), [
        dataType,
    ]);

    const timeseriesMapper = useMemo(() => {
        const mapper: TimeseriesMapper = {};
        timeseries.forEach((item) => {
            const key = moment(item.date).valueOf();
            mapper[key] = item;
        });
        return mapper;
    }, [timeseries]);

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
        if (T === 0 || timeseries.length === 0) {
            return;
        }
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

        const yAxis = (g: any, yScale: AxisScale<number>) =>
            g.attr('class', 'y-axis').call(
                axisRight(yScale)
                    .ticks(4)
                    .tickFormat((num) => abbreviateNumber(num))
                    .tickPadding(4)
            );

        const generateYScale = (category: Category) => {
            let minTrend = 0;
            let maxTrend = 0;
            for (let i = 0; i < timeseries.length; i++) {
                const value = getStatistic(dataType, category, timeseries[i]);
                minTrend = Math.min(minTrend, value);
                maxTrend = Math.max(maxTrend, value);
            }
            if (isLog) {
                return scaleLog()
                    .clamp(true)
                    .domain([
                        Math.max(1, minTrend),
                        Math.max(10, yBufferTop * maxTrend),
                    ])
                    .nice()
                    .range([chartBottom, margin.top]);
            }

            const minNum = yBufferBottom * minTrend;

            const maxNum = Math.max(1, yBufferTop * maxTrend);
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
                if (dateLeft && dateRight) {
                    setHighlightedDate(
                        date.valueOf() - dateLeft.valueOf() <
                            dateRight.valueOf() - date.valueOf()
                            ? dateLeft
                            : dateRight
                    );
                }
            }
        }

        function mouseout() {
            setHighlightedDate(dates[T - 1]);
        }

        /* Begin drawing charts */
        const unpredictedDates = timeseries
            .filter((t) => !t.isPrediction)
            .map((t) => convertDateStrToDate(t.date));
        const predictedTimeseries = timeseries.filter((t) => t.isPrediction);

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

            /* Y axis */
            svg.select('.y-axis')
                .style('transform', `translateX(${chartRight}px)`)
                .transition(t)
                .call(yAxis, yScale);

            /* Path dots */
            const circles = svg
                .selectAll('circle')
                .data(unpredictedDates, (date: Date) => date);

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
                .attr('cy', (date: Date) =>
                    yScale(
                        getStatistic(
                            dataType,
                            category,
                            timeseriesMapper[date.valueOf()]
                        )
                    )
                )
                .attr('cx', (date: Date) => xScale(date));

            // Remove prediction
            svg.selectAll('.confirmed-prediction').remove();
            svg.selectAll('.confirmed-prediction-error').remove();

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
                                dataType,
                                category,
                                timeseriesMapper[(date as any).valueOf()]
                            )
                        )
                    );

                svg.selectAll('.trend')
                    .remove()
                    .data([unpredictedDates])
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

                if (!predictedTimeseries.length || category !== 'confirmed') {
                    return;
                }
                svg.append('path')
                    .datum(predictedTimeseries)
                    .attr('class', 'confirmed-prediction-error')
                    .attr('fill', '#cce5df')
                    .attr('stroke', 'none')
                    .attr(
                        'd',
                        area()
                            .x(function (d: any) {
                                return xScale(convertDateStrToDate(d.date));
                            })
                            .y0(function (d: any) {
                                return yScale(
                                    d.confirmed_prediction_upper + 2000
                                );
                            })
                            .y1(function (d: any) {
                                return yScale(
                                    d.confirmed_prediction_lower - 2000
                                );
                            })
                    );
                svg.append('path')
                    .datum(predictedTimeseries)
                    .attr('fill', 'none')
                    .attr('class', 'confirmed-prediction')
                    .attr('stroke', 'steelblue')
                    .attr('stroke-width', 1.5)
                    .attr(
                        'd',
                        line()
                            .x(function (d: any) {
                                return xScale(convertDateStrToDate(d.date));
                            })
                            .y(function (d: any) {
                                return yScale(d.confirmed_prediction);
                            })
                    );
            } else {
                /* DAILY TRENDS */
                svg.selectAll('.trend').remove();

                svg.selectAll('.stem')
                    .data(unpredictedDates, (date: Date) => date)
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
                                dataType,
                                category,
                                timeseriesMapper[date.valueOf()]
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
        timeseriesMapper,
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
                dataType,
                category,
                highlightedDate
                    ? timeseriesMapper[highlightedDate.valueOf()]
                    : undefined
            );
            const prevDate =
                dates[dates.findIndex((date) => date === highlightedDate) - 1];

            const prevCount = getStatistic(
                dataType,
                category,
                prevDate ? timeseriesMapper[prevDate.valueOf()] : undefined
            );
            return currCount - prevCount;
        },
        [dates, highlightedDate, dataType, timeseriesMapper]
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
                        dataType,
                        category,
                        highlightedDate
                            ? timeseriesMapper[highlightedDate.valueOf()]
                            : undefined
                    );

                    const isPrediction =
                        highlightedDate &&
                        timeseriesMapper[highlightedDate.valueOf()]
                            ?.isPrediction;
                    const isPredictedCumulative =
                        isPrediction &&
                        category === 'confirmed' &&
                        dataType === 'cumulative';

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
                                <div
                                    className={`stats is-${category} ${
                                        isPredictedCumulative && 'predicted'
                                    }`}
                                >
                                    <h5 className="title">
                                        {t(
                                            `${label}${
                                                isPredictedCumulative
                                                    ? ' Prediction'
                                                    : ''
                                            }`
                                        )}
                                    </h5>
                                    <h5 className="title">
                                        {formatDateToStr(highlightedDate)}
                                    </h5>
                                    <div className="stats-bottom">
                                        <h2>
                                            <Statistic
                                                value={
                                                    isPrediction &&
                                                    !isPredictedCumulative
                                                        ? '-'
                                                        : highlight
                                                }
                                                precision={0}
                                                valueStyle={{
                                                    color: getStatColor(
                                                        category,
                                                        !!isPredictedCumulative
                                                    ),
                                                }}
                                            />
                                        </h2>
                                        <h6>
                                            <Statistic
                                                value={
                                                    isPrediction &&
                                                    !isPredictedCumulative
                                                        ? '-'
                                                        : delta
                                                }
                                                prefix={
                                                    delta && delta > 0
                                                        ? '+'
                                                        : ''
                                                }
                                                precision={0}
                                                valueStyle={{
                                                    color: getStatColor(
                                                        category,
                                                        !!isPredictedCumulative
                                                    ),
                                                    fontSize: 10,
                                                }}
                                            />
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

const getStatColor = (category: Category, isPrediction: boolean) => {
    switch (category) {
        case 'confirmed':
            return isPrediction ? RED : ORANGE;
        case 'deaths':
            return PURPLE;
        case 'recoveries':
        default:
            return BLUE;
    }
};

const Wrapper = styled.div`
    position: relative;
    align-self: center;
    background: ${transparentize(0.85, LIGHT_ORANGE)};
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
            stroke: ${ORANGE};
        }
        path.confirmed-prediction {
            stroke: ${RED};
        }
        path.confirmed-prediction-error {
            stroke: none;
        }
        text {
            opacity: 0.5;
        }
    }

    &.is-recoveries {
        background: ${transparentize(0.85, BLUE)};
        h5.title,
        h2,
        h6 {
            color: ${BLUE};
        }
        svg {
            path,
            .tick,
            line {
                stroke: ${BLUE};
            }
        }
    }

    &.is-deaths {
        background: ${transparentize(0.85, PURPLE)};
        h5.title,
        h2,
        h6 {
            color: ${PURPLE};
        }
        svg {
            path,
            .tick,
            line {
                stroke: ${PURPLE};
            }
        }
    }

    h5.title {
        margin: 0;
        transition: all 0.15s ease-in-out;
        opacity: 0.6;
        color: ${ORANGE};
        font-weight: 900;
        line-height: 10px;
    }
    h2,
    h6 {
        color: ${ORANGE};
        font-weight: 400;
    }

    .stats-bottom {
        display: flex;
        align-items: center;
    }
    .predicted {
        h5.title,
        h2,
        h6 {
            color: ${RED};
        }
    }
`;
