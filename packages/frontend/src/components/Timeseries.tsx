import {
    D3_TRANSITION_DURATION,
    LINE_TOOLTIP_WIDTH,
    LINE_TOOLTIP_HEIGHT,
    LINE_TOOLTIP_PADDING,
} from '../constants';
import { useResizeObserver } from '../hooks/useResizeObserver';
import {
    abbreviateNumber,
    convertDateStrToDate,
    getCategories,
    getColor,
    getStatistic,
} from '../helper';
import styled from 'styled-components';
import { bisector } from 'd3-array';
import { axisBottom, axisRight, AxisScale } from 'd3-axis';
import { scaleLinear, scaleLog, scaleTime, ScaleLinear } from 'd3-scale';
import { pointer, select } from 'd3-selection';
import { area, line } from 'd3-shape';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    Category,
    DataType,
    StatsBarItem,
    TimeseriesMapper,
    CountryTrendWithDelta,
} from '../types';
import { BLUE, LIGHT_ORANGE, ORANGE, PURPLE, RED } from '../colors';
import { CountryTrend } from '../hooks/useCountryTrends';
import moment, { Moment } from 'moment';
import { Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import { transparentize } from 'polished';
import capitalize from 'lodash/capitalize';
import { formatDay, formatNumber } from '../utils/trendUtils';

// Chart margins
const margin = { top: 15, right: 35, bottom: 25, left: 25 };

interface TimeseriesProps {
    timeseries: CountryTrend[];
    dates: Date[];
    dataType: DataType;
    isLog: boolean;
    selectedDate?: Moment;
}

const Timeseries = ({
    timeseries,
    dates,
    dataType,
    isLog,
    selectedDate,
}: TimeseriesProps) => {
    const { t } = useTranslation();
    const refs = useRef<(SVGSVGElement | null)[]>([]);
    const yScaleRef = useRef<ScaleLinear<number, number>[]>([]);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const dimensions = useResizeObserver(wrapperRef) || { width: 0, height: 0 };

    const categories: StatsBarItem[] = useMemo(() => getCategories(dataType), [
        dataType,
    ]);

    const timeseriesMapper = useMemo(() => {
        const mapper: TimeseriesMapper = {};
        if (!timeseries || timeseries.length === 0) {
            return mapper;
        }
        let prev = timeseries[0];
        timeseries.forEach((item) => {
            const key = moment(item.date).startOf('day').valueOf();
            mapper[key] = item;
            mapper[key].delta_confirmed =
                mapper[key].confirmed - prev.confirmed;
            mapper[key].delta_death = mapper[key].deaths - prev.deaths;
            mapper[key].delta_recoveries =
                mapper[key].recoveries - prev.recoveries;
            mapper[key].delta_confirmed_prediction =
                (mapper[key].confirmed_prediction || 0) -
                (prev.confirmed_prediction || 0);
            mapper[key].delta_new_case = mapper[key].new_case - prev.new_case;
            mapper[key].delta_new_death =
                mapper[key].new_deaths - prev.new_deaths;
            mapper[key].delta_new_recoveries =
                mapper[key].new_recoveries - prev.new_recoveries;
            prev = item;
        });
        return mapper;
    }, [timeseries]);

    const stats = useMemo(
        () =>
            selectedDate
                ? timeseriesMapper[selectedDate.startOf('day').valueOf()]
                : undefined,
        [timeseriesMapper, selectedDate]
    );

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

    const xScale = useMemo(() => {
        // Dimensions
        const { width } =
            dimensions || wrapperRef.current?.getBoundingClientRect();
        // Chart extremes
        const chartRight = width - margin.right;
        return scaleTime()
            .clamp(true)
            .domain(
                dates && dates.length > 0
                    ? [dates[0], dates[dates.length - 1]]
                    : []
            )
            .range([margin.left, chartRight]);
    }, [dates, dimensions]);

    useEffect(() => {
        if (dates.length === 0 || timeseries.length === 0) {
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

        // Number of x-axis ticks
        const numTicksX = width < 480 ? 4 : 5;

        const xAxis = (g: any) =>
            g.attr('class', 'x-axis').call(
                axisBottom(xScale)
                    .ticks(numTicksX)
                    .tickFormat((date) => formatDay(date as Date))
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

        /* Begin drawing charts */
        const unpredictedDates = timeseries
            .filter((t) => !t.isPrediction)
            .map((t) => convertDateStrToDate(t.date));
        const predictedTimeseries = timeseries.filter((t) => t.isPrediction);
        const unPredictedTimeseries = timeseries.filter((t) => !t.isPrediction);

        refs.current.forEach((ref, i) => {
            const svg = select(ref) as any;
            const t = svg.transition().duration(D3_TRANSITION_DURATION);

            const category = categories[i].category;
            const yScale = generateYScale(category);
            yScaleRef.current[i] = yScale;
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

            /* Path */
            svg.selectAll('.trend').remove();
            svg.select('.data')
                .append('path')
                .datum(
                    category === 'confirmed'
                        ? timeseries
                        : unPredictedTimeseries
                )
                .attr('fill', 'none')
                .attr('class', 'trend')
                .attr('stroke', color)
                .attr('stroke-width', 1.5)
                .attr(
                    'd',
                    line()
                        .x(function (d: any) {
                            return xScale(convertDateStrToDate(d.date));
                        })
                        .y(function (d: any) {
                            return yScale(getStatistic(dataType, category, d));
                        })
                );

            // Listen events

            const focus = svg
                .append('g')
                .attr('class', 'focus')
                .style('display', 'none');

            focus
                .append('circle')
                .attr('r', 5)
                .attr('class', 'hover-circle')
                .attr('fill', color);

            const tooltip = focus.append('g').attr('class', 'focus-tooltip');
            tooltip
                .append('rect')
                .attr('class', 'tooltip')
                .attr('width', LINE_TOOLTIP_WIDTH)
                .attr('height', LINE_TOOLTIP_HEIGHT)
                .attr('x', 10)
                .attr('y', -22)
                .attr('rx', 4)
                .attr('ry', 4);

            tooltip
                .append('text')
                .attr('class', 'tooltip-date')
                .attr('x', LINE_TOOLTIP_PADDING)
                .attr('y', -2);

            tooltip
                .append('text')
                .attr('class', 'tooltip-delta')
                .attr('x', LINE_TOOLTIP_PADDING)
                .attr('y', 36)
                .text('1 Day Change: --');

            tooltip
                .append('text')
                .attr('class', 'tooltip-value')
                .attr('x', LINE_TOOLTIP_PADDING)
                .attr('y', 18);

            svg.append('rect')
                .attr('class', 'overlay')
                .attr('width', width)
                .attr('height', height)
                .on('touchmove', mousemove)
                .on('mouseover', function () {
                    focus.style('display', null);
                })
                .on('mouseout', mouseout)
                .on('touchend', mouseout)
                .on('mousemove', mousemove);

            function mouseout() {
                focus.style('display', 'none');
            }

            function mousemove(res: any) {
                const xm = pointer(res)[0];
                const date = xScale.invert(xm);
                if (date && dates.length > 0) {
                    const bisectDate = bisector((date) => date).left;
                    const index = bisectDate(dates, date, 1);
                    const dataLeft = timeseries[index - 1];
                    const dataRight = timeseries[index];
                    const dateLeft = dates[index - 1];
                    const dateRight = dates[index];
                    if (dateLeft && dateRight) {
                        const isLeft =
                            date.valueOf() - dateLeft.valueOf() <
                            dateRight.valueOf() - date.valueOf();
                        const hoverDate = isLeft ? dateLeft : dateRight;
                        const hoverValue = isLeft ? dataLeft : dataRight;
                        const data = getStatistic(
                            dataType,
                            category,
                            hoverValue
                        );

                        const deltaText = getDeltaText(
                            dataType,
                            category,
                            hoverValue
                        );

                        // Dimensions
                        const { width, height } =
                            dimensions ||
                            wrapperRef.current?.getBoundingClientRect();

                        const ajustX =
                            xScale(hoverDate) + LINE_TOOLTIP_WIDTH > width;
                        const ajustY =
                            yScale(data) + LINE_TOOLTIP_HEIGHT > height;

                        focus.attr(
                            'transform',
                            `translate(${xScale(hoverDate)}, ${yScale(data)} )`
                        );
                        // Avoid tooltip being cutoff

                        const translateX = ajustX
                            ? -LINE_TOOLTIP_WIDTH - 20
                            : 0;
                        const translateY = ajustY
                            ? -LINE_TOOLTIP_HEIGHT + 20
                            : 0;
                        focus
                            .select('.focus-tooltip')
                            .attr(
                                'transform',
                                `translate(${translateX}, ${translateY})`
                            );

                        const predictedText = hoverValue.isPrediction
                            ? ' Predicted'
                            : '';
                        focus
                            .select('.tooltip-date')
                            .text(
                                `${capitalize(
                                    category
                                )} ${predictedText}: ${formatDay(hoverDate)}`
                            );
                        focus.select('.tooltip-value').text(formatNumber(data));
                        focus.select('.tooltip-delta').text(deltaText);
                    }
                }
            }

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
                                return yScale(d.confirmed_prediction_upper);
                            })
                            .y1(function (d: any) {
                                return yScale(d.confirmed_prediction_lower);
                            })
                    );
                svg.append('path')
                    .datum(predictedTimeseries)
                    .attr('fill', 'none')
                    .attr('class', 'confirmed-prediction')
                    .attr('stroke', 'steelblue')
                    .attr('stroke-dasharray', 1)
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

                svg.select('.data')
                    .selectAll('.stem')
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
        xScale,
    ]);

    useEffect(() => {
        if (!selectedDate) {
            return;
        }
        refs.current.forEach((ref, i) => {
            const highlight = getStatistic(
                dataType,
                categories[i].category,
                stats
            );
            const svg = select(ref);
            svg.selectAll('.selected-date')
                .attr('x', () => xScale?.(selectedDate.toDate()))
                .attr('y', () => yScaleRef.current[i]?.(highlight));
        });
    }, [selectedDate, dataType, categories, stats, xScale, isLog]);

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
                    const highlight = getStatistic(dataType, category, stats);
                    const isPrediction = stats?.isPrediction;
                    const isPredictedCumulative =
                        isPrediction &&
                        category === 'confirmed' &&
                        dataType === 'cumulative';
                    const unPredictable =
                        isPrediction && category !== 'confirmed';
                    return (
                        <Wrapper
                            key={category}
                            className={`svg-parent ${
                                index > 0 ? 'fadeInUp' : ''
                            } is-${category}`}
                            ref={wrapperRef}
                            style={trail[index]}
                        >
                            {selectedDate && (
                                <div
                                    className={`stats is-${category} ${
                                        isPredictedCumulative && 'predicted'
                                    }`}
                                >
                                    <h5 className="title">
                                        <div className="symbol" />
                                        <Text>
                                            {t(
                                                `${label}${
                                                    isPredictedCumulative
                                                        ? ' Prediction'
                                                        : ''
                                                }`
                                            )}
                                            :
                                        </Text>

                                        <div>
                                            {unPredictable
                                                ? '--'
                                                : selectedDate.format(
                                                      'MMM DD YYYY'
                                                  )}
                                            {unPredictable &&
                                                ` (Forecast metrics are not available for "${label}")`}
                                        </div>
                                    </h5>

                                    <HighlightNumber>
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
                                    </HighlightNumber>
                                    <Delta>
                                        {getDeltaText(
                                            dataType,
                                            category,
                                            stats
                                        )}
                                    </Delta>
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
                                <g className="data" />
                                <rect
                                    className="selected-date rotate"
                                    width={6}
                                    height={6}
                                    strokeWidth="1px"
                                    fill="white"
                                    stroke="red"
                                />
                            </svg>
                        </Wrapper>
                    );
                })}
            </div>
        </>
    );
};

