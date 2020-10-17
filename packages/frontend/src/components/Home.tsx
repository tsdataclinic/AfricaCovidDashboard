import React, { useMemo, useCallback } from 'react';
import AfricaMap from './africa-map/AfricaMap';
import { Col, Row, Skeleton } from 'antd';
import useQueryParams from '../hooks/useQueryParams';
import { useAllCountryTrends, CountryTrend } from '../hooks/useCountryTrends';
import StatsBar from './StatsBar';
import Trend from './Trend';
import moment, { Moment } from 'moment';
import DateSlider from './DateSlider';
import { convertDateStrToDate } from '../helper';

const Home = () => {
    const {
        country,
        updateCountry,
        dataType,
        category,
        updateQuery,
        selectedDate,
    } = useQueryParams();

    const {
        data: allCountryTrends,
        isFetching: isFetchingAllTrends,
        isLoading,
    } = useAllCountryTrends();

    const dates = useMemo(() => {
        const selectedTrend: CountryTrend[] = allCountryTrends?.[country] ?? [];
        return selectedTrend.map((item) => convertDateStrToDate(item.date));
    }, [allCountryTrends, country]);

    const onSelectData = useCallback(
        (value: Moment) => {
            updateQuery('selectedDate', value);
        },
        [updateQuery]
    );

    return (
        <div>
            {isLoading ? (
                <Skeleton />
            ) : (
                <DateSlider
                    dates={dates}
                    onUpdate={onSelectData}
                    selectedDate={selectedDate}
                />
            )}

            <Row gutter={[16, 16]}>
                <Col md={24} lg={12}>
                    <StatsBar
                        dataType={dataType}
                        category={category}
                        selectCategory={(category) =>
                            updateQuery('category', category)
                        }
                        loading={isFetchingAllTrends}
                        data={
                            allCountryTrends &&
                            allCountryTrends[country] &&
                            allCountryTrends[country].slice(-1)[0]
                        }
                    />
                    <AfricaMap
                        selectedCountry={country}
                        onCountrySelect={updateCountry}
                        category={category}
                        date={selectedDate || moment()}
                        dataType={dataType}
                        data={allCountryTrends}
                    />
                </Col>
                <Col md={24} lg={12}>
                    <Trend />
                </Col>
            </Row>
        </div>
    );
};

export default Home;
