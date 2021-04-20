import React from 'react';
import { useTranslation } from 'react-i18next';

export const Legal: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div
            style={{
                textAlign: 'left',
                padding: '20px',
                backgroundColor: 'white',
                color: '#002766',
                height: '100%',
            }}
        >
            <p>{t('legal_p1')}</p>

            <p>{t('legal_p2')}</p>

            <p>{t('legal_p3')}</p>

            <p>
                {t('legal_p4')}{' '}
                <a
                    target="_blank"
                    href="https://www.apache.org/licenses/LICENSE-2.0.html"
                >
                    {t('legal_apache')}
                </a>
                .
            </p>
        </div>
    );
};
