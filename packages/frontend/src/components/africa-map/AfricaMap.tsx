import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import africaTopology from './africa.json';
import * as topojson from 'topojson-client';
import { Topology } from 'topojson-specification';
import styled from 'styled-components';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { Category, DataType } from '../../types';
import { values } from 'lodash';
import * as colors from '../../colors';

interface AfricaMapProps {
    category: Category;
    dataType: DataType;
    selectedCountry?: string;
    onCountrySelect?: (country: string | undefined) => void;
    data?: { [k in string]: CountryTrend }; // Data should be a map of country A3 to trend datum
    loading?: boolean;
}

const MAP_TARGET = '#africa-map';

const topology = (africaTopology as unknown) as Topology;
const feature = topojson.feature(topology, topology.objects.collection);
const africaMapFeatures =
    feature.type === 'FeatureCollection' ? feature.features : [feature];

const AfricaMap: React.FC<AfricaMapProps> = ({
    category,
    dataType,
    selectedCountry,
    onCountrySelect,
    data,
}) => {
    const width = 960;
    const height = 720;

    const handleCountryClick = useCallback(
        (country: string) => {
            if (!Boolean(country)) {
                return;
            }
            if (country !== selectedCountry) {
                onCountrySelect?.(country);
            } else {
                onCountrySelect?.(undefined);
            }
        },
        [onCountrySelect, selectedCountry]
    );

    const fillMap = useCallback(() => {
        const svg = d3.select(MAP_TARGET);
        const countries = svg.selectAll('.country-border');
        countries.classed('selected-country', (d: any) => {
            return d.properties.sov_a3 === selectedCountry;
        });

        // Update colors
        if (data !== undefined) {
            let colorRange = [
                colors.LIGHT_GREY,
                colors.LIGHT_GREEN,
                colors.GREEN,
            ];
            switch (category) {
                case 'confirmed':
                    colorRange = [
                        colors.LIGHT_GREY,
                        colors.LIGHT_RED,
                        colors.RED,
                    ];
                    break;
                case 'recoveries':
                    colorRange = [
                        colors.LIGHT_GREY,
                        colors.LIGHT_GREEN,
                        colors.GREEN,
                    ];
                    break;
                case 'deaths':
                    colorRange = [colors.LIGHT_GREY, colors.GREY];
                    break;
            }
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
                    trendKey = 'confirmed';
                } else if (category === 'recoveries') {
                    trendKey = 'recoveries';
                } else if (category === 'deaths') {
                    trendKey = 'deaths';
                }
            }
            let extent = d3.extent(values(data), (d) =>
                typeof d[trendKey] === 'number' ? (d[trendKey] as number) : 0
            );

            if (extent[0] === undefined) {
                extent = [1, 1];
            }
            const maxPowerOfTen = Math.ceil(Math.log10(extent[1]));
            extent[1] = Math.pow(10, maxPowerOfTen);
            extent[0] = 1;
            const colorScale = d3
                .scaleLog()
                .domain(extent)
                // @ts-ignore
                .range(colorRange)
                // @ts-ignore
                .interpolate(d3.interpolateHcl);

            // update the legend color
            var legend = legendColor()
                .labelFormat(d3.format(',.2r'))
                // .useClass(true)
                .cells(colorScale.ticks(Math.min(5, maxPowerOfTen)))
                .labelOffset(3)
                .shapePadding(2)
                .scale(colorScale);

            svg.select('.legend').remove();

            svg.select('.legend-container')
                .append('g')
                .attr('class', 'legend')
                .call(legend);
            countries
                .transition()
                .duration(1000)
                .style('fill', (d: any) => {
                    const countryCode = d.properties.sov_a3 as string;
                    if (!(countryCode in data)) {
                        return colors.DARK_GREY;
                    }
                    const countryData: CountryTrend | undefined =
                        data?.[d.properties.sov_a3];
                    if (countryData?.[trendKey] !== undefined) {
                        return colorScale(
                            Math.max(1, countryData[trendKey] as number)
                        );
                    }
                    return colors.LIGHT_GREY;
                });
        }
    }, [selectedCountry, category, data, dataType]);

    const initializeMap = useCallback(() => {
        const svg = d3
            .select(MAP_TARGET)
            .attr('width', width)
            .attr('height', height);

        // PLace legend target onto the map
        svg.append('g')
            .attr('class', 'legend-container')
            .attr('transform', 'translate(20,20)');

        // create background box for zoom
        svg.append('rect')
            .attr('class', 'background')
            .style('background-color', colors.LIGHT_GREY)
            .attr('width', width)
            .attr('height', height);

        const group = svg.append('g').attr('class', 'continent');

        const projection = d3
            .geoMercator()
            .scale(410)
            .translate([width / 3, height / 2]);

        const path = d3.geoPath().projection(projection);
        // Draw the countries in the continent
        group
            .selectAll('.countries')
            .data(africaMapFeatures)
            .enter()
            .append('path')
            .attr('class', 'country-border')
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

        svgParent.style('padding-bottom', calcString);
    };

    // Set up onClick handler
    useEffect(() => {
        d3.select('.continent')
            .selectAll('.country-border')
            .on('click', (e: any, d: any) => {
                const country = d.properties?.sov_a3;
                if (country) {
                    handleCountryClick(country);
                }
            });
    }, [handleCountryClick]);
    useLayoutEffect(() => initializeMap(), []);
    useEffect(fillMap, [fillMap]);

    return (
        <MapContainer id="svg-parent" className="scaling-svg-container">
            <svg id="africa-map" />
        </MapContainer>
    );
};

const MapContainer = styled.div`
    .background {
        fill: #f5f5f5;
        fill-opacity: 0.5;
    }
    .country-border {
        fill: none;
        stroke: #000000;
        stroke-width: 0.5px;
        pointer-events: all;
        stroke-linejoin: round;
        stroke-linecap: round;
        cursor: pointer;
        &.selected-country {
            stroke-width: 3px;
        }
    }
`;
export default React.memo(AfricaMap);
