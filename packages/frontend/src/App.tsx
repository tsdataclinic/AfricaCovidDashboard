import React from 'react';
import styled from 'styled-components';
import AppLayout from './components/Layout';

function App() {
    return (
        <Shell>
            <AppLayout />
        </Shell>
    );
}

const Shell = styled.div`
    text-align: center;
`;

export default App;
