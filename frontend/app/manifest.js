export default function manifest() {
  return {
    name: 'Israel PetConnect AI',
    short_name: 'PetConnect',
    description: 'Lost and found pet reporting across Israel with one-tap camera access.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7faf9',
    theme_color: '#059669',
    orientation: 'portrait',
    lang: 'he',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
