import React from 'react';
import AfricaMap from './africa-map/AfricaMap';
import { Col, Row } from 'antd';
import useQueryParams from '../hooks/useQueryParams';
import { useAllCountryTrends } from '../hooks/useCountryTrends';
import StatsBar from './StatsBar';
import Trend from './Trend';
import moment from 'moment';

const Home = () => {
    const {
        country,
        updateCountry,
        dataType,
        category,
        updateQuery,
        selectedDate
    } = useQueryParams();

    const {
        data: allCountryTrends,
        isFetching: isFetchingAllTrends,
        error: allCountryTrendsError
    } = useAllCountryTrends();

    return (
        <Row gutter={[16, 16]}>
            <Col md={24} lg={12}>
                <StatsBar
                    dataType={dataType}
                    category={category}
                    selectCategory={category =>
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
    );
};

export default Home;
