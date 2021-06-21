import React, { useCallback, useContext, useMemo } from 'react';
import { AfricaMap } from './africa-map/AfricaMap2';
import { Alert, Col, Row } from 'antd';
import {
    CountryTrend,
    CountryTrends,
    TrendMap,
    useAfricaTrends,
    useAllCountryTrends,
} from '../hooks/useCountryTrends';
import { useAllRegionTrends } from '../hooks/useRegionTrends';
import StatsBar from './stats-bar/StatsBar';
import Trend from './Trend';
import moment, { Moment } from 'moment';
import { convertDateStrToDate } from '../helper';
import QueryParamsContext from '../contexts/QueryParamsContext';
import styled from 'styled-components';
import { Dictionary, uniq } from 'lodash';
import Controls from './controls/Controls';
import useTrendsScale from '../hooks/useTrendsScale';
import { useGlobalRanges } from '../hooks/useGlobalRanges';

const LAYOUT_GUTTER: [number, number] = [16, 16];

const Home = () => {
    const {
        country,
        region,
        isRegion,
        dataType,
        category,
        updateQuery,
        selectedDate,
        isLog,
        per100K,
    } = useContext(QueryParamsContext);

    const {
        data: allCountryTrends,
        error: allTrendsError,
        isLoading: allTrendsLoading,
    } = useAllCountryTrends();

    const {
        data: allRegionTrends,
        error: allRegionTrendsError,
        isLoading: allRegionLoading,
    } = useAllRegionTrends();

    const {
        data: africaTrends,
        error: africaTrendsError,
        isLoading: africaTrendsLoading,
    } = useAfricaTrends();
    //Calculates an absolute range across all time periopds for the mapo

    const dailyRange = useGlobalRanges(
        allCountryTrends?.rolling7Days,
        per100K,
        isLog
    );

    const currentTrends = useMemo(
        () =>
            getTrendDate(
                false,
                isRegion,
                region,
                country,
                africaTrends,
                allRegionTrends,
                allCountryTrends,
                allRegionTrendsError,
                allTrendsError
            ),
        [
            allCountryTrends,
            allTrendsError,
            country,
            region,
            allRegionTrends,
            isRegion,
            africaTrends,
            allRegionTrendsError,
        ]
    );

    const rawTrends = useMemo(
        () =>
            getTrendDate(
                true,
                isRegion,
                region,
                country,
                africaTrends,
                allRegionTrends,
                allCountryTrends,
                allRegionTrendsError,
                allTrendsError
            ),
        [
            allCountryTrends,
            allTrendsError,
            country,
            region,
            allRegionTrends,
            isRegion,
            africaTrends,
            allRegionTrendsError,
        ]
    );

    const { timeseries, statsLoading } = useTrendsScale(currentTrends);
    const { timeseries: rawTimeseries } = useTrendsScale(rawTrends);

    const dates = useMemo(
        () =>
            uniq(
                timeseries
                    .map((item) => convertDateStrToDate(item.date))
                    .sort((a, b) => a.valueOf() - b.valueOf())
            ),
        [timeseries]
    );

    const lastNonPredictedDate: Moment | undefined = useMemo(() => {
        if (!currentTrends || !currentTrends[0]) {
            return undefined;
        }
        let lastDate = moment(currentTrends[0].date);
        currentTrends.forEach((item) => {
            if (lastDate.isBefore(item.date) && !item.confirmed_prediction) {
                lastDate = moment(item.date);
            }
        });
        return lastDate;
    }, [currentTrends]);

    const onSelectDate = useCallback(
        (value: Moment) => {
            updateQuery('selectedDate', value);
        },
        [updateQuery]
    );

    const selectedStatsByCountry:
        | Dictionary<CountryTrend>
        | undefined = useMemo(() => {
        if (!allCountryTrends || !selectedDate) {
            return undefined;
        }

        const dictionary: Dictionary<CountryTrend> = {};
        Object.keys(allCountryTrends?.rolling7Days).forEach((country) => {
            const trend = allCountryTrends?.rolling7Days[country]?.find((t) =>
                selectedDate.isSame(t.date, 'day')
            );
            if (trend) {
                dictionary[country] = trend;
            }
        });
        return dictionary;
    }, [selectedDate, allCountryTrends]);

    const selectedStats = useMemo(
        () => timeseries.find((item) => selectedDate?.isSame(item.date, 'day')),
        [selectedDate, timeseries]
    );

    const isLoading =
        allTrendsLoading || africaTrendsLoading || allRegionLoading;
    const error = country
        ? allTrendsError
        : region
        ? allRegionTrendsError
        : africaTrendsError;

    if (error) {
        return (
            <StyledAlert
                message="Error retrieving data. Please reload to try again."
                type="error"
            />
        );
    }

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <Controls
                dates={dates}
                selectedDate={selectedDate}
                onUpdate={onSelectDate}
                lastNonPredictedDate={lastNonPredictedDate}
            />
            <HomeWrapper>
                <Row style={{ height: '100%' }} gutter={LAYOUT_GUTTER}>
                    <Col xs={24} xl={12}>
                        <StatsBar
                            selectedCountry={country}
                            dataType={dataType}
                            category={category}
                            selectCategory={(category) =>
                                updateQuery('category', category)
                            }
                            loading={isLoading}
                            data={selectedStats}
                        />
                        <AfricaMap
                            selectedCountry={country}
                            onCountrySelect={(newCountry) => {
                                if (country === newCountry) {
                                    updateQuery('country', '');
                                } else {
                                    updateQuery('country', newCountry);
                                }
                            }}
                            onRegionSelect={(newRegion) => {
                                if (newRegion === region) {
                                    updateQuery('region', '');
                                } else {
                                    updateQuery('region', newRegion);
                                }
                            }}
                            category={category}
                            dataType={dataType}
                            dailyRange={dailyRange}
                            trendData={selectedStatsByCountry}
                            loading={isLoading}
                            isRegion={isRegion}
                            selectedRegion={region}
                            isLog={isLog}
                            per100k={per100K}
                        />
                    </Col>
                    <Col xs={24} xl={12}>
                        <Trend
                            trendData={timeseries}
                            rawDailyTimeseries={rawTimeseries}
                            dates={dates}
                            isLog={isLog}
                            dataType={dataType}
                            statsLoading={statsLoading}
                            selectedDate={selectedDate}
                            country={country}
                            onSelectDate={onSelectDate}
                        />
                    </Col>
                </Row>
            </HomeWrapper>
        </div>
    );
};

