import React, { useContext, useMemo, useState } from 'react';
import { Skeleton, Card, Switch } from 'antd';
import styled from 'styled-components';
import Timeseries from './Timeseries';
import { DataType, LookBackMonth } from '../types';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';
import { CountryTrend } from '../hooks/useCountryTrends';
import CountryStatsContext from '../contexts/CountryStatsContext';
import { scaleTrendDatum } from '../utils/trendUtils';
import { GREY } from '../colors';

interface TrendProps {
    trendData: CountryTrend[];
    selectedDate?: Moment;
    dataType: DataType;
    country: string;
    allDates: Date[];
}

const Trend = ({ trendData, selectedDate, dataType, allDates }: TrendProps) => {
    const { t } = useTranslation();
    const [lookback, setLookBack] = useState<LookBackMonth>('beginning');
    const [isLog, setIsLog] = useState(false);
    const [per100K, setPer100K] = useState(false);
    const {
        currentCountryStats: countryStatsData,
        isLoading: countryStatsLoading,
    } = useContext(CountryStatsContext);

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
        const population = countryStatsData?.population;
        const trimData =
            dates.length === 0
                ? []
                : trendData.filter(
                      (countryTrend) =>
                          moment(dates[0]).isSameOrBefore(
                              countryTrend.date,
                              'day'
                          ) &&
                          moment(dates[dates.length - 1]).isSameOrAfter(
                              countryTrend.date,
                              'day'
                          )
                  );
        if (population && per100K) {
            const multiplier = (1 / population) * 100000;
            return trimData.map((item) => scaleTrendDatum(item, multiplier));
        }
        return trimData;
    }, [trendData, countryStatsData, per100K, dates]);

    return (
        <Card>
            <Skeleton active loading={countryStatsLoading}>
                <Scale>
                    <Scale>
                        <Label>
                            {t('Logarithmic')}:&nbsp;
                            <Switch
                                size="small"
                                checked={isLog}
                                onChange={() => setIsLog(!isLog)}
                            />
                        </Label>
                    </Scale>
                    <Scale>
                        <Label>
                            {t('Per 100K')}:&nbsp;
                            <Switch
                                size="small"
                                checked={per100K}
                                onChange={() => setPer100K(!per100K)}
                            />
                        </Label>
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
            </Skeleton>
        </Card>
    );
};

export default Trend;

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
    margin-bottom: 6px;
`;

const Label = styled.label`
    color: ${GREY};
    font-size: 0.75rem;
    font-weight: 900;
    margin-right: 0.25rem;
    z-index: 99;
`;
