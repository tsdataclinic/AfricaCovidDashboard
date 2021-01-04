import { CountryProperties } from './types';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { css } from 'styled-components';
import * as colors from '../../colors';
import { format } from 'd3';
import { TFunction } from 'i18next';
import { getCountryName } from '../../utils/i18nUtils';

const formatNumber = (num: number) => (num ? format(',')(num) : '-');
const formatDelta = (num: number) => (num ? format('+,')(num) : '-');
function getTooltipContent(
    t: TFunction,
    countryProperties: CountryProperties,
    trendData?: CountryTrend,
    isPer100K?: boolean
) {
    let content = `<p>${t('No data available')}</p>`;
    if (trendData !== undefined) {
        const per100k = isPer100K
            ? `<li><span class="per100k"><sup>*</sup>per 100K pop.</span></li>`
            : '';
        const asterisk = isPer100K ? `<sup>*</sup>` : '';
        content = `
      <ul class="tooltip-stats">
        <li><span class="label">${t(
            'Population Estimate'
        )}:&nbsp;</span>${formatNumber(countryProperties.pop_est)}</li>
        <li>
          <span class="label confirmed">${
              trendData.isPrediction ? t('Predicted Cases') : t('Confirmed')
          }${asterisk}:</span>
          ${formatNumber(
              trendData.confirmed_prediction
                  ? trendData.confirmed_prediction
                  : trendData.confirmed
          )}&nbsp;<span class="delta">${formatDelta(trendData.new_case)}</span>
        </li>
        <li>
          <span class="label recovered">${t(
              'Recovered'
          )}${asterisk}:&nbsp;</span>
          ${formatNumber(
              trendData.deaths
          )}&nbsp;<span class="delta">${formatDelta(
            trendData.new_recoveries
        )}</span>
        </li>
        <li>
          <span class="label deaths">${t('Deaths')}${asterisk}:&nbsp;</span>
          ${formatNumber(
              trendData.recoveries
          )}&nbsp;<span class="delta">${formatDelta(
            trendData.new_deaths
        )}</span>
        </li>
        ${per100k}
      </ul>
    `;
    }

    return `
<div class="tooltip-content">
  <h3>
  ${getCountryName(countryProperties.iso_a3)}
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
            color: ${colors.ORANGE};
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
                .delta {
                    font-size: smaller;
                }
            }
        }
    }
`;
