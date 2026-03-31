import './globals.css';
import 'leaflet/dist/leaflet.css';
import { I18nProvider } from '../components/I18nProvider';
import AppChrome from '../components/AppChrome';

export const metadata = {
  title: 'Israel PetConnect AI',
  description: 'AI-powered lost pet reporting for Israel with mobile-first reporting, maps, multilingual support, geofenced alerts, offline mode, and privacy blur.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body>
        <I18nProvider>
          <AppChrome>{children}</AppChrome>
        </I18nProvider>
      </body>
    </html>
  );
}
