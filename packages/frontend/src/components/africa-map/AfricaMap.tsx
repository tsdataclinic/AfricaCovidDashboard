import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import africaTopology from './africa.json';
import * as topojson from 'topojson-client';
import { Topology } from 'topojson-specification';
import styled from 'styled-components';

interface AfricaMapProps {
    selectedCountry?: string;
    onCountrySelect?: (country: string | undefined) => void;
    category?: string;
}

const MAP_TARGET = '#africa-map';

const topology = (africaTopology as unknown) as Topology;
const feature = topojson.feature(topology, topology.objects.collection);
const africaMapFeatures =
    feature.type === 'FeatureCollection' ? feature.features : [feature];

const AfricaMap: React.FC<AfricaMapProps> = ({
    selectedCountry,
    onCountrySelect,
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
            if (selectedCountry === country) {
                onCountrySelect?.(undefined);
            } else {
                onCountrySelect?.(country);
            }
        },
        [onCountrySelect]
    );

    const fillMap = () => {
        const svg = d3.select(MAP_TARGET);
        const countries = svg.selectAll('.country-border');
        countries
            .classed('selected-country', (d: any) => {
                return d.properties.name === selectedCountry;
            })
            .on('click', (e: any, d: any) => {
                const country = d.properties?.name;
                if (country) {
                    handleCountryClick(country);
                }
            })
            .transition()
            .duration(1000)
            .style('fill', (d) => {
                return '#ccc';
            });
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
            .style('background-color', '#eff2f5')
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
            .attr('d', path);

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
    useEffect(fillMap, [selectedCountry]);

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
export default AfricaMap;
