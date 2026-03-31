'use client';

import Link from 'next/link';
import HeroStats from '../components/HeroStats';
import OneTapReport from '../components/OneTapReport';
import { useI18n } from '../components/I18nProvider';
import { cityPages } from '../components/translations';

export default function Home() {
  const { t, locale } = useI18n();
  const featureCards = [
    ['mobileTitle', 'mobileText'],
    ['aiTitle', 'aiText'],
    ['localTitle', 'localText'],
    ['volunteerTitle', 'volunteerText'],
    ['shelterTitle', 'shelterText'],
    ['socialIngest', 'socialIngestText'],
  ];

  return (
    <>
      <section className="section hero">
        <div className="container">
          <span className="badge">{t('heroBadge')}</span>
          <h1 className="title" style={{ marginTop: 18 }}>{t('heroTitle')}</h1>
          <p className="muted lead-text">{t('heroText')}</p>
          <div className="button-row" style={{ marginTop: 18 }}>
            <Link className="button button-secondary" href="/lost-pet">{t('reportLost')}</Link>
            <Link className="button button-secondary" href="/matches">{t('heatmap')}</Link>
            <Link className="button button-secondary" href="/volunteer">{t('joinVolunteer')}</Link>
            <Link className="button button-secondary" href="/shelter">{t('shelter')}</Link>
          </div>
          <OneTapReport />
          <div className="card" style={{ marginTop: 18 }}>
            <div className="small">{t('geofenceNotice')}</div>
            <div className="small" style={{ marginTop: 8 }}>{t('privacyBlur')}</div>
            <div className="small" style={{ marginTop: 8 }}>{t('chatMasked')}</div>
            <div className="small" style={{ marginTop: 8 }}>{t('bestFrame')}</div>
          </div>
          <HeroStats />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{t('keyFeatures')}</h2>
          <div className="grid grid-3" style={{ marginTop: 16 }}>
            {featureCards.map(([title, text]) => (
              <div className="card" key={title}>
                <h3>{t(title)}</h3>
                <p className="muted">{t(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card big-card">
            <h2>{t('cityLandingTitle')}</h2>
            <p className="muted">{t('cityLandingText')}</p>
            <div className="city-grid">
              {cityPages.map((city) => (
                <Link key={city.slug} href={`/${city.slug}`} className="city-link">
                  {city[locale]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
