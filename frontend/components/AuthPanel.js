'use client';

import { useState } from 'react';
import { fetchJson, setAuthToken } from './Api';
import { useI18n } from './I18nProvider';

export default function AuthPanel() {
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function sendCode() {
    try {
      setError('');
      const data = await fetchJson('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      setStatus(data.dev_code ? `${t('codeSent')} (${data.dev_code})` : t('codeSent'));
    } catch (err) {
      setError(err.message || 'Unable to send code');
    }
  }

  async function verify() {
    try {
      setError('');
      const data = await fetchJson('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code }),
      });
      setAuthToken(data.token);
      setStatus('Authenticated');
    } catch (err) {
      setError(err.message || 'Unable to verify code');
    }
  }

  return (
    <div className="card auth-card">
      <h3>{t('loginTitle')}</h3>
      <p className="muted">{t('loginText')}</p>
      <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="0501234567 / you@example.com" />
      <div className="button-row" style={{ marginTop: 12 }}>
        <button type="button" className="button button-secondary" onClick={sendCode}>{t('sendCode')}</button>
      </div>
      <input className="input" style={{ marginTop: 12 }} value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('verificationCode')} />
      <div className="button-row" style={{ marginTop: 12 }}>
        <button type="button" className="button button-primary" onClick={verify}>{t('verifyCode')}</button>
      </div>
      {status ? <div className="banner-success" style={{ marginTop: 12 }}>{status}</div> : null}
      {error ? <div className="banner-error" style={{ marginTop: 12 }}>{error}</div> : null}
    </div>
  );
}
