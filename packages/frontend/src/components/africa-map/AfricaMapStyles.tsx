import styled from 'styled-components';
import * as colors from '../../colors';
import { tooltipCSS } from './getTooltipContent';

export const TOOLTIP_HEIGHT = 350;
export const TOOLTIP_WIDTH = 200;

export const MapContainer = styled.div<{ selectedAll: boolean }>`
    .background {
        fill-opacity: 0;
    }
    .continent {
        .country-border {
            fill: none;
            stroke: ${colors.BLACK};
            stroke-width: 0.5px;
            pointer-events: all;
            stroke-linejoin: round;
            stroke-linecap: round;
            opacity: ${(props) => (props.selectedAll ? 1 : 0.4)};
            &.selected-country {
                stroke-width: 3px;
                opacity: 1;
            }
            &.loading {
                fill: ${colors.LIGHT_GREY};
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
            background-color: ${colors.DARK_GREY};
        }
        ${tooltipCSS}
    }
`;
