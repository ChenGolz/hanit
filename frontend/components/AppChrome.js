'use client';

import Link from 'next/link';
import { useI18n } from './I18nProvider';
import LanguageSwitcher from './LanguageSwitcher';
import PWARegister from './PWARegister';

export default function AppChrome({ children }) {
  const { t } = useI18n();

  return (
    <>
      <div className="hero hero-shell">
        <div className="container">
          <div className="nav">
            <Link href="/" className="brand">{t('brand')}</Link>
            <div className="nav-links">
              <Link className="button button-secondary" href="/">{t('home')}</Link>
              <Link className="button button-secondary" href="/lost-pet">{t('lost')}</Link>
              <Link className="button button-secondary" href="/found-pet">{t('found')}</Link>
              <Link className="button button-secondary" href="/matches">{t('matches')}</Link>
              <Link className="button button-secondary" href="/volunteer">{t('volunteer')}</Link>
              <Link className="button button-secondary" href="/shelter">{t('shelter')}</Link>
              <Link className="button button-secondary" href="/admin">{t('admin')}</Link>
            </div>
            <div className="nav-side">
              <PWARegister />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
      {children}
      <div className="footer">
        <div className="container">{t('footer')}</div>
      </div>
    </>
  );
}
