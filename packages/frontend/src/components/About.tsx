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
                        Cupcake ipsum dolor sit amet marshmallow cake tiramisu
                        topping. Pie sweet gummies chocolate chocolate candy
                        canes icing. Cake lemon drops I love oat cake sesame
                        snaps I love. Lollipop soufflé macaroon icing I love
                        danish gummi bears. Apple pie bonbon ice cream marzipan
                        jelly-o sweet jujubes. Dessert gummies croissant.
                    </Body>
                    <Body>
                        Tart brownie chupa chups tiramisu bonbon. Sweet gummies
                        donut pie caramels candy canes apple pie toffee.
                        Gingerbread brownie cupcake sweet. Candy sweet gummies
                        caramels halvah marzipan jujubes candy. Caramels biscuit
                        biscuit I love marshmallow brownie ice cream carrot
                        cake. Cake halvah tiramisu fruitcake tart candy canes
                        pastry cotton candy brownie. Marzipan fruitcake muffin
                        cake chupa chups pie donut cookie. Chupa chups jelly
                        gummi bears cake tootsie roll tootsie roll chocolate
                        brownie. Toffee I love cotton candy pie lemon drops
                        liquorice danish pie.
                    </Body>
                </ProjectInfoSection>
                <DataClinicSection />
                <ContributeSection appName="the Africa Covid Dashboard" />
            </AboutPage>
        </div>
    );
};

export default About;
