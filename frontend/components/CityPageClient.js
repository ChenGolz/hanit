'use client';

import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { fetchJson } from './Api';
import { useI18n } from './I18nProvider';
import { cityPages } from './translations';

export default function CityPageClient({ citySlug }) {
  const { locale, t } = useI18n();
  const slug = citySlug || '';
  const [pets, setPets] = useState([]);
  const city = useMemo(() => cityPages.find((item) => item.slug === slug) || cityPages[0], [slug]);

  useEffect(() => {
    if (!slug) return;
    fetchJson(`/api/lost-pets?city=${slug}`).then(setPets).catch(() => setPets([]));
  }, [slug]);

  return (
    <section className="section">
      <div className="container">
        <div className="card big-card">
          <h1>{city[locale]}</h1>
          <p className="muted">{t('cityLandingText')}</p>
          <div className="button-row" style={{ marginBottom: 16 }}>
            <Link href="/found-pet?camera=1" className="button button-primary">{t('oneTap')}</Link>
            <Link href="/lost-pet" className="button button-secondary">{t('reportLost')}</Link>
          </div>
          <div className="grid">
            {pets.length === 0 ? <div className="small">{t('noReports')}</div> : null}
            {pets.map((pet) => (
              <div className="match" key={pet.id}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={pet.image_url} alt={pet.name} className="thumb" />
                  <div>
                    <strong>{pet.name}</strong>
                    <div className="small">{pet.animal_type} • {pet.city}</div>
                    <div className="small">{pet.color} {pet.collar_description ? `• ${pet.collar_description}` : ''}</div>
                    {pet.microchip_number_masked ? <div className="small">Chip: {pet.microchip_number_masked}</div> : null}
                  </div>
                </div>
                <div className="score">{pet.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
