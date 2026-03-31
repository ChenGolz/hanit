'use client';

import { useEffect, useState } from 'react';
import AuthPanel from '../../components/AuthPanel';
import { fetchJson } from '../../components/Api';
import { flushPendingReports, getPendingCount, enqueuePendingReport } from '../../components/offlineQueue';
import { useI18n } from '../../components/I18nProvider';
import MapPicker from '../../components/MapPicker';

export default function LostPetPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getPendingCount().then(setPendingCount).catch(() => {});
    const onOnline = async () => {
      const result = await flushPendingReports().catch(() => ({ flushed: 0 }));
      if (result.flushed) setMessage(t('offlineFlushed'));
      getPendingCount().then(setPendingCount).catch(() => {});
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [t]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const form = new FormData(e.currentTarget);
    if (coords?.lat) form.set('latitude', String(coords.lat));
    if (coords?.lng) form.set('longitude', String(coords.lng));

    try {
      if (!navigator.onLine) {
        await enqueuePendingReport('lost', form);
        setMessage(t('offlineQueued'));
        e.currentTarget.reset();
        setCoords(null);
        setPendingCount((value) => value + 1);
        return;
      }
      const data = await fetchJson('/api/lost-pets', { method: 'POST', body: form });
      const tags = data?.recognition?.semantic_tags?.length ? ` ${t('semanticTags')}: ${data.recognition.semantic_tags.join(', ')}` : '';
      const bestFrame = data?.recognition?.best_frame?.source === 'video' ? ` ${t('bestFrame')}.` : '';
      setMessage(`Saved successfully.${bestFrame}${tags}`);
      e.currentTarget.reset();
      setCoords(null);
    } catch (err) {
      setError(err.message || 'Saving failed.');
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition((position) => {
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  }

  return (
    <section className="section">
      <div className="container split-grid">
        <div className="card big-card">
          <h1>{t('lostTitle')}</h1>
          <p className="muted">{t('lostText')}</p>
          <div className="banner-success" style={{ marginTop: 14 }}>{t('privacyBlur')}</div>
          <div className="small" style={{ marginTop: 12 }}>{t('videoOrImageHint')}</div>
          {pendingCount > 0 ? <div className="banner-success" style={{ marginTop: 14 }}>{t('offlineMode')}: {pendingCount}</div> : null}

          <form onSubmit={onSubmit}>
            <label className="label">{t('name')}<input className="input" name="name" required placeholder="Luna" /></label>
            <label className="label">{t('animalType')}
              <select className="select" name="animal_type" required defaultValue="dog">
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="label">{t('breed')}<input className="input" name="breed" placeholder="Mixed / Golden Retriever" /></label>
            <label className="label">{t('color')}<input className="input" name="color" placeholder="Brown-white" /></label>
            <label className="label">{t('collar')}<input className="input" name="collar_description" placeholder="Red collar" /></label>
            <label className="label">{t('markings')}<input className="input" name="unique_markings" placeholder="Black spot near the ear" /></label>
            <label className="label">{t('microchip')}<input className="input" name="microchip_number" placeholder="981000123456789" /></label>
            <label className="label">{t('privateQuizPrompt')}<input className="input" name="verification_prompt" placeholder="What detail should only the real finder know?" /></label>
            <label className="label">{t('privateQuizAnswer')}<input className="input" name="verification_answer" placeholder="White spot on back left paw" /></label>
            <label className="label">{t('privateMarkerPrompt')}<input className="input" name="private_marker_prompt" placeholder="Unique belly mark / missing tooth" /></label>
            <label className="label">{t('location')}<input className="input" name="last_seen_location" placeholder="Street / neighborhood / landmark" /></label>
            <label className="label">{t('city')}<input className="input" name="city" placeholder="Tel Aviv" /></label>
            <label className="label">{t('neighborhood')}<input className="input" name="neighborhood" placeholder="Florentin / Baka / Hadar" /></label>

            <div className="map-header">
              <div>
                <strong>{t('mapTitle')}</strong>
                <div className="small">{t('mapHint')}</div>
              </div>
              <button type="button" className="button button-secondary" onClick={useMyLocation}>{t('currentLocation')}</button>
            </div>
            <MapPicker value={coords} onChange={setCoords} />

            <label className="label">{t('contactName')}<input className="input" name="contact_name" placeholder="Full name" /></label>
            <label className="label">{t('phone')}<input className="input" name="contact_phone" placeholder="0501234567" /></label>
            <label className="label">{t('email')}<input className="input" name="contact_email" placeholder="you@example.com" /></label>
            <label className="label">{t('image')}<input className="input" name="image" type="file" accept="image/*" capture="environment" /></label>
            <label className="label">{t('video')}<input className="input" name="video" type="file" accept="video/*" capture="environment" /></label>
            <label className="label">{t('nosePhoto')}<input className="input" name="nose_image" type="file" accept="image/*" capture="environment" /></label>
            <label className="label">{t('privateMarker')}<input className="input" name="private_marker_image" type="file" accept="image/*" capture="environment" /></label>

            <div style={{ marginTop: 20 }}>
              <button className="button button-primary" disabled={loading}>
                {loading ? t('loadingSave') : t('save')}
              </button>
            </div>
          </form>

          {message ? <div className="banner-success" style={{ marginTop: 18 }}>{message}</div> : null}
          {error ? <div className="banner-error" style={{ marginTop: 18 }}>{error}</div> : null}
        </div>

        <AuthPanel />
      </div>
    </section>
  );
}
