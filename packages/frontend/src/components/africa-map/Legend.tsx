import { numericToAlpha3 } from 'i18n-iso-countries';
import React from 'react';
import styled from 'styled-components';

const LegendOuter = styled.div`
    display: none;
    position: absolute;
    @media (min-width: 768px) {
        display: block;
    }
    background-color: rgba(255, 255, 255, 0.9);
    bottom: 10px;
    left: 10px;
    padding: 10px;
    text-align: left;

    ul {
        margin: 0px;
        padding: 0px;
        list-style: none;
        display: flex;
        @media (min-width: 768px) {
            flex-direction: column;
        }
        flex-direction: row;
        li {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
    }
`;
const ColorBox = styled.div<{ color: string }>`
    width: 10px;
    height: 10px;
    border: solid black 1px;
    background-color: ${({ color }) => color};
    margin-right: 10px;
`;
interface LegendProps {
    colors: string[];
    bins: number[];
    header: string;
}

const formatNumber = (val: number) => {
    return val.toLocaleString('en-US', { maximumSignificantDigits: 2 });
};

const binLabel = (bins: number[], index: number) => {
    if (index === bins.length) {
        return `> ${formatNumber(bins[index - 1])}`;
    } else if (index === 0) {
        return `< ${formatNumber(bins[index])}`;
    } else {
        return `> ${formatNumber(bins[index - 1])} - ${formatNumber(
            bins[index]
        )}`;
    }
};

export const Legend: React.FC<LegendProps> = ({ header, colors, bins }) => {
    console.log(header, colors, bins);
    return (
        <LegendOuter>
            <h4>{header}</h4>
            {bins && bins.length > 0 && bins.filter((b) => b).length > 0 && (
                <ul>
                    <li>
                        <ColorBox color="white" /> 0
                    </li>
                    {colors.map((col, index) => (
                        <li>
                            <ColorBox color={`rgba(${col.join(',')})`} />
                            {binLabel(bins, index)}
                        </li>
                    ))}
                </ul>
            )}
        </LegendOuter>
    );
};
