import { CountryProperties } from './types';
import { CountryTrend } from '../../hooks/useCountryTrends';
import { css } from 'styled-components';
import { memoize } from 'lodash';
import * as colors from '../../colors';
import { format } from 'd3';

const formatNumber = format(',');
const formatDelta = format('+,');
function getTooltipContent(
    countryProperties: CountryProperties,
    trendData?: CountryTrend
) {
    let content = `<p>No data available</p>`;
    if (trendData !== undefined) {
        content = `
      <ul class="tooltip-stats">
        <li><span class="label">Population Estimate:&nbsp;</span>${formatNumber(
            countryProperties.pop_est
        )}</li>
        <li>
          <span class="label confirmed">Confirmed:&nbsp;</span>
          ${formatNumber(
              trendData.confirmed
          )}&nbsp;<span class="delta">${formatDelta(trendData.new_case)}</span>
        </li>
        <li>
          <span class="label recovered">Recovered:&nbsp;</span>
          ${formatNumber(
              trendData.deaths
          )}&nbsp;<span class="delta">${formatDelta(
            trendData.new_recoveries
        )}</span>
        </li>
        <li>
          <span class="label deaths">Deaths:&nbsp;</span>
          ${formatNumber(
              trendData.recoveries
          )}&nbsp;<span class="delta">${formatDelta(
            trendData.new_deaths
        )}</span>
        </li>
      </ul>
    `;
    }

    return `
<div class="tooltip-content">
  <h3>
    ${countryProperties.name_long}
  </h3>
  <div>
  ${content}
  </div>
</div>
  `;
}

export default memoize(getTooltipContent);

export const tooltipCSS = css`
    .tooltip-content {
        height: 100%;
        width: 100%;

        .confirmed {
            color: ${colors.RED};
        }
        .recovered {
            color: ${colors.GREEN};
        }
        .deaths {
            color: ${colors.GREY};
        }
        h3,
        p {
            color: ${colors.WHITE};
        }
        h3 {
            padding: 10px 12px;
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