export default Timeseries;

const getDeltaText = (
    type: DataType,
    category: Category,
    data?: CountryTrendWithDelta
) => {
    const delta = getStatistic(type, category, data, true);
    const caseText = Math.abs(delta) > 1 ? 'Cases' : 'Case';
    const prefix = delta && delta > 0 ? '+' : '';
    const postfix = delta ? (delta > 0 ? '↗' : '↘') : '';
    return `1 Day Change: ${prefix}${delta} ${caseText} ${postfix}`;
};

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
        text-align: start;
    }

    svg {
        z-index: 1;
        width: 100%;
        .selected-date,
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
        .symbol {
            border: 1px solid ${BLUE};
        }
        svg {
            .selected-date,
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
        .symbol {
            border: 1px solid ${PURPLE};
        }
        svg {
            .selected-date,
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

    .predicted {
        .selected-date,
        h5.title,
        h2,
        h6 {
            color: ${RED};
        }
        .symbol {
            border: 1px solid ${RED};
        }
    }

    .rotate {
        transform-box: fill-box;
        transform-origin: center;
        transform: translate(-50%, -50%) rotate(45deg);
    }

    .overlay {
        fill: none;
        pointer-events: all;
    }

    .focus text {
        font-size: 10px;
        fill: white;
        opacity: 1;
    }

    .tooltip {
        fill: black;
    }

    .focus .tooltip-value {
        font-weight: bold;
        font-size: 16px;
    }
    h5.title {
        display: flex;
        align-items: center;
    }
    .symbol {
        border: 1px solid ${ORANGE};
        width: 6px;
        height: 6px;
        display: inline-block;
        transform: translate(-40%, 0%) rotate(45deg);
    }
`;

const HighlightNumber = styled.h2`
    margin-bottom: 0;
`;

const Delta = styled.h6`
    font-size: 10px;
`;

const Text = styled.span`
    margin-right: 5px;
`;
