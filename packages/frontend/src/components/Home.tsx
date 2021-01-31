import React, { useCallback, useContext, useMemo } from 'react';
import AfricaMap from './africa-map/AfricaMap';
import { Alert, Card, Col, Row } from 'antd';
import {
    CountryTrend,
    useAfricaTrends,
    useAllCountryTrends,
} from '../hooks/useCountryTrends';
import { useAllRegionTrends } from '../hooks/useRegionTrends';
import StatsBar from './StatsBar';
import Trend from './Trend';
import { Moment } from 'moment';
import DateSlider from './DateSlider';
import { convertDateStrToDate } from '../helper';
import QueryParamsContext from '../contexts/QueryParamsContext';
import styled from 'styled-components';
import { Dictionary } from 'lodash';
import QueryControl from './QueryControl';

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

    const currentCountryTrends = useMemo(() => {
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
    ]);

    const dates = useMemo(
        () =>
            currentCountryTrends.map((item) => convertDateStrToDate(item.date)),
        [currentCountryTrends]
    );

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
    }, [currentCountryTrends, selectedDate]);

    const selectedStats = useMemo(
        () =>
            currentCountryTrends.find((item) =>
                selectedDate?.isSame(item.date, 'day')
            ),
        [selectedDate, currentCountryTrends]
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
        <HomeWrapper>
            <Row gutter={LAYOUT_GUTTER}>
                <Col span={24}>
                    <Card>
                        <DateSlider
                            dates={dates}
                            onUpdate={onSelectDate}
                            selectedDate={selectedDate}
                        />
                        <QueryControl
                            region={region}
                            country={country}
                            dataType={dataType}
                            isRegion={isRegion}
                            updateQuery={updateQuery}
                        />
                    </Card>
                </Col>
            </Row>
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
                        trendData={selectedStatsByCountry}
                        loading={isLoading}
                        isRegion={isRegion}
                        selectedRegion={region}
                    />
                </Col>
                <Col xs={24} xl={12}>
                    <Trend
                        trendData={currentCountryTrends}
                        allDates={dates}
                        selectedDate={selectedDate}
                        dataType={dataType}
                        country={country}
                    />
                </Col>
            </Row>
        </HomeWrapper>
    );
};

const HomeWrapper = styled.div`
    padding: 16px;
`;

const StyledAlert = styled(Alert)`
    margin: 0 20px;
`;

export default Home;
