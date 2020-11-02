import React, { useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import styled from 'styled-components';
import Timeseries from './Timeseries';
import { DataType, LookBackMonth } from '../types';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';
import { CountryTrend } from '../hooks/useCountryTrends';
import useCountryStats from '../hooks/useCountryStats';

interface TrendProps {
    trendData: CountryTrend[];
    selectedDate?: Moment;
    dataType: DataType;
    country: string;
    allDates: Date[];
}

const safeFormatInteger = (num: number): number => (num ? Math.round(num) : 0);

const Trend = ({
    trendData,
    selectedDate,
    dataType,
    country,
    allDates,
}: TrendProps) => {
    const { t } = useTranslation();
    const [lookback, setLookBack] = useState<LookBackMonth>('beginning');
    const [isLog, setIsLog] = useState(false);
    const [per100K, setPer100K] = useState(false);
    const {
        data: countryStatsData,
        isLoading: countryStatsLoading,
    } = useCountryStats(country);

    const dates = useMemo(() => {
        let pastDates: Date[] = allDates;

        if (selectedDate) {
            pastDates = pastDates.filter((d) =>
                selectedDate.isSameOrAfter(d, 'day')
            );
        }
        if (pastDates.length === 0) {
            return pastDates;
        }
        const lastDate = pastDates[pastDates.length - 1];
        if (lookback === 'beginning') {
            return pastDates;
        }

        if (lookback === 'one_month') {
            const firstDate = moment(lastDate).subtract(1, 'months').toDate();
            return pastDates.filter((d: Date) => d > firstDate);
        }

        if (lookback === 'three_month') {
            const firstDate = moment(lastDate).subtract(3, 'months').toDate();
            return pastDates.filter((d: Date) => d > firstDate);
        }
        return pastDates;
    }, [allDates, lookback, selectedDate]);

    const timeseries = useMemo(() => {
        const populartion = countryStatsData?.population;
        if (populartion && per100K) {
            const multiplier = (1 / populartion) * 100000;
            return trendData.map((item) => ({
                confirmed: safeFormatInteger(item.confirmed * multiplier),
                date: item.date,
                deaths: safeFormatInteger(item.deaths * multiplier),
                new_case: safeFormatInteger(item.new_case * multiplier),
                new_deaths: safeFormatInteger(item.new_deaths * multiplier),
                new_recoveries: safeFormatInteger(
                    item.new_recoveries * multiplier
                ),
                recoveries: safeFormatInteger(item.recoveries * multiplier),
                days_since_first_case: safeFormatInteger(
                    item.days_since_first_case
                ),
            }));
        }
        return trendData;
    }, [trendData, countryStatsData, per100K]);

    if (countryStatsLoading) {
        return <Skeleton active />;
    }

    return (
        <TrendWrapper>
            <Scale>
                <Scale>
                    <Label htmlFor="timeseries-logmode">Logarithmic</Label>
                    <Input
                        id="timeseries-logmode"
                        type="checkbox"
                        checked={isLog}
                        onChange={() => setIsLog(!isLog)}
                    />
                </Scale>
                <Scale>
                    <Label htmlFor="timeseries-100k">Per 100K</Label>
                    <Input
                        id="timeseries-100k"
                        type="checkbox"
                        checked={per100K}
                        onChange={() => setPer100K(!per100K)}
                    />
                </Scale>
            </Scale>

            <Timeseries
                timeseries={timeseries}
                dataType={dataType}
                dates={dates}
                isLog={isLog}
            />
            <Pill>
                {['beginning', 'three_month', 'one_month'].map((option) => (
                    <Button
                        key={option}
                        type="button"
                        className={`${
                            lookback === option ? 'selected' : undefined
                        }`}
                        onClick={() => setLookBack(option as LookBackMonth)}
                    >
                        {t(option)}
                    </Button>
                ))}
            </Pill>
        </TrendWrapper>
    );
};

export default Trend;

const TrendWrapper = styled.div`
    padding: 20px;
`;

const Pill = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    & > button:first-of-type {
        border: 0;
        border-bottom-left-radius: 5px;
        border-top-left-radius: 5px;
    }
`;

const Button = styled.button`
    background-color: rgba(255, 193, 7, 0.12549);
    border: 2px solid rgba(255, 193, 7, 0.12549);
    border-bottom: 0;
    border-top: 0;
    color: #fd7e14;
    cursor: pointer;
    font-size: 10px;
    font-weight: 600;
    margin: 0;
    outline: none;
    padding: 10px 15px;
    text-align: center;
    transition: background 0.25s ease-in-out;
    &.selected {
        background-color: rgba(255, 193, 7, 0.6);
    }
`;

const Scale = styled.div`
    display: flex;
    flex-direction: row;
    margin-right: 1rem;
    margin-bottom: 0.2rem;
`;

const Label = styled.label`
    color: rgba(108, 117, 125, 0.6);
    font-size: 0.75rem;
    font-weight: 900;
    margin-right: 0.25rem;
    z-index: 99;
`;

const Input = styled.input`
    appearance: none;
    background-color: #fff;
    border: 2px solid #d9dadc;
    border-radius: 10px;
    cursor: pointer;
    height: 14px;
    margin: 0;
    outline: none;
    position: relative;
    transition: all 0.3s ease-in-out;
    width: 24px;
    &:after,
    &:checked {
        background-color: rgba(108, 117, 125, 0.6);
        transition: all 0.3s ease-in-out;
    }
    &:after {
        border-radius: 50%;
        content: '';
        height: 10px;
        left: 0;
        position: absolute;
        top: 0;
        width: 10px;
    }
    &:checked:after {
        background-color: #f8f9fa;
        left: 10px;
        transition: all 0.3s ease-in-out;
    }
`;
