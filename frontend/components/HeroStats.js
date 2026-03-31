'use client';

import { useI18n } from './I18nProvider';

export default function HeroStats() {
  const { locale } = useI18n();
  const stats = {
    he: [
      ['מצלמה', 'פתיחה מיידית מהנייד'],
      ['מפה', 'סיכת דיווח מדויקת'],
      ['AI', 'וקטורים במקום hashes'],
    ],
    ar: [
      ['الكاميرا', 'فتح فوري من الهاتف'],
      ['الخريطة', 'تحديد دقيق للموقع'],
      ['AI', 'متجهات بدل hashes'],
    ],
    en: [
      ['Camera', 'instant mobile capture'],
      ['Map', 'precise report pin'],
      ['AI', 'vectors instead of hashes'],
    ],
  };

  return (
    <div className="grid grid-3" style={{ marginTop: 22 }}>
      {stats[locale].map(([value, label]) => (
        <div className="card" key={label}>
          <div className="kpi">{value}</div>
          <div className="muted">{label}</div>
        </div>
      ))}
    </div>
  );
}
