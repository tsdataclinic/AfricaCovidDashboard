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
                defaultValue="en"
                style={{ width: 120 }}
                onSelect={lng => changeLanguage(lng)}
                bordered={false}
            >
                <Option value="en">English</Option>
                <Option value="sw">WASWAHILI</Option>
                <Option value="am">አማርኛ</Option>
            </Select>
        </div>
    );
};

export default LanguagePanel;
