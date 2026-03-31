'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '../../components/Api';
import HeatMap from '../../components/HeatMap';
import { useI18n } from '../../components/I18nProvider';

export default function MatchesPage() {
  const { t } = useI18n();
  const [pets, setPets] = useState([]);
  const [heatmap, setHeatmap] = useState({});

  useEffect(() => {
    fetchJson('/api/lost-pets').then(setPets).catch(() => setPets([]));
  }, []);

  async function loadHeatmap(pet) {
    try {
      const data = await fetchJson(`/api/lost-pets/${pet.id}/sightings-heatmap`);
      setHeatmap((value) => ({ ...value, [pet.id]: data }));
    } catch {
      setHeatmap((value) => ({ ...value, [pet.id]: { points: [] } }));
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="card big-card">
          <h1>{t('matchesTitle')}</h1>
          <p className="muted">{t('matchesText')}</p>

          <div className="grid" style={{ marginTop: 18 }}>
            {pets.length === 0 ? <div className="small">{t('noReports')}</div> : null}
            {pets.map((pet) => (
              <div className="card" key={pet.id}>
                <div className="match">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={pet.image_url} alt={pet.name} className="thumb" />
                    <div>
                      <strong>{pet.name}</strong>
                      <div className="small">{pet.animal_type} • {pet.city}</div>
                      <div className="small">{pet.color} {pet.collar_description ? `• ${pet.collar_description}` : ''}</div>
                      <div className="small">Phone: {pet.contact_phone_masked} • Email: {pet.contact_email_masked}</div>
                      {pet.microchip_number_masked ? <div className="small">Chip: {pet.microchip_number_masked}</div> : null}
                      {pet.semantic_tags?.length ? <div className="small">{t('semanticTags')}: {pet.semantic_tags.join(', ')}</div> : null}
                      {pet.private_marker_prompt ? <div className="small">{t('privateMarker')}: {pet.private_marker_prompt}</div> : null}
                    </div>
                  </div>
                  <div className="score">{pet.status === 'missing' ? t('active') : pet.status}</div>
                </div>
                <div className="button-row" style={{ marginTop: 14 }}>
                  <button type="button" className="button button-secondary" onClick={() => loadHeatmap(pet)}>{t('useHeatmap')}</button>
                </div>
                {heatmap[pet.id] ? (
                  <div style={{ marginTop: 16 }}>
                    <h3>{t('heatmapTitle')}</h3>
                    {heatmap[pet.id].points?.length ? <HeatMap points={heatmap[pet.id].points} center={{ lat: pet.latitude, lng: pet.longitude }} /> : <div className="small">{t('heatmapEmpty')}</div>}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
