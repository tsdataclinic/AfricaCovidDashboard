import React, { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import africaTopology from './africa.json';
import * as topojson from 'topojson-client';
import { Topology } from 'topojson-specification';
import styled from 'styled-components';
import { CountryTrend, CountryTrends } from '../../hooks/useCountryTrends';
import { Category, DataType } from '../../types';
import { values, flatten, pick } from 'lodash';
import * as colors from '../../colors';
import { Moment } from 'moment';

interface AfricaMapProps {
    selectedCountry?: string;
    onCountrySelect?: (country: string | undefined) => void;
    date: Moment;
    category: Category;
    dataType: DataType;
    data?: CountryTrends;
}

const MAP_TARGET = '#africa-map';

const topology = (africaTopology as unknown) as Topology;
const feature = topojson.feature(topology, topology.objects.collection);
const africaMapFeatures =
    feature.type === 'FeatureCollection' ? feature.features : [feature];

const AfricaMap: React.FC<AfricaMapProps> = ({
    selectedCountry,
    onCountrySelect,
    date,
    category,
    dataType,
    data
}) => {
    const width = 960;
    const height = 720;
    const projection = d3
        .geoMercator()
        .scale(410)
        .translate([width / 3, height / 2]);

    const path = d3.geoPath().projection(projection);

    const handleCountryClick = useCallback(
        (country: string) => {
            if (Boolean(country)) {
                onCountrySelect?.(country);
            }
        },
        [onCountrySelect]
    );

    const fillMap = () => {
        const svg = d3.select(MAP_TARGET);
        const countries = svg.selectAll('.country-border');
        countries.classed('selected-country', (d: any) => {
            return d.properties.name === selectedCountry;
        });

        // Update colors
        if (data !== undefined) {
            let colorRange = [
                colors.LIGHT_GREY,
                colors.LIGHT_GREEN,
                colors.GREEN
            ];
            switch (category) {
                case 'confirmed':
                    colorRange = [
                        colors.LIGHT_GREY,
                        colors.LIGHT_RED,
                        colors.RED
                    ];
                    break;
                case 'recoveries':
                    colorRange = [
                        colors.LIGHT_GREY,
                        colors.LIGHT_GREEN,
                        colors.GREEN
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
            let extent = d3.extent(
                flatten(values(data).map(d => d.slice(-1))),
                d => d[trendKey] as number
            );
            if (extent[0] == undefined) {
                extent = [0, 1];
            }
            const colorScale = d3
                .scaleLinear()
                .domain(extent)
                // @ts-ignore
                .range(colorRange)
                // @ts-ignore
                .interpolate(d3.interpolateHcl);
            countries
                .transition()
                .duration(1000)
                .style('fill', (d: any) => {
                    const countryData: CountryTrend | undefined = data?.[
                        d.properties.name
                    ]?.slice(-1)[0];
                    if (countryData?.[trendKey] !== undefined) {
                        return colorScale(countryData[trendKey] as number);
                    }
                    return colors.LIGHT_GREY;
                });
        }
    };

    const initializeMap = () => {
        const svg = d3
            .select(MAP_TARGET)
            .attr('width', width)
            .attr('height', height);
        // use Susie Lu's d3-legend plugin
        // http://d3-legend.susielu.com/
        const d3legend = legendColor()
            .shapeWidth(width / 10)
            .cells(9)
            .orient('horizontal')
            .labelOffset(3)
            .ascending(true)
            .labelAlign('middle')
            .shapePadding(2);
        const legend = svg
            .append('g')
            .attr('class', 'legend')
            .attr(
                'transform',
                'translate(' + width / 24 + ',' + (height * 6) / 7 + ')'
            );
        legend.call(d3legend.scale);
        // create background box for zoom
        svg.append('rect')
            .attr('class', 'background')
            .style('background-color', colors.LIGHT_GREY)
            .attr('width', width)
            .attr('height', height);

        const group = svg.append('g').attr('class', 'continent');

        // Draw the countries in the continent
        group
            .selectAll('.countries')
            .data(africaMapFeatures)
            .enter()
            .append('path')
            .attr('class', 'country-border')
            .attr('d', path)
            .on('click', (e: any, d: any) => {
                const country = d.properties?.name;
                if (country) {
                    handleCountryClick(country);
                }
            });

        fillMap();
        setResponsiveSVG();
    };

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

    useLayoutEffect(() => initializeMap(), []);
    useEffect(fillMap, [selectedCountry, category, data, dataType, date]);

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
