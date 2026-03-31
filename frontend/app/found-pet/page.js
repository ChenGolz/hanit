'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '../../components/Api';
import { flushPendingReports, getPendingCount, enqueuePendingReport } from '../../components/offlineQueue';
import { useI18n } from '../../components/I18nProvider';
import MapPicker from '../../components/MapPicker';

export default function FoundPetPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [result, setResult] = useState(null);
  const [verifyAnswers, setVerifyAnswers] = useState({});
  const [verifyMessages, setVerifyMessages] = useState({});
  const [physicalMarker, setPhysicalMarker] = useState({});

  useEffect(() => {
    getPendingCount().then(setPendingCount).catch(() => {});
    const onOnline = async () => {
      const res = await flushPendingReports().catch(() => ({ flushed: 0 }));
      if (res.flushed) setMessage(t('offlineFlushed'));
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
    setResult(null);

    const form = new FormData(e.currentTarget);
    if (coords?.lat) form.set('latitude', String(coords.lat));
    if (coords?.lng) form.set('longitude', String(coords.lng));

    try {
      if (!navigator.onLine) {
        await enqueuePendingReport('found', form);
        setMessage(t('offlineQueued'));
        e.currentTarget.reset();
        setCoords(null);
        setPendingCount((value) => value + 1);
        return;
      }
      const data = await fetchJson('/api/found-reports', { method: 'POST', body: form });
      setResult(data);
      const bestFrame = data?.best_frame?.source === 'video' ? ` ${t('bestFrame')}.` : '';
      setMessage(`Saved successfully.${bestFrame}`);
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

  async function verifyClaim(match) {
    try {
      const payload = {
        report_id: result.report_id,
        answer: verifyAnswers[match.lost_pet_id] || '',
        intro_message: verifyMessages[match.lost_pet_id] || 'I may have found your pet.',
        physical_marker_confirmed: !!physicalMarker[match.lost_pet_id],
      };
      const res = await fetchJson(`/api/matches/${match.lost_pet_id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setMessage(res.message || t('relaySent'));
    } catch (err) {
      setError(err.message || 'Verification failed.');
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="card big-card">
          <h1>{t('foundTitle')}</h1>
          <p className="muted">{t('foundText')}</p>
          <div className="banner-success" style={{ marginTop: 14 }}>{t('privacyBlur')}</div>
          <div className="small" style={{ marginTop: 12 }}>{t('videoOrImageHint')}</div>
          {pendingCount > 0 ? <div className="banner-success" style={{ marginTop: 14 }}>{t('offlineMode')}: {pendingCount}</div> : null}

          <form onSubmit={onSubmit}>
            <label className="label">{t('animalType')}
              <select className="select" name="animal_type" required defaultValue="dog">
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="label">{t('breed')}<input className="input" name="breed" placeholder="Mixed / Husky mix" /></label>
            <label className="label">{t('color')}<input className="input" name="color" placeholder="Brown-white" /></label>
            <label className="label">{t('collar')}<input className="input" name="collar_description" placeholder="Red collar" /></label>
            <label className="label">{t('location')}<input className="input" name="seen_location" placeholder="Street / neighborhood / landmark" /></label>
            <label className="label">{t('city')}<input className="input" name="city" placeholder="Tel Aviv" /></label>
            <label className="label">{t('neighborhood')}<input className="input" name="neighborhood" placeholder="Florentin / Baka / Hadar" /></label>
            <label className="label">{t('notes')}<textarea className="textarea" name="notes" placeholder="What happened? Is the animal moving south?" /></label>
            <label className="label">{t('finderName')}<input className="input" name="finder_name" placeholder="Full name" /></label>
            <label className="label">{t('phone')}<input className="input" name="finder_phone" placeholder="0501234567" /></label>
            <label className="label">{t('email')}<input className="input" name="finder_email" placeholder="you@example.com" /></label>
            <label className="label">{t('microchip')}<input className="input" name="microchip_number" placeholder="981000123456789" /></label>

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
              <button className="button button-primary" disabled={loading}>
                {loading ? t('loadingMatch') : t('checkMatches')}
              </button>
            </div>
          </form>

          {message ? <div className="banner-success" style={{ marginTop: 18 }}>{message}</div> : null}
          {error ? <div className="banner-error" style={{ marginTop: 18 }}>{error}</div> : null}

          {result?.matches?.length ? (
            <div style={{ marginTop: 24 }}>
              <h2>{t('possibleMatches')}</h2>
              <div className="grid" style={{ marginTop: 16 }}>
                {result.matches.map((match) => (
                  <div className="match match-vertical" key={match.lost_pet_id}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img src={match.image_url} alt={match.name} className="thumb" />
                      <div>
                        <strong>{match.name}</strong>
                        <div className="small">{match.animal_type} • {match.city}</div>
                        <div className="small">{match.reason}</div>
                        <div className="small">Embedding: {Math.round((match.vector_similarity || 0) * 100)}%</div>
                        {match.nose_similarity ? <div className="small">Nose similarity: {Math.round((match.nose_similarity || 0) * 100)}%</div> : null}
                        {match.tag_overlap?.length ? <div className="small">{t('semanticTags')}: {match.tag_overlap.join(', ')}</div> : null}
                      </div>
                    </div>
                    <div className="score">{match.score}%</div>
                    {match.verification_required ? (
                      <div className="verify-box">
                        <div className="small"><strong>{t('verificationNeeded')}</strong></div>
                        <div className="small" style={{ marginTop: 6 }}>{match.verification_prompt}</div>
                        <input className="input" style={{ marginTop: 10 }} placeholder={t('answerPrompt')} value={verifyAnswers[match.lost_pet_id] || ''} onChange={(e) => setVerifyAnswers((value) => ({ ...value, [match.lost_pet_id]: e.target.value }))} />
                        <textarea className="textarea" style={{ marginTop: 10 }} placeholder={t('introMessage')} value={verifyMessages[match.lost_pet_id] || ''} onChange={(e) => setVerifyMessages((value) => ({ ...value, [match.lost_pet_id]: e.target.value }))} />
                        {match.private_marker_prompt ? (
                          <label className="label" style={{ marginTop: 8 }}>
                            <input type="checkbox" checked={!!physicalMarker[match.lost_pet_id]} onChange={(e) => setPhysicalMarker((value) => ({ ...value, [match.lost_pet_id]: e.target.checked }))} />{' '}
                            {match.private_marker_prompt || t('privateMarkerConfirm')}
                          </label>
                        ) : null}
                        <button type="button" className="button button-secondary" style={{ marginTop: 10 }} onClick={() => verifyClaim(match)}>{t('verifyClaim')}</button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result?.municipal_draft?.body ? (
            <div className="card" style={{ marginTop: 24 }}>
              <strong>{t('municipalDraftReady')}</strong>
              <div className="small" style={{ marginTop: 8 }}>{result.municipal_draft.subject}</div>
              <textarea className="textarea" readOnly value={result.municipal_draft.body} style={{ marginTop: 12 }} />
              <div className="button-row" style={{ marginTop: 12 }}>
                {result.municipal_draft.mailto ? <a className="button button-secondary" href={result.municipal_draft.mailto}>{t('sendTo106')}</a> : null}
                <button type="button" className="button button-secondary" onClick={() => navigator.clipboard?.writeText(result.municipal_draft.body)}>{t('copy106')}</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
