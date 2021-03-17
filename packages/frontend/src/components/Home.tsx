import React, { useCallback, useContext, useMemo } from 'react';
import AfricaMap from './africa-map/AfricaMap';
import { Alert, Col, Row } from 'antd';
import {
    CountryTrend,
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

    const dailyRange = useGlobalRanges(allCountryTrends, per100K, isLog);

    const currentTrends = useMemo(() => {
        if ((isRegion && !region) || (!isRegion && !country)) {
            // If no country or region is selected lets show all the stats
            return africaTrends || [];
        }

        // Region data
        if (isRegion) {
            if (
                allRegionTrendsError ||
                !allRegionTrends ||
                !(region in allRegionTrends)
            ) {
                return [];
            }

            return allRegionTrends[region];
        }

        // Country data
        if (
            allTrendsError ||
            !allCountryTrends ||
            !(country in allCountryTrends)
        ) {
            return [];
        }
        return allCountryTrends[country];
    }, [
        allCountryTrends,
        allTrendsError,
        country,
        region,
        allRegionTrends,
        isRegion,
        africaTrends,
        allRegionTrendsError,
    ]);
    const { timeseries, statsLoading } = useTrendsScale(currentTrends);

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
        Object.keys(allCountryTrends).forEach((country) => {
            const trend = allCountryTrends[country].find((t) =>
                selectedDate.isSame(t.date)
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
        <>
            <Controls
                dates={dates}
                selectedDate={selectedDate}
                onUpdate={onSelectDate}
                lastNonPredictedDate={lastNonPredictedDate}
            />
            <HomeWrapper>
                <Row gutter={LAYOUT_GUTTER}>
                    <Col xs={24} xl={12}>
                        <StatsBar
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
                            onCountrySelect={(country) =>
                                updateQuery('country', country)
                            }
                            onRegionSelect={(region) =>
                                updateQuery('region', region)
                            }
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
                            dates={dates}
                            isLog={isLog}
                            dataType={dataType}
                            statsLoading={statsLoading}
                            selectedDate={selectedDate}
                        />
                    </Col>
                </Row>
            </HomeWrapper>
        </>
    );
};

const HomeWrapper = styled.div`
    padding: 16px;
`;

const StyledAlert = styled(Alert)`
    margin: 0 20px;
`;

export default Home;
