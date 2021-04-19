import React from 'react';
import styled from 'styled-components';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { HINT_GREY } from '../colors';

interface InfoTooltipProps {
    message: string;
    top?: number;
    right?: number;
}

const InfoTooltip = ({ message, top = 20, right = 20 }: InfoTooltipProps) => (
    <Info top={top} right={right}>
        <Tooltip title={message} placement="topRight" arrowPointAtCenter>
            <InfoCircleOutlined />
        </Tooltip>
    </Info>
);

export default InfoTooltip;

const Info = styled.button<{ top: number; right: number }>`
    position: absolute;
    top: ${(props) => props.top}px;
    right: ${(props) => props.right}px;
    color: ${HINT_GREY};
    background: none;
    border: none;
    padding: 0;
    :active,
    :focus {
        outline: none;
    }
`;
