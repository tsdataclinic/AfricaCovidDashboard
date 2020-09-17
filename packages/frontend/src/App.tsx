import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import LanguagePanel from './components/LanguagePanel';

function App() {
    const { t } = useTranslation();
    return (
        <Shell>
            <AppHeader>
                <p>{t('Africa COVID Dashboard')}</p>
                <LanguagePanel />
            </AppHeader>
        </Shell>
    );
}

const Shell = styled.div`
    text-align: center;
`;

const AppHeader = styled.header`
    background-color: #282c34;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: white;
`;

export default App;
