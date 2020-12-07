import React, {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import africaTopology from './africa.json';
import * as topojson from 'topojson-client';
import { GeometryCollection, Topology } from 'topojson-specification';
import styled from 'styled-components';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { Category, DataType } from '../../types';
import { values, mapValues } from 'lodash';
import * as colors from '../../colors';
import { CountryProperties } from './types';
import { Feature, Geometry } from 'geojson';
import getTooltipContent, { tooltipCSS } from './getTooltipContent';
import { getCountryA3 } from './utils';
import { Card, Switch } from 'antd';
import CountryStatsContext from '../../contexts/CountryStatsContext';
import { scaleTrendDatum } from '../../utils/trendUtils';

interface AfricaMapProps {
    category: Category;
    dataType: DataType;
    selectedCountry?: string;
    onCountrySelect?: (country: string | undefined) => void;
    trendData?: { [k in string]: CountryTrend }; // Data should be a map of country A3 to trend datum
    loading?: boolean;
}

type MapData = Feature<Geometry, CountryProperties>;

const MAP_TARGET = '#africa-map';
const TOOLTIP_HEIGHT = 250;
const TOOLTIP_WIDTH = 200;

const topology = (africaTopology as unknown) as Topology<{
    collection: GeometryCollection<CountryProperties>;
}>;
const feature = topojson.feature(topology, topology.objects.collection);
const africaMapFeatures: MapData[] = feature.features;

const colorRanges = {
    confirmed: [colors.LIGHT_GREY, colors.LIGHT_RED, colors.RED],
    recoveries: [colors.LIGHT_GREY, colors.LIGHT_GREEN, colors.GREEN],
    deaths: [colors.LIGHT_GREY, colors.GREY],
};
const AfricaMap: React.FC<AfricaMapProps> = ({
    category,
    dataType,
    selectedCountry,
    onCountrySelect,
    trendData,
}) => {
    const width = 960;
    const height = 720;
    const svgNode = useRef<SVGSVGElement>(null);
    const [logScale, setLogScale] = useState(false);
    const [isPer100k, setIsPer100K] = useState(false);

    const { allCountryStats, isLoading: countryStatsLoading } = useContext(
        CountryStatsContext
    );

    const isPrediction = Object.keys(trendData || {}).find(
        (key) => trendData?.[key].isPrediction
    );

    const scaledTrendData = useMemo(() => {
        if (!trendData || !isPer100k || !allCountryStats) {
            return trendData;
        }
        const scaled = mapValues(trendData, (datum, country_iso) => {
            const population = allCountryStats[country_iso]?.population;
            if (!population) {
                return undefined;
            }
            return scaleTrendDatum(datum, (1 / population) * 100000);
        });
        // filter out null values
        Object.keys(scaled).forEach(
            (key) => scaled[key] === undefined && delete scaled[key]
        );
        return scaled as { [key: string]: CountryTrend };
    }, [isPer100k, allCountryStats, trendData]);

    const trendKey = useMemo(() => {
        let trendKey: keyof CountryTrend = 'confirmed';
        if (dataType === 'daily') {
            if (category === 'confirmed') {
                trendKey = 'new_case';
            } else if (category === 'recoveries') {
                trendKey = 'new_recoveries';
            } else if (category === 'deaths') {
                trendKey = 'new_deaths';
            }
        } else {
            if (category === 'confirmed') {
                trendKey = isPrediction ? 'confirmed_prediction' : 'confirmed';
            } else if (category === 'recoveries') {
                trendKey = 'recoveries';
            } else if (category === 'deaths') {
                trendKey = 'deaths';
            }
        }
        return trendKey;
    }, [category, dataType, isPrediction]);

    const handleCountryClick = useCallback(
        (country: string) => {
            if (!Boolean(country) || !trendData || !(country in trendData)) {
                return;
            }
            if (country !== selectedCountry) {
                onCountrySelect?.(country);
            } else {
                onCountrySelect?.(undefined);
            }
        },
        [onCountrySelect, selectedCountry, trendData]
    );

    const fillMap = useCallback(() => {
        const svg = d3.select(svgNode.current);
        const countries = svg.selectAll('.country-border');
        countries.classed('selected-country', (d: MapData) => {
            return getCountryA3(d.properties) === selectedCountry;
        });

        // Update colors
        if (scaledTrendData !== undefined) {
            let colorRange = colorRanges[category] || colorRanges['deaths'];

            let extent = d3.extent(values(scaledTrendData), (d) =>
                typeof d[trendKey] === 'number' ? (d[trendKey] as number) : 0
            );

            if (extent[0] === undefined) {
                extent = [1, 1];
            }

            if (logScale) {
                // Clean up the extent if we are using log scale.
                const maxPowerOfTen = Math.ceil(Math.log10(extent[1]));
                extent[1] = Math.pow(10, maxPowerOfTen);
                extent[0] = 1;
            }

            const baseScale = logScale ? d3.scaleLog() : d3.scaleLinear();
            const colorScale = baseScale
                .domain(extent)
                // @ts-ignore
                .range(colorRange)
                // @ts-ignore
                .interpolate(d3.interpolateHcl);

            // update the legend color
            let legend = legendColor()
                .labelFormat(d3.format(',.2r'))
                // .useClass(true)
                .labelOffset(3)
                .shapePadding(2);

            if (logScale) {
                const maxPowerOfTen = Math.ceil(Math.log10(extent[1]));
                legend = legend.cells(
                    colorScale.ticks(Math.min(5, maxPowerOfTen))
                );
            }

            svg.select('.legend').remove();

            svg.select('.legend-container')
                .append('g')
                .attr('class', 'legend')
                .call(legend.scale(colorScale));
            countries
                .transition()
                .duration(1000)
                .style('fill', (d: MapData) => {
                    const countryCode = getCountryA3(d.properties);
                    if (!(countryCode in scaledTrendData)) {
                        return colors.DARK_GREY;
                    }
                    const countryData: CountryTrend | undefined =
                        scaledTrendData?.[countryCode];
                    if (countryData?.[trendKey] !== undefined) {
                        return colorScale(
                            Math.max(1, countryData[trendKey] as number)
                        );
                    }
                    return colors.LIGHT_GREY;
                });
        }
    }, [selectedCountry, category, scaledTrendData, trendKey, logScale]);

    const createTooltip = useCallback(() => {
        const svg = d3.select(svgNode.current);
        const showTooltip = (e: any, data: MapData) => {
            if (e.target?.nodeName === 'path') {
                const bBox = e.target.getBBox();
                const x = bBox.x + bBox.width + 10;
                const y = Math.max(
                    bBox.y + bBox.height / 2 - TOOLTIP_HEIGHT / 2,
                    0
                );

                // Display and update the tooltip
                svg.select('.map-tooltip')
                    .style('opacity', '0.8')
                    .attr('transform', `translate(${x}, ${y})`)
                    .selectAll('foreignObject')
                    .data([data.properties])
                    .join('foreignObject')
                    .attr('height', TOOLTIP_HEIGHT)
                    .attr('width', TOOLTIP_WIDTH)
                    .html((d: CountryProperties) =>
                        getTooltipContent(
                            d,
                            scaledTrendData?.[getCountryA3(d)],
                            isPer100k
                        )
                    );
            }
        };
        const hideTooltip = (e: any) => {
            svg.select('.map-tooltip').style('opacity', '0');
        };
        svg.selectAll('.overlay-country-border').on('mouseenter', showTooltip);
        svg.selectAll('.overlay-country-border').on('mouseout', hideTooltip);
    }, [scaledTrendData, isPer100k]);

    const initializeMap = useCallback(() => {
        const svg = d3
            .select(MAP_TARGET)
            .attr('width', width)
            .attr('height', height);

        const projection = d3
            .geoMercator()
            .scale(410)
            .translate([width / 3, height / 2]);
        const path = d3.geoPath().projection(projection);
        // create background box
        svg.append('rect')
            .attr('class', 'background')
            .style('background-color', colors.LIGHT_GREY)
            .attr('width', width)
            .attr('height', height);

        // Place legend target onto the map
        svg.append('g')
            .attr('class', 'legend-container')
            .attr('transform', 'translate(20,20)');

        // Draw the countries in the continent
        svg.append('g')
            .attr('class', 'continent')
            .selectAll('path')
            .data(africaMapFeatures)
            .join('path')
            .attr('class', 'country-border')
            .attr('d', path);

        // Create the tooltip
        svg.append('g').attr('class', 'map-tooltip').append('rect');

        /* Create a transparent country overlay. The overlay sits on top of the other elements and is used
        as the click and hover target. The lets us listen to mouse events without worrying about the
        tooltip "covering" the element we want to listen to. The overlay should be kept transparent.
         */
        svg.append('g')
            .attr('class', 'overlay')
            .selectAll('path')
            .data(africaMapFeatures)
            .join('path')
            .attr('class', 'overlay-country-border')
            .attr('d', path);

        fillMap();
        setResponsiveSVG();
    }, []);

    // Many browsers -- IE particularly -- will not auto-size inline SVG
    // IE applies default width and height sizing
    // padding-bottom hack on a container solves IE inconsistencies in size
    // https://css-tricks.com/scale-svg/#article-header-id-10
    const setResponsiveSVG = () => {
        let width = +d3.select(MAP_TARGET).attr('width');
        let height = +d3.select(MAP_TARGET).attr('height');
        let calcString = +(height / width) * 100 + '%';

        const svgElement = d3.select(MAP_TARGET);
        if (svgElement === null || svgElement.node() === null) {
            return;
        }
        const svgParent = d3.select('#svg-parent');

        svgElement
            .attr('class', 'scaling-svg')
            .attr('preserveAspectRatio', 'xMinYMin')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('width', null)
            .attr('height', null);

        const isIE = window.navigator.userAgent?.indexOf('MSIE ') > 0;
        if (isIE) {
            svgParent.style('padding-bottom', calcString);
        }
    };

    // Set up onClick handler
    useEffect(() => {
        d3.select('.overlay')
            .selectAll('.overlay-country-border')
            .on('click', (e: any, d: any) => {
                const country = getCountryA3(d.properties);
                if (country) {
                    handleCountryClick(country);
                }
            });
    }, [handleCountryClick]);
    useLayoutEffect(() => initializeMap(), []);
    useEffect(fillMap, [fillMap]);
    useEffect(createTooltip, [createTooltip]);

    const isPer100KDisabled =
        !selectedCountry || !allCountryStats || countryStatsLoading;
    return (
        <Card>
            <ControlsContainer>
                <Control>
                    <span>Logarithmic:&nbsp;</span>
                    <Switch onChange={setLogScale} />
                </Control>
                <Control>
                    <span>Per 100K:&nbsp;</span>
                    <Switch
                        onChange={setIsPer100K}
                        disabled={isPer100KDisabled}
                    />
                </Control>
            </ControlsContainer>
            <MapContainer id="svg-parent" className="scaling-svg-container">
                <svg id="africa-map" ref={svgNode} />
            </MapContainer>
        </Card>
    );
};

const MapContainer = styled.div`
    .background {
        fill-opacity: 0.0;
    }
    .continent { 
        .country-border {
            fill: none;
            stroke: ${colors.BLACK};
            stroke-width: 0.5px;
            pointer-events: all;
            stroke-linejoin: round;
            stroke-linecap: round;
            &.selected-country {
                stroke-width: 3px;
            }
        }
    }
    .overlay {
        opacity: 1;
        path {
            fill: none;
            cursor: pointer;
            pointer-events: all;
            &:hover {
                stroke: ${colors.DARK_GREY};
                stroke-width: 2px;
            }
        }
    }
    .map-tooltip {
        opacity: 0;
        rect {
            height: ${TOOLTIP_HEIGHT}px;
            width: ${TOOLTIP_WIDTH}px;
            background-color ${colors.DARK_GREY};
        }
        ${tooltipCSS}
    }
`;

const ControlsContainer = styled.div`
    display: flex;
`;

const Control = styled.div`
    margin-right: 10px;
`;

export default React.memo(AfricaMap);
