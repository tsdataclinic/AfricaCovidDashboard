import React from 'react';
import {
    AboutPage,
    ProjectInfoSection,
    Body,
    DataClinicSection,
    ContributeSection,
} from '@dataclinic/dataclinic';
const About = () => {
    return (
        <div style={{ textAlign: 'left' }}>
            <AboutPage>
                <ProjectInfoSection
                    appName={'Africa Covid Dashboard'}
                    appDescription={
                        'We built the Africa Covid Dashboard to help policy makers understand the covid pandemic in Africa'
                    }
                    appSubHeading={'Monitor the state of Covid in Africa'}
                >
                    <Body style={{ textAlign: 'left' }}>
                        Over the past year we have been bombarded with data
                        visualizations, dashboards and charts all detailing the
                        spread of COVID around the world. While some of these
                        dashboards are excellent sources of information, few of
                        them take into account regional variations in the
                        factors associated with transmission.
                    </Body>
                    <Body>
                        Inspired by the work of the{' '}
                        <a
                            href="https://sites.bu.edu/covid-19-in-africa/"
                            target="_blank"
                        >
                            COVID-19 in Africa Data Science Initiative
                        </a>
                        , Data Clinic produced a COVID dashboard focused
                        specifically on{' '}
                        <a
                            href="https://github.com/tmh741/AFCOVIDDashboard"
                            target="_blank"
                        >
                            data and forecasts
                        </a>{' '}
                        for African countries, with the hope that it could help
                        decision-makers better understand the state of the
                        pandemic on the continent.
                    </Body>
                    <Body>
                        The dashboard, written using a React-based frontend and
                        a NestJS API, displays infection, recovery and death
                        statistics for each African country along with forecasts
                        based on{' '}
                        <a
                            href="https://github.com/tmh741/AFCOVIDDashboard"
                            target="_blank"
                        >
                            the model
                        </a>{' '}
                        produced by the COVID-19 in Africa Data Science
                        Initiative.
                    </Body>
                </ProjectInfoSection>
                <DataClinicSection />
                <ContributeSection appName="the Africa Covid Dashboard" />
            </AboutPage>
        </div>
    );
};

export default About;
