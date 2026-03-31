'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '../../components/Api';
import { useI18n } from '../../components/I18nProvider';

export default function VolunteerPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [coords, setCoords] = useState(null);

  async function load() {
    fetchJson('/api/volunteers').then(setVolunteers).catch(() => setVolunteers([]));
  }

  useEffect(() => { load(); }, []);

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
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get('name') || '',
      phone: form.get('phone') || '',
      email: form.get('email') || '',
      city: form.get('city') || '',
      neighborhood: form.get('neighborhood') || '',
      radius_km: Number(form.get('radius_km') || 2.5),
      latitude: coords?.lat || null,
      longitude: coords?.lng || null,
      channels: ['sms'],
    };
    try {
      await fetchJson('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setMessage(t('volunteerSaved'));
      e.currentTarget.reset();
      setCoords(null);
      load();
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
          <h1>{t('volunteerTitle')}</h1>
          <p className="muted">{t('volunteerText')}</p>
          <form onSubmit={onSubmit}>
            <label className="label">{t('contactName')}<input className="input" name="name" /></label>
            <label className="label">{t('phone')}<input className="input" name="phone" /></label>
            <label className="label">{t('email')}<input className="input" name="email" /></label>
            <label className="label">{t('city')}<input className="input" name="city" /></label>
            <label className="label">{t('neighborhood')}<input className="input" name="neighborhood" /></label>
            <label className="label">{t('radiusKm')}<input className="input" name="radius_km" type="number" step="0.5" min="0.5" max="20" defaultValue="2.5" /></label>
            <div className="button-row" style={{ marginTop: 14 }}>
              <button type="button" className="button button-secondary" onClick={useMyLocation}>{t('currentLocation')}</button>
              <button className="button button-primary" disabled={loading}>{loading ? t('loadingSave') : t('joinVolunteer')}</button>
            </div>
          </form>
          {message ? <div className="banner-success" style={{ marginTop: 18 }}>{message}</div> : null}
          {error ? <div className="banner-error" style={{ marginTop: 18 }}>{error}</div> : null}
        </div>

        <div className="card auth-card">
          <h2>{t('volunteer')}</h2>
          <div className="grid" style={{ marginTop: 16 }}>
            {volunteers.map((item) => (
              <div className="match" key={item.id}>
                <div>
                  <strong>{item.name || 'Volunteer'}</strong>
                  <div className="small">{item.city} {item.neighborhood ? `• ${item.neighborhood}` : ''}</div>
                </div>
                <div className="score">{item.radius_km} km</div>
              </div>
            ))}
            {volunteers.length === 0 ? <div className="small">No volunteers yet.</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
