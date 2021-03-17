import React, {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from 'react';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import africaTopology from './africa.json';
import * as topojson from 'topojson-client';
import { GeometryCollection, Topology } from 'topojson-specification';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { Category, DataType } from '../../types';
import { mapValues, values, isEmpty } from 'lodash';
import * as colors from '../../colors';
import { CountryProperties } from './types';
import { Feature, Geometry } from 'geojson';
import getTooltipContent from './getTooltipContent';
import { getCountryA3, getRegion } from './utils';
import { Card } from 'antd';
import StatsContext from '../../contexts/StatsContext';
import { scaleTrendDatum } from '../../utils/trendUtils';
import { useTranslation } from 'react-i18next';
import { MapContainer, TOOLTIP_HEIGHT, TOOLTIP_WIDTH } from './AfricaMapStyles';
import { DailyRange } from '../../hooks/useQuntizedDailyRate';

interface AfricaMapProps {
    category: Category;
    dataType: DataType;
    selectedCountry?: string;
    selectedRegion?: string;
    isRegion: boolean;
    dailyRange?: DailyRange;
    onRegionSelect?: (region: string) => void;
    onCountrySelect?: (country: string) => void;
    trendData?: { [k in string]: CountryTrend }; // Data should be a map of country A3 to trend datum
    loading?: boolean;
    isLog: boolean;
    per100k: boolean;
}

type MapData = Feature<Geometry, CountryProperties>;

const MAP_TARGET = '#africa-map';

const NO_QUALTILE_BINS = 4;

const topology = (africaTopology as unknown) as Topology<{
    collection: GeometryCollection<CountryProperties>;
}>;

const feature = topojson.feature(topology, topology.objects.collection);
const africaMapFeatures: MapData[] = feature.features;

const colorRanges = {
    confirmed: [colors.LIGHT_GREY, colors.ORANGE],
    confirmed_predicted: [colors.LIGHT_GREY, colors.RED],
    recoveries: [colors.LIGHT_GREY, colors.BLUE],
    deaths: [colors.LIGHT_GREY, colors.PURPLE],
};
const AfricaMap: React.FC<AfricaMapProps> = ({
    category,
    dataType,
    selectedCountry,
    selectedRegion,
    isRegion,
    onCountrySelect,
    trendData,
    dailyRange,
    onRegionSelect,
    isLog,
    per100k,
}) => {
    const { t } = useTranslation();
    const width = 960;
    const height = 720;
    const svgNode = useRef<SVGSVGElement>(null);

    const { allStats } = useContext(StatsContext);

    const isPrediction = Object.keys(trendData || {}).find(
        (key) => trendData?.[key].isPrediction
    );

    console.log(trendData);
    const scaledTrendData = useMemo(() => {
        if (!trendData || !allStats) {
            return trendData;
        }
        const scaled = mapValues(trendData, (datum, country_iso) => {
            const population = allStats[country_iso]?.population;
            if (!population) {
                return undefined;
            }
            if (per100k) {
                return scaleTrendDatum(datum, (1.0 / population) * 100000.0);
            } else {
                return datum;
            }
        });
        // filter out null values
        Object.keys(scaled).forEach(
            (key) => scaled[key] === undefined && delete scaled[key]
        );
        return scaled as { [key: string]: CountryTrend };
    }, [allStats, trendData, per100k]);

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
                onCountrySelect?.('');
            }
        },
        [onCountrySelect, selectedCountry, trendData]
    );

    const handleRegionClick = useCallback(
        (region: string) => {
            if (!Boolean(region)) {
                return;
            }
            if (region !== selectedRegion) {
                onRegionSelect?.(region);
            } else {
                onRegionSelect?.('');
            }
        },
        [onRegionSelect, selectedRegion]
    );

    const fillMap = useCallback(() => {
        console.log('Filling map');
        const svg = d3.select(svgNode.current);
        const countries = svg.selectAll('.country-border');
        countries.classed('selected-country', (d: MapData) => {
            return isRegion
                ? getRegion(d.properties) === selectedRegion
                : getCountryA3(d.properties) === selectedCountry;
        });

        // Add a loading class if data is undefined
        countries.classed('loading', () => scaledTrendData === undefined);

        // Update colors
        if (scaledTrendData !== undefined) {
            const category_key = isPrediction
                ? 'confirmed_predicted'
                : category;
            let colorRange = colorRanges[category_key] || colorRanges['deaths'];

            let extent = d3.extent(values(scaledTrendData), (d) =>
                typeof d[trendKey] === 'number' ? (d[trendKey] as number) : 0
            );

            if (extent[0] === undefined) {
                extent = [1, 1];
            }

            console.log('raw extenxt ', extent);

            if (isLog) {
                // Clean up the extent if we are using log scale.
                // const maxPowerOfTen = Math.ceil(Math.log10(extent[1]));
                // extent[1] = Math.pow(10, maxPowerOfTen);
                extent[0] = 1;
            } else {
                // Clean up extent if we use linear scale. Just round the nearest power of ten
                // const powerOfTen = Math.ceil(Math.log10(extent[1]));
                // extent[1] = Math.pow(10, powerOfTen);
                extent[0] = 0;
            }

            if (isLog && dataType === 'daily' && dailyRange) {
                extent = dailyRange[category].logExtent;
            }

            console.log('modified extext', extent);

            const baseScale = isLog ? d3.scaleLog() : d3.scaleLinear();
            let colorScale: any = baseScale
                .domain(extent)
                // @ts-ignore
                .range(colorRange)
                // @ts-ignore
                .interpolate(d3.interpolateHcl);

            // If daily rates and non - log
            // Use static quantile bins
            console.log('data type ', dataType, ' is log ', isLog, dailyRange);
            if (dataType === 'daily' && !isLog && dailyRange) {
                let colorSpace = d3
                    .scaleLinear()
                    .domain([0, NO_QUALTILE_BINS])
                    // @ts-ignore
                    .range(colorRange)
                    // @ts-ignore
                    .interpolate(d3.interpolateHcl);
                let colors = [...Array(NO_QUALTILE_BINS)].map((_, i) =>
                    colorSpace(i)
                );
                console.log('colors for daily ', colors);
                colorScale = dailyRange[category].quantiles.range(colors);
            }

            // update the legend color
            let legend = legendColor()
                .labelFormat(d3.format(',.2r'))
                // .useClass(true)
                .labelOffset(3)
                .shapePadding(2);

            if (isLog) {
                const maxPowerOfTen = Math.ceil(Math.log10(extent[1]));
                legend = legend.cells(
                    colorScale.ticks(Math.min(5, maxPowerOfTen))
                );
            }

            svg.selectAll('.legend').remove();

            // Add the custom areas for no data and 0
            let customCategories = d3
                .scaleOrdinal()
                .domain(['no_data', '0'])
                .range(['url(#hash4_4)', 'rgba(255,255,255,255)']);

            svg.select('.legend-container')
                .append('g')
                .attr('class', 'legend')
                .call(legend.scale(customCategories));

            // Add the color scale bins
            svg.select('.legend-container')
                .append('g')
                .attr('class', 'legend')
                .attr('transform', 'translate(0,40)')
                .call(legend.scale(colorScale));
            countries
                // .transition()
                // .duration(1000)
                .style('fill', (d: MapData) => {
                    const countryCode = getCountryA3(d.properties);
                    // Loading
                    if (isEmpty(scaledTrendData)) {
                        return 'url(#hash4_4)';
                    }

                    if (!(countryCode in scaledTrendData)) {
                        return 'url(#hash4_4)';
                    }
                    const countryData: CountryTrend | undefined =
                        scaledTrendData?.[countryCode];
                    if (countryData?.[trendKey] !== undefined) {
                        const val = countryData[trendKey] as number;
                        if (val === 0) {
                            return 'rgba(255,255,255,255)';
                        } else {
                            return colorScale(val);
                        }
                    }
                    return colors.LIGHT_GREY;
                });
        }
    }, [
        selectedCountry,
        category,
        scaledTrendData,
        trendKey,
        isLog,
        isRegion,
        selectedRegion,
        dailyRange,
        isPrediction,
        per100k,
    ]);

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
                            t,
                            d,
                            allStats,
                            scaledTrendData?.[getCountryA3(d)],
                            per100k
                        )
                    );
            }
        };
        const hideTooltip = (e: any) => {
            svg.select('.map-tooltip').style('opacity', '0');
        };
        svg.selectAll('.overlay-country-border').on('mouseenter', showTooltip);
        svg.selectAll('.overlay-country-border').on('mouseout', hideTooltip);
    }, [scaledTrendData, per100k, t, allStats]);

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

        //Add paterns
        svg.append('defs')
            .append('pattern')
            .attr('id', 'hash4_4')
            .attr('width', '8')
            .attr('height', '8')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('patternTransform', 'rotate(60)')
            .append('rect')
            .attr('width', '4')
            .attr('height', '8')
            .attr('transform', 'translate(0,0)')
            .attr('fill', '#88AAEE');
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
                if (isRegion) {
                    const region = getRegion(d.properties);
                    if (region) {
                        handleRegionClick(region);
                    }
                    return;
                }

                const country = getCountryA3(d.properties);
                if (country) {
                    handleCountryClick(country);
                }
            });
    }, [handleCountryClick, isRegion, handleRegionClick]);
    useLayoutEffect(() => initializeMap(), []);
    useEffect(fillMap, [fillMap]);
    useEffect(createTooltip, [createTooltip]);

    return (
        <Card>
            <MapContainer id="svg-parent" className="scaling-svg-container">
                <svg id="africa-map" ref={svgNode} />
            </MapContainer>
        </Card>
    );
};

export default React.memo(AfricaMap);
