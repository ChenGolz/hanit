'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from './I18nProvider';

export default function OneTapReport() {
  const fileRef = useRef(null);
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="one-tap-wrap">
      <button className="button button-primary button-hero" type="button" onClick={() => fileRef.current?.click()}>
        {t('oneTap')}
      </button>
      <button className="button button-secondary button-hero-secondary" type="button" onClick={() => router.push('/found-pet?camera=1')}>
        {t('openCamera')}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={() => router.push('/found-pet?camera=1')}
      />
      <p className="muted" style={{ marginTop: 12 }}>{t('cameraHint')}</p>
      <p className="small">{t('videoOrImageHint')}</p>
    </div>
  );
}
