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
import { RED, PURPLE, HINT_GREY, DARK_BLUE, LIGHT_GREY } from '../colors';
import { CountryTrend } from '../hooks/useCountryTrends';
import moment, { Moment } from 'moment';
import { Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash/capitalize';
import { formatDay, formatNumber } from '../utils/trendUtils';
import InfoTooltip from './InfoTooltip';

// Chart margins
const margin = { top: 15, right: 35, bottom: 25, left: 25 };
const dayChangeMessage =
    '"1 Day Change" shows the difference between the currently selected date and the preceding dates.';

interface TimeseriesProps {
    timeseries: CountryTrend[];
    rawDailyTimeseries: CountryTrend[];
    dates: Date[];
    dataType: DataType;
    isLog: boolean;
    selectedDate?: Moment;
    country?: string;
    onSelectDate: (value: moment.Moment) => void;
}

const Timeseries = ({
    timeseries,
    rawDailyTimeseries,
    dates,
    dataType,
    isLog,
    selectedDate,
    country,
    onSelectDate,
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

        timeseries.forEach((item) => {
            const key = moment(item.date).startOf('day').valueOf();
            mapper[key] = item;
        });
        rawDailyTimeseries.forEach((item) => {
            const key = moment(item.date).startOf('day').valueOf();
            mapper[key].raw_new_case = item.new_case;
            mapper[key].raw_new_death = item.new_deaths;
            mapper[key].raw_new_recoveries = item.new_recoveries;
        });
        return mapper;
    }, [timeseries, rawDailyTimeseries]);

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
        const yBufferTop = 2;
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
                isLog
                    ? axisRight(yScale)
                          .ticks(4, (num: number) => abbreviateNumber(num))
                          .tickPadding(4)
                    : axisRight(yScale)
                          .ticks(4)
                          .tickFormat((num: number) => abbreviateNumber(num))
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

            svg.selectAll('.trend').remove();
            const focus = svg.select('.focus').style('display', 'none');

            focus.select('.hover-circle').attr('r', 5).attr('fill', color);

            const tooltip = focus.select('.focus-tooltip');
            tooltip
                .select('.tooltip')
                .attr('width', LINE_TOOLTIP_WIDTH)
                .attr('height', LINE_TOOLTIP_HEIGHT);

            tooltip
                .select('.tooltip-date')
                .attr('x', LINE_TOOLTIP_PADDING)
                .attr('y', -2);

            const text = tooltip
                .select('.tooltip-change')
                .attr('x', LINE_TOOLTIP_PADDING)
                .attr('y', 36)
                .text('1 Day Change:');

            tooltip
                .select('.tooltip-value')
                .attr('x', LINE_TOOLTIP_PADDING)
                .attr('y', 18);

            // Remove prediction
            svg.selectAll('.confirmed-prediction').remove();
            svg.selectAll('.confirmed-prediction-error').remove();

            if (dataType === 'cumulative') {
                svg.selectAll('.stem')
                    .transition(t)
                    .attr('y1', yScale(0))
                    .attr('y2', yScale(0))
                    .remove();
            } else {
                /* DAILY TRENDS */

                svg.select('.data')
                    .selectAll('.stem')
                    .data(
                        category === 'confirmed'
                            ? rawDailyTimeseries
                            : rawDailyTimeseries.filter((t) => !t.isPrediction)
                    )
                    .join((enter: any) =>
                        enter
                            .append('line')
                            .attr('class', 'stem')
                            .attr('stroke-width', barWidth)
                            .attr('x1', (d: CountryTrendWithDelta) =>
                                xScale(convertDateStrToDate(d.date))
                            )
                            .attr('y1', chartBottom)
                            .attr('x2', (d: CountryTrendWithDelta) =>
                                xScale(convertDateStrToDate(d.date))
                            )
                            .attr('y2', chartBottom)
                    )
                    .transition(t)
                    .attr('stroke-width', barWidth)
                    .attr('x1', (d: CountryTrendWithDelta) =>
                        xScale(convertDateStrToDate(d.date))
                    )
                    .attr('y1', yScale(0))
                    .attr('x2', (d: CountryTrendWithDelta) =>
                        xScale(convertDateStrToDate(d.date))
                    )
                    .attr('y2', (data: CountryTrendWithDelta) =>
                        yScale(getStatistic(dataType, category, data))
                    )
                    .attr('stroke-dasharray', (data: CountryTrendWithDelta) =>
                        data.isPrediction ? 0.8 : 0
                    )
                    .attr('opacity', (data: CountryTrendWithDelta) =>
                        data.isPrediction ? 0.5 : 1
                    );
            }

            // Add path
            /* Path */
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
                .attr('stroke-width', 2)
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

            if (predictedTimeseries.length && category === 'confirmed') {
                svg.select('.data')
                    .append('path')
                    .datum(predictedTimeseries)
                    .attr('class', 'confirmed-prediction-error')
                    .attr('fill', RED)
                    .attr('stroke', 'none')
                    .attr(
                        'd',
                        area()
                            .x(function (d: any) {
                                return xScale(convertDateStrToDate(d.date));
                            })
                            .y0(function (d: any) {
                                return yScale(
                                    dataType === 'cumulative'
                                        ? d.confirmed_prediction_upper
                                        : d.daily_prediction_upper
                                );
                            })
                            .y1(function (d: any) {
                                return yScale(
                                    dataType === 'cumulative'
                                        ? d.confirmed_prediction_lower
                                        : d.daily_prediction_lower
                                );
                            })
                    );

                svg.select('.data')
                    .append('path')
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
                                return yScale(
                                    dataType === 'cumulative'
                                        ? d.confirmed_prediction
                                        : d.daily_prediction
                                );
                            })
                    );
            }

            svg.select('.overlay')
                .attr('width', width)
                .attr('height', height)
                .on('touchmove', mousemove)
                .on('mouseover', function () {
                    focus.style('display', null);
                })
                .on('mouseout', mouseout)
                .on('touchend', mouseout)
                .on('mousemove', mousemove)
                .on('click', mouseClick);

            function mouseout() {
                focus.style('display', 'none');
            }

            function getHoverDate(res: any) {
                const xm = pointer(res)[0];
                const date = xScale.invert(xm);
                if (date && dates.length > 0) {
                    const bisectDate = bisector((date) => date).left;
                    const index = bisectDate(dates, date, 1);
                    return dates[index];
                }
                return null;
            }

            function mousemove(res: any) {
                const hoverDate = getHoverDate(res);
                if (hoverDate) {
                    const hoverValue =
                        timeseriesMapper[
                            moment(hoverDate).startOf('day').valueOf()
                        ];
                    if (hoverValue) {
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

            function mouseClick(res: any) {
                const hoverDate = getHoverDate(res);
                if (hoverDate) {
                    onSelectDate(moment(hoverDate));
                }
            }
        });
    }, [
        dataType,
        dimensions,
        getBarWidth,
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

    const infoMessage = `${dayChangeMessage} ${
        dataType === 'cumulative'
            ? ''
            : '(Notes: negative values likely indicate a correction in values from the original data source.)'
    }`;
    return (
        <>
            <div className="Timeseries">
                {categories.map(({ category, label }, index) => {
                    let highlight: string | number = getStatistic(
                        dataType,
                        category,
                        stats
                    );
                    const isPrediction = stats?.isPrediction;

                    const isUnreliableData = country === 'TZA' && isPrediction;

                    const isPredictedConfirmed =
                        isPrediction && category === 'confirmed';
                    const unPredictable =
                        isPrediction && category !== 'confirmed';
                    return (
                        <Wrapper
                            key={category}
                            className={`is-${category}`}
                            ref={wrapperRef}
                        >
                            {selectedDate && (
                                <div
                                    className={`stats is-${category} ${
                                        isPredictedConfirmed && 'predicted'
                                    }`}
                                >
                                    <h5 className="title">
                                        <div className="symbol" />
                                        <Text>
                                            {t(
                                                `${label}${
                                                    isPredictedConfirmed
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
                                                isUnreliableData
                                                    ? 'Predictions for Tanzania are unreliable because of lack of data'
                                                    : isPrediction &&
                                                      !isPredictedConfirmed
                                                    ? '-'
                                                    : highlight
                                            }
                                            valueStyle={{
                                                color: getStatColor(category),
                                            }}
                                        />
                                    </HighlightNumber>
                                    <Delta>
                                        <span>
                                            1 Day Change:{' '}
                                            <strong>
                                                {getDeltaText(
                                                    dataType,
                                                    category,
                                                    stats
                                                )}
                                            </strong>
                                        </span>
                                        <Info>
                                            <InfoTooltip
                                                message={infoMessage}
                                                top={3}
                                                right={3}
                                            />
                                        </Info>
                                    </Delta>
                                    {dataType === 'daily' && (
                                        <Delta style={{ opacity: 0.7 }}>
                                            <span>
                                                Raw Daily:{' '}
                                                <strong>
                                                    {getStatistic(
                                                        dataType,
                                                        category,
                                                        stats,
                                                        false,
                                                        true
                                                    )}
                                                </strong>
                                            </span>
                                            <Info>
                                                <InfoTooltip
                                                    message="Bar charts using raw daily data. Other data in dashboard using 7 days rolling average."
                                                    top={3}
                                                    right={3}
                                                />
                                            </Info>
                                        </Delta>
                                    )}
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
                                    width={10}
                                    height={10}
                                    strokeWidth="1px"
                                    fill="white"
                                    stroke="red"
                                />
                                <g className="focus">
                                    <circle r="5" className="hover-circle" />
                                    <g className="focus-tooltip">
                                        <rect
                                            className="tooltip"
                                            x="10"
                                            y="-22"
                                            rx="4"
                                            ry="4"
                                        />
                                        <text className="tooltip-date" y="-2" />
                                        <text
                                            x="15"
                                            y="36"
                                            className="tooltip-change"
                                        >
                                            1 Day Change:
                                            <tspan className="tooltip-delta" />
                                        </text>
                                        <text
                                            className="tooltip-value"
                                            x="15"
                                            y="18"
                                        />
                                    </g>
                                </g>
                                <rect className="overlay" />
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
    const arrow = delta ? (delta > 0 ? '↑' : '↓') : '';
    return `${arrow} ${prefix}${delta} ${caseText}`;
};

const getStatColor = (category: Category) => {
    switch (category) {
        case 'confirmed':
            return RED;
        case 'deaths':
            return PURPLE;
        case 'recoveries':
        default:
            return DARK_BLUE;
    }
};

const Wrapper = styled.div`
    position: relative;
    align-self: center;
    border-radius: 5px;
    display: flex;
    position: relative;
    width: 100%;
    height: 10rem;
    margin-bottom: 1rem;
    border: 1px solid ${LIGHT_GREY};

    .stats {
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        left: 0.5rem;
        padding: 0.25rem;
        position: absolute;
        top: 0.5rem;
        text-align: start;
        button {
            color: ${RED};
        }
    }
    .tooltip-delta {
        font-weight: bold;
    }
    svg {
        width: 100%;
        .selected-date,
        path,
        line {
            stroke: ${RED};
        }
        .x-axis,
        .y-axis {
            path,
            line {
                stroke: #612500;
            }
        }
        path.confirmed-prediction {
            stroke: ${RED};
        }
        path.confirmed-prediction-error {
            stroke: none;
            opacity: 0.6;
        }
        .tick {
            fill: ${HINT_GREY};
        }
    }

    &.is-recoveries {
        h5.title,
        h2,
        h6 {
            color: ${DARK_BLUE};
        }
        .symbol {
            border: 1px solid ${DARK_BLUE};
        }
        button {
            color: ${DARK_BLUE};
        }
        svg {
            .selected-date,
            path,
            line {
                stroke: ${DARK_BLUE};
            }
            .x-axis,
            .y-axis {
                path,
                line {
                    stroke: #030852;
                }
            }
        }
    }

    &.is-deaths {
        h5.title,
        h2,
        h6 {
            color: ${PURPLE};
        }
        .symbol {
            border: 1px solid ${PURPLE};
        }
        button {
            color: ${PURPLE};
        }
        svg {
            .selected-date,
            path,
            line {
                stroke: ${PURPLE};
            }
            .x-axis,
            .y-axis {
                path,
                line {
                    stroke: #120338;
                }
            }
        }
    }

    h5.title {
        margin: 0;
        transition: all 0.15s ease-in-out;
        color: ${RED};
        font-weight: 900;
        line-height: 10px;
        font-size: 11px;
    }
    h2,
    h6 {
        color: ${RED};
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
        font-size: ;
    }
    .symbol {
        border: 1px solid ${RED};
        width: 6px;
        height: 6px;
        display: inline-block;
        transform: translate(-40%, 0%) rotate(45deg);
    }
    .stem {
        opacity: 0.3;
    }
`;

const HighlightNumber = styled.h2`
    margin-bottom: 0;
    .ant-statistic {
        line-height: 1.3;
    }
    .ant-statistic-content {
        font-size: 16px;
    }
    .ant-statistic-content-value-decimal {
        font-size: 12px;
    }
`;

const Delta = styled.h6`
    font-size: 9px;
    line-height: 1.1;
    position: relative;
    button {
        left: -10px;
    }
    margin-bottom: 0;
`;

const Text = styled.span`
    margin-right: 5px;
`;

const Info = styled.span`
    position: relative;
    width: 11px;
    height: 11px;
    display: inline-block;
    button {
        left: 1px;
    }
`;
