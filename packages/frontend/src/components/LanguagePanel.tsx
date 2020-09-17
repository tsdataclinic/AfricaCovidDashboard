import React, { useCallback } from 'react';
import styled from 'styled-components';
import i18n from '../i18n';

const LanguagePanel = () => {
    const changeLanguage = useCallback((language: string) => {
        i18n.changeLanguage(language);
    }, []);
    return (
        <Languages>
            <button
                onClick={() => changeLanguage('en')}
                className={i18n.language === 'en' ? 'active' : undefined}
            >
                English
            </button>
            <button
                onClick={() => changeLanguage('sw')}
                className={i18n.language === 'sw' ? 'active' : undefined}
            >
                WASWAHILI
            </button>
            <button
                onClick={() => changeLanguage('am')}
                className={i18n.language === 'am' ? 'active' : undefined}
            >
                አማርኛ
            </button>
        </Languages>
    );
};

export default LanguagePanel;

const Languages = styled.div`
    display: flex;
    button {
        margin-right: 10px;
        cursor: pointer;
        border: none;
        :hover,
        &.active {
            background-color: #1890ff;
        }
    }
`;
