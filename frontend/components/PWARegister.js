'use client';

import { useEffect, useState } from 'react';
import { useI18n } from './I18nProvider';
import { withBasePath } from './siteConfig';

export default function PWARegister() {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(withBasePath('/sw.js'), { scope: withBasePath('/') }).catch(() => {});
    }

    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt) return null;

  return (
    <button
      type="button"
      className="button button-secondary"
      onClick={async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
      }}
    >
      {t('installed')}
    </button>
  );
}
