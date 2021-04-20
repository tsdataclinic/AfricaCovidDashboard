import React from 'react';
import { useTranslation } from 'react-i18next';

import {
    AboutPage,
    ProjectInfoSection,
    Body,
    Header,
    DataClinicSection,
    ContributeSection,
    DCLogoWhite,
    AboutPageSegment,
    Contribute,
    Ideas,
    Analytics,
    Datasets,
    IconColumn,
    TextColumn,
    SubHeader,
} from '@dataclinic/dataclinic';

const DataSources = [
    'DataSources_0',
    'DataSources_1',
    'WhoCIADSI_0',
    'WhoDC_0',
    'WhoDC_1',
    'WhoDC_2',
];
const About = () => {
    const { t } = useTranslation();
    return (
        <div style={{ textAlign: 'left' }}>
            <AboutPage>
                <AboutPageSegment
                    style={{ backgroundColor: 'white', color: '#103470' }}
                    imageLocation="right"
                >
                    <TextColumn>
                        <SubHeader>{t('Intro_subheader')}</SubHeader>
                        <Header style={{ color: '#103470' }}>
                            {t('Intro_0')}
                        </Header>
                        <Body>{t('Intro_1')}</Body>
                        <Body
                            dangerouslySetInnerHTML={{ __html: t('Intro_2') }}
                        ></Body>
                        <Body
                            dangerouslySetInnerHTML={{ __html: t('Intro_3') }}
                        ></Body>
                        <Body
                            dangerouslySetInnerHTML={{ __html: t('Intro_4') }}
                        ></Body>
                        <Body
                            dangerouslySetInnerHTML={{ __html: t('Intro_5') }}
                        ></Body>

                        <Body
                            dangerouslySetInnerHTML={{ __html: t('Intro_6') }}
                            style={{
                                backgroundColor: '#F0F5FF',
                                padding: '10px',
                                borderRadius: '10px',
                            }}
                        ></Body>
                        <Body
                            dangerouslySetInnerHTML={{ __html: t('Intro_7') }}
                            style={{
                                backgroundColor: '#F0F5FF',
                                padding: '10px',
                                borderRadius: '10px',
                            }}
                        ></Body>
                    </TextColumn>
                    <IconColumn>
                        <Contribute
                            style={{ width: '400px', height: '400px' }}
                        />
                    </IconColumn>
                </AboutPageSegment>
                <AboutPageSegment
                    style={{ backgroundColor: '#F0F5FF', color: '#103470' }}
                >
                    <TextColumn>
                        <Header style={{ color: '#103470' }}>
                            {t('AboutModel_header')}
                        </Header>
                        <Body>{t('AboutModel_0')}</Body>
                        <Body
                            style={{
                                backgroundColor: '#D6e4ff',
                                padding: '20px',
                                borderRadius: '10px',
                            }}
                        >
                            {t('AboutModel_1')}
                            <br />
                            {t('AboutModel_2')}
                        </Body>
                        <Body>
                            {t('AboutModel_3_1')}
                            <a
                                target="_blank"
                                href={
                                    'https://github.com/tmh741/AFCOVIDDashboard'
                                }
                            >
                                {' ' + t('AboutModel_link')}
                            </a>
                            {t('AboutModel_3_2')}
                        </Body>
                    </TextColumn>
                    <IconColumn>
                        <Analytics
                            style={{ width: '400px', height: '400px' }}
                        />
                    </IconColumn>
                </AboutPageSegment>
                <AboutPageSegment
                    id="DataSources"
                    style={{ backgroundColor: 'white', color: '#103470' }}
                    imageLocation="left"
                >
                    <TextColumn>
                        <Header style={{ color: '#103470' }}>
                            {t('DataSources_header')}
                        </Header>
                        <ul>
                            {DataSources.map((datasource: string) => (
                                <li
                                    dangerouslySetInnerHTML={{
                                        __html: t(datasource),
                                    }}
                                />
                            ))}
                        </ul>
                    </TextColumn>
                    <IconColumn>
                        <Datasets style={{ width: '400px', height: '400px' }} />
                    </IconColumn>
                </AboutPageSegment>

                <AboutPageSegment
                    id="DataClinic"
                    style={{ backgroundColor: '#F0F5FF', color: '#103470' }}
                >
                    <TextColumn>
                        <Header style={{ color: '#103470' }}>
                            {t('DataClinic_header')}
                        </Header>
                        <Body>{t('DataClinic_0')}</Body>
                        <Body> {t('DataClinic_1')}</Body>
                        <Body
                            dangerouslySetInnerHTML={{
                                __html: t('DataClinic_2'),
                            }}
                        ></Body>
                    </TextColumn>
                    <IconColumn>
                        <img
                            style={{ width: '300px', height: '300px' }}
                            src="https://miro.medium.com/max/3152/1*6g_929Nj-THV-1BYC0egZA.png"
                        />
                    </IconColumn>
                </AboutPageSegment>

                <AboutPageSegment
                    id="Contribute"
                    imageLocation="left"
                    style={{ backgroundColor: 'white', color: '#103470' }}
                >
                    <TextColumn>
                        <Header style={{ color: '#103470' }}>
                            {t('Contribute_header')}
                        </Header>
                        <Body>{t('Contribute_0')}</Body>
                        <Body
                            dangerouslySetInnerHTML={{
                                __html: t('Contribute_1'),
                            }}
                        ></Body>
                        <Body
                            dangerouslySetInnerHTML={{
                                __html: t('Contribute_2'),
                            }}
                        ></Body>
                    </TextColumn>
                    <IconColumn>
                        <Ideas style={{ width: '400px', height: '400px' }} />
                    </IconColumn>
                </AboutPageSegment>
            </AboutPage>
        </div>
    );
};

export default About;