const HomeWrapper = styled.div`
    padding: 16px;
    flex: 1;
    width: 100%;
    height: 100%;
`;

const StyledAlert = styled(Alert)`
    margin: 0 20px;
`;

export default Home;

const getTrendDate = (
    isRawDaily: boolean,
    isRegion: boolean,
    region: string | undefined,
    country: string | undefined,
    africaTrends: TrendMap<CountryTrend[]> | undefined,
    allRegionTrends: TrendMap<CountryTrends> | undefined,
    allCountryTrends: TrendMap<CountryTrends> | undefined,
    allRegionTrendsError: Error | null,
    allTrendsError: Error | null
): CountryTrend[] => {
    if ((isRegion && !region) || (!isRegion && !country)) {
        // If no country or region is selected lets show all the stats
        return isRawDaily
            ? africaTrends?.rawDaily ?? []
            : africaTrends?.rolling7Days ?? [];
    }

    // Region data
    if (isRegion) {
        if (
            allRegionTrendsError ||
            !allRegionTrends ||
            !region ||
            !(region in allRegionTrends)
        ) {
            return [];
        }

        return isRawDaily
            ? allRegionTrends.rawDaily[region] ?? []
            : allRegionTrends.rolling7Days[region] ?? [];
    }

    // Country data
    if (
        allTrendsError ||
        !allCountryTrends?.rolling7Days ||
        !country ||
        !(country in allCountryTrends.rolling7Days)
    ) {
        return [];
    }
    return isRawDaily
        ? allCountryTrends.rawDaily[country] ?? []
        : allCountryTrends.rolling7Days[country] ?? [];
};
