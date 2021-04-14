import { CountryProperties } from './types';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { css } from 'styled-components';
import * as colors from '../../colors';
import { TFunction } from 'i18next';
import { getCountryName } from '../../utils/i18nUtils';
import { getCountryA3 } from './utils';
import { StatsMap } from '../../contexts/StatsContext';
import { formatNumber } from '../../utils/trendUtils';
import { getStatistic } from '../../helper';
import { DataType } from '../../types';

function getTooltipContent(
    t: TFunction,
    countryProperties: CountryProperties,
    dataType: DataType,
    statsMap?: StatsMap,
    trendData?: CountryTrend,
    isPer100K?: boolean
) {
    const regionPop = statsMap?.[countryProperties.subregion]?.population;
    let content = `<p>${t('No data available')}</p>`;
    if (trendData !== undefined) {
        const per100k = isPer100K
            ? `<li><span class="per100k"> <sup>*</sup>per 100K pop.</span></li>`
            : '';
        const asterisk = isPer100K ? `<sup>*</sup>` : '';
        content = `
      <ul class="tooltip-stats">
        <li><span class="label">${t(
            'Population Estimate'
        )}:&nbsp;</span>${formatNumber(countryProperties.pop_est)}</li>
        <li>
        <li><span class="label">${t('Region')}:&nbsp;</span>${
            countryProperties.subregion
        }</li>
        <li><span class="label">${t('Region Population')}:&nbsp;</span>${
            regionPop ? formatNumber(regionPop) : 'NA'
        }</li>
        <li>
          <span class="label confirmed">${
              trendData.isPrediction ? t('Predicted Cases') : t('Confirmed')
          }${asterisk}:</span>
          ${formatNumber(getStatistic(dataType, 'confirmed', trendData))}&nbsp;
        </li>
        <li>
          <span class="label recovered">${t(
              'Recovered'
          )}${asterisk}:&nbsp;</span>
          ${formatNumber(getStatistic(dataType, 'recoveries', trendData))}&nbsp;
        </li>
        <li>
          <span class="label deaths">${t('Deaths')}${asterisk}:&nbsp;</span>
          ${formatNumber(getStatistic(dataType, 'deaths', trendData))}&nbsp
        </li>
        ${per100k}
      </ul>
    `;
    }

    const countryName =
        getCountryName(getCountryA3(countryProperties)) ||
        countryProperties.name;
    return `
<div class="tooltip-content">
  <h3>
  ${countryName}
  </h3>
  ${content}
</div>
  `;
}

export default getTooltipContent;

export const tooltipCSS = css`
    .tooltip-content {
        height: 100%;
        width: 100%;

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
        .tooltip-stats {
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
        }
    }
`;
