import React, { useCallback } from 'react';
import { Select } from 'antd';
import i18n from '../i18n';

const { Option } = Select;

const LanguagePanel = () => {
    const changeLanguage = useCallback((language: string) => {
        i18n.changeLanguage(language);
    }, []);
    return (
        <div>
            <Select
                defaultValue={i18n.language}
                style={{ width: 120 }}
                onSelect={(lng) => changeLanguage(lng)}
                bordered={false}
            >
                <Option value="en">English</Option>
                <Option value="fr">Français</Option>
                <Option value="pt">Português</Option>
                <Option value="ar">عربى</Option>
                <Option value="sw">Kiswahili</Option>
            </Select>
        </div>
    );
};

export default LanguagePanel;
