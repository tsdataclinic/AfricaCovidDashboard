import React, { useCallback } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import i18n from '../i18n';
import { DARK_BLUE } from '../colors';

const options = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'pt', label: 'Português' },
    { value: 'ar', label: 'عربى' },
    { value: 'sw', label: 'Kiswahili' },
];

const LanguagePanel = () => {
    const changeLanguage = useCallback((language: string) => {
        i18n.changeLanguage(language);
    }, []);
    return (
        <Wrapper>
            <i className="fas fa-language"></i>
            <Select
                defaultValue={i18n.language}
                style={{ width: 120 }}
                onSelect={(lng) => changeLanguage(lng)}
                bordered={false}
                options={options}
            ></Select>
        </Wrapper>
    );
};
export default LanguagePanel;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 20px;
    i,
    .ant-select {
        color: ${DARK_BLUE};
    }
`;
