'use client';

import { useI18n } from './I18nProvider';
import { locales } from './translations';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="lang-switcher">
      {locales.map((item) => (
        <button
          key={item.code}
          type="button"
          className={`lang-chip ${locale === item.code ? 'lang-chip-active' : ''}`}
          onClick={() => setLocale(item.code)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
