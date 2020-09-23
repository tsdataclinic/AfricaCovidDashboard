import React from 'react';
import { Row, Col } from 'antd';
import { useParams } from 'react-router-dom';
import { TrendTable } from './TrendTable';
import { CountryStats } from './CountryStats';
import { CountryParam } from '../types';

const Country = () => {
    const { country } = useParams<CountryParam>();

    return (
        <div>
            <Row>
                <Col xs={24} lg={16}>
                    <TrendTable country={country} />
                </Col>

                <Col xs={24} lg={8}>
                    <CountryStats country={country} />
                </Col>
            </Row>
        </div>
    );
};

export default Country;
