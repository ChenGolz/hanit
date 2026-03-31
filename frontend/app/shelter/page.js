'use client';

import { useState } from 'react';
import { fetchJson } from '../../components/Api';
import { useI18n } from '../../components/I18nProvider';
import MapPicker from '../../components/MapPicker';

export default function ShelterPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);
  const [result, setResult] = useState(null);

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition((position) => {
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setResult(null);
    const form = new FormData(e.currentTarget);
    if (coords?.lat) form.set('latitude', String(coords.lat));
    if (coords?.lng) form.set('longitude', String(coords.lng));
    try {
      const data = await fetchJson('/api/shelter/intake-scan', { method: 'POST', body: form });
      setResult(data);
      setMessage(t('shelterSaved'));
      e.currentTarget.reset();
      setCoords(null);
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container split-grid">
        <div className="card big-card">
          <h1>{t('shelterTitle')}</h1>
          <p className="muted">{t('shelterText')}</p>
          <form onSubmit={onSubmit}>
            <label className="label">{t('shelterName')}<input className="input" name="shelter_name" required /></label>
            <label className="label">{t('animalType')}
              <select className="select" name="animal_type" required defaultValue="dog">
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="label">{t('breed')}<input className="input" name="breed" /></label>
            <label className="label">{t('color')}<input className="input" name="color" /></label>
            <label className="label">{t('microchip')}<input className="input" name="microchip_number" /></label>
            <label className="label">{t('notes')}<textarea className="textarea" name="notes" /></label>
            <label className="label">{t('city')}<input className="input" name="city" /></label>
            <label className="label">{t('neighborhood')}<input className="input" name="neighborhood" /></label>
            <div className="map-header">
              <div>
                <strong>{t('mapTitle')}</strong>
                <div className="small">{t('mapHint')}</div>
              </div>
              <button type="button" className="button button-secondary" onClick={useMyLocation}>{t('currentLocation')}</button>
            </div>
            <MapPicker value={coords} onChange={setCoords} />
            <label className="label">{t('image')}<input className="input" name="image" type="file" accept="image/*" capture="environment" /></label>
            <label className="label">{t('video')}<input className="input" name="video" type="file" accept="video/*" capture="environment" /></label>
            <label className="label">{t('nosePhoto')}<input className="input" name="nose_image" type="file" accept="image/*" capture="environment" /></label>
            <div style={{ marginTop: 20 }}>
              <button className="button button-primary" disabled={loading}>{loading ? t('loadingMatch') : t('runShelterScan')}</button>
            </div>
          </form>
          {message ? <div className="banner-success" style={{ marginTop: 18 }}>{message}</div> : null}
          {error ? <div className="banner-error" style={{ marginTop: 18 }}>{error}</div> : null}
        </div>

        <div className="card auth-card">
          <h2>{t('possibleMatches')}</h2>
          <div className="grid" style={{ marginTop: 16 }}>
            {result?.matches?.map((match) => (
              <div className="match" key={match.lost_pet_id}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={match.image_url} alt={match.name} className="thumb" />
                  <div>
                    <strong>{match.name}</strong>
                    <div className="small">{match.animal_type} • {match.city}</div>
                    <div className="small">{match.reason}</div>
                  </div>
                </div>
                <div className="score">{match.score}%</div>
              </div>
            ))}
            {!result?.matches?.length ? <div className="small">No scans yet.</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
