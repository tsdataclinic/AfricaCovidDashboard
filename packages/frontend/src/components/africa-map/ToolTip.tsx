import React, { useContext } from 'react';
import styled from 'styled-components';
import * as colors from '../../colors';
import { useTranslation } from 'react-i18next';
import { StatsMap } from '../../contexts/StatsContext';
import { formatNumber } from '../../utils/trendUtils';
import { getStatistic } from '../../helper';
import { DataType } from '../../types';
import { CountryProperties } from './types';
import { CountryTrend } from '../../hooks/useCountryTrends';
import StatsContext from '../../contexts/StatsContext';
import { countryNameMapping } from '../../utils';

interface ToolTipProps {
    country: string;
    countryProperties: CountryProperties;
    dataType: DataType;
    statsMap: StatsMap;
    trendData: CountryTrend;
    isPer100k?: boolean;
    isPrediction?: boolean;
    x: number;
    y: number;
}

const ToolTipContainer = styled.div<{ x: number; y: number }>`
    position: absolute;
    z-index: 1;
    pointer-events: none;
    top: ${({ y }) => y}px;
    left: ${({ x }) => x}px;
    background-color: rgba(0, 0, 0, 0.9);
    padding: 20px;
    .confirmed {
        color: ${colors.RED};
    }
    .recovered {
        color: ${colors.BLUE};
    }
    .deaths {
        color: ${colors.LIGHT_PURPLE};
    }
    h3,
    p {
        color: ${colors.WHITE};
    }
    h3 {
        padding: 10px 12px;
    }
    .per100k {
        color: ${colors.WHITE};
        font-style: italic;
    }
`;

const ToolTipStats = styled.ul`
    text-align: left;
    list-style: none;
    color: white;
    padding: 0 12px;
    li {
        margin-bottom: 10px;
        line-height: 16px;
        .label {
            font-weight: bold;
            display: block;
        }
    }
`;

export const ToolTip: React.FC<ToolTipProps> = ({
    country,
    countryProperties,
    dataType,
    statsMap,
    trendData,
    isPer100k,
    isPrediction,
    x,
    y,
}) => {
    const { t } = useTranslation();
    const { allStats } = useContext(StatsContext);

    const regionPop =
        allStats[
            countryProperties.region === 'Middle Africa'
                ? 'Central Africa'
                : countryProperties.region
        ];
    const countryStat = allStats[countryProperties.iso3];

    const asterisk = isPer100k ? <sup>*</sup> : null;

    return (
        <ToolTipContainer x={x} y={y}>
            <h3>{countryNameMapping(countryProperties.COUNTRY_NA)}</h3>
            <ToolTipStats>
                <li>
                    <span className="label">{t('Population Estimate')}</span>
                    {countryStat ? formatNumber(countryStat.population) : 'NA'}
                </li>
                <li>
                    <span className="label">{t('Region')}</span>
                    {countryProperties.region}
                </li>
                <li>
                    <span className="label">{t('Region Population')}</span>
                    {regionPop ? formatNumber(regionPop.population) : 'NA'}
                </li>
                <li>
                    <span className="label confirmed">
                        {isPrediction ? t('Predicted Cases') : t('Confirmed')}
                        {asterisk}:
                    </span>

                    {formatNumber(
                        getStatistic(dataType, 'confirmed', trendData)
                    )}
                </li>
                <li>
                    <span className="label recovered">
                        {t('Recovered')}
                        {asterisk}:
                    </span>
                    {isPrediction
                        ? 'Unavailable'
                        : formatNumber(
                              getStatistic(dataType, 'recoveries', trendData)
                          )}
                    &nbsp;
                </li>
                <li>
                    <span className="label deaths">
                        {t('Deaths')}
                        {asterisk}
                    </span>

                    {!isPrediction
                        ? 'Unavailable'
                        : formatNumber(
                              getStatistic(dataType, 'deaths', trendData)
                          )}
                </li>
                {isPer100k && (
                    <li>
                        <span className="per100k">
                            {' '}
                            <sup>*</sup>per 100K pop.
                        </span>
                    </li>
                )}
            </ToolTipStats>
        </ToolTipContainer>
    );
};
