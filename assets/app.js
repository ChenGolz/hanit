(() => {
  const CITIES = [
    { slug: 'tel-aviv', he: 'תל אביב', ar: 'تل أبيب', en: 'Tel Aviv' },
    { slug: 'jerusalem', he: 'ירושלים', ar: 'القدس', en: 'Jerusalem' },
    { slug: 'haifa', he: 'חיפה', ar: 'حيفا', en: 'Haifa' },
    { slug: 'beer-sheva', he: 'באר שבע', ar: 'بئر السبع', en: 'Be’er Sheva' },
    { slug: 'ashdod', he: 'אשדוד', ar: 'أشدود', en: 'Ashdod' },
    { slug: 'netanya', he: 'נתניה', ar: 'نتانيا', en: 'Netanya' }
  ];

  const STORIES = [
    { emoji: '🐶', he: 'לולה חזרה הביתה תוך 4 שעות', ar: 'عادت لولا إلى البيت خلال 4 ساعات', en: 'Lola got home in 4 hours', city: 'תל אביב' },
    { emoji: '🐕', he: 'צ׳ייס זוהה ליד הפארק בזכות דיווח מהיר', ar: 'تم العثور على تشايس قرب الحديقة بفضل بلاغ سريع', en: 'Chase was spotted near the park after a quick report', city: 'חיפה' },
    { emoji: '🐾', he: 'שבב + תמונה קיצרו את זמן האיחוד', ar: 'الرقاقة + الصورة قصّرت وقت لمّ الشمل', en: 'Chip + photo shortened reunion time', city: 'ירושלים' }
  ];

  const BREEDS = {
    dog: [
      { value: '', icon: '🐶', labels: { he: 'לא בטוח', ar: 'غير متأكد', en: 'Not sure' } },
      { value: 'Mixed', icon: '🐾', labels: { he: 'מעורב', ar: 'مختلط', en: 'Mixed' } },
      { value: 'Labrador', icon: '🦮', labels: { he: 'לברדור', ar: 'لابرادور', en: 'Labrador' } },
      { value: 'Golden Retriever', icon: '🐕', labels: { he: 'גולדן רטריבר', ar: 'غولدن ريتريفر', en: 'Golden Retriever' } },
      { value: 'Husky', icon: '❄️', labels: { he: 'האסקי', ar: 'هاسكي', en: 'Husky' } },
      { value: 'German Shepherd', icon: '🛡️', labels: { he: 'רועה גרמני', ar: 'راعي ألماني', en: 'German Shepherd' } },
      { value: 'Malinois', icon: '⚡', labels: { he: 'מלינואה', ar: 'مالينوا', en: 'Malinois' } },
      { value: 'Poodle', icon: '🎀', labels: { he: 'פודל', ar: 'بودل', en: 'Poodle' } },
      { value: 'Chihuahua', icon: '🌰', labels: { he: 'צ׳יוואווה', ar: 'تشيواوا', en: 'Chihuahua' } }
    ],
    cat: [
      { value: '', icon: '🐱', labels: { he: 'לא בטוח', ar: 'غير متأكد', en: 'Not sure' } },
      { value: 'Mixed', icon: '🐾', labels: { he: 'מעורב', ar: 'مختلط', en: 'Mixed' } },
      { value: 'Persian', icon: '☁️', labels: { he: 'פרסי', ar: 'فارسي', en: 'Persian' } },
      { value: 'Siamese', icon: '👀', labels: { he: 'סיאמי', ar: 'سيامي', en: 'Siamese' } },
      { value: 'British Shorthair', icon: '🫧', labels: { he: 'בריטי קצר שיער', ar: 'بريطاني قصير الشعر', en: 'British Shorthair' } }
    ]
  };

  const FALLBACK_RECENT = [
    { id: 1, name: 'Buddy', city: 'תל אביב', latitude: 32.0853, longitude: 34.7818, animal_type: 'dog', created_at: new Date().toISOString(), image_url: '', color: 'Brown' },
    { id: 2, name: 'Mika', city: 'חיפה', latitude: 32.7940, longitude: 34.9896, animal_type: 'cat', created_at: new Date().toISOString(), image_url: '', color: 'White' },
    { id: 3, name: 'Luna', city: 'ירושלים', latitude: 31.7683, longitude: 35.2137, animal_type: 'dog', created_at: new Date().toISOString(), image_url: '', color: 'Black' }
  ];

  const TRANSLATIONS = {
    he: {
      brand: 'PetConnect Israel',
      language: 'שפה',
      liveMapNav: 'מפת דיווחים',
      volunteerLogin: 'התחברות מתנדב',
      heroBadge: '🐾 זמן הוא קריטי — מדווחים מהטלפון תוך שניות',
      heroTitle: 'אם ראית חיה משוטטת עכשיו — מתחילים במצלמה, לא בטופס מסובך.',
      heroText: 'הגרסה הזו נבנתה במיוחד למובייל: כפתורי חירום גדולים, צילום ישיר מהטלפון, מיקום אוטומטי, ותצוגת התאמות מהירה ברגע שמוסיפים תמונה.',
      searchLabel: 'חיפוש חופשי לפי עיר או סוג חיה',
      searchPlaceholder: 'למשל: תל אביב, האסקי, חתול לבן',
      searchButton: 'חיפוש',
      emergencyEyebrow: 'דיווח חירום',
      emergencyTitle: 'מצאתי כלב עכשיו!',
      emergencyText: 'הכפתור הזה פותח את המצלמה של הטלפון מיד ומעביר אותך לדיווח המהיר.',
      emergencyButton: '📸 לפתוח מצלמה עכשיו',
      lostBig: 'איבדתי חיה',
      lostSmall: 'כחול = דיווח בעלים',
      foundBig: 'ראיתי חיה משוטטת',
      foundSmall: 'ירוק = דיווח ממצא',
      featureCamera: 'מצלמה מובנית',
      featureCameraText: 'לחיצה אחת פותחת צילום ישיר מהמכשיר, עם אזורי לחיצה גדולים ונוחים לאגודל.',
      featureGeo: 'מיקום אוטומטי',
      featureGeoText: 'שימוש ב‑Geolocation כדי למלא קואורדינטות ומיקום כבר בזמן הדיווח.',
      featureInstant: 'תוצאות דומות מיידיות',
      featureInstantText: 'בדף “מצאתי” מוצגות התאמות אפשריות כבר בזמן מילוי הטופס, בלי להמתין לסיום.',
      liveMapTitle: 'מפה חיה של דיווחים מהשעה האחרונה',
      liveMapText: 'הצגה מהירה של דיווחים עדכניים כדי להבין היכן נראתה החיה לאחרונה.',
      openMap: 'למפה המלאה',
      storiesTitle: 'נמצאו לאחרונה',
      storiesText: 'איחודים מוצלחים בונים אמון ונותנים תקווה לבעלים ולמתנדבים.',
      cityTitle: 'דפי עיר',
      cityText: 'עמודי נחיתה מהירים לערים מרכזיות בישראל.',
      footer: 'גרסת GitHub Pages סטטית וניידת • ל‑AI, DB, SMS והתראות צריך backend חיצוני',
      apiBase: 'כתובת שרת',
      apiWarning: 'כדי שהטפסים וההתאמות יעבדו באמת, עדכני config.js עם כתובת ה‑backend שלך.',
      foundTitleNew: 'ראיתי חיה משוטטת',
      foundSubtitle: 'דיווח מהיר, מותאם לנייד, עם התאמות אפשריות כבר בזמן העלאת התמונה.',
      lostTitleNew: 'איבדתי חיה',
      lostSubtitle: 'טופס חכם עם מיקום, סימנים מזהים ושאלת אימות כדי למנוע מסירה לא נכונה.',
      step1of3: 'שלב 1 מתוך 3',
      stepFoundLabel: 'צילום ופרטים',
      stepLostLabel: 'זיהוי ופרטי בעלים',
      photoTipTitle: 'טיפ לצילום',
      photoTip: 'נסה לצלם מגובה החיה ובאור יום. תמונה חדה של הפנים תיתן התאמות טובות יותר.',
      image: 'תמונה',
      video: 'וידאו קצר',
      nosePhoto: 'תמונת אף מקרוב',
      privateMarkerPhoto: 'תמונה פרטית של סימן מזהה',
      animalType: 'סוג חיה',
      breed: 'גזע',
      color: 'צבע',
      collar: 'תיאור קולר',
      name: 'שם החיה',
      markings: 'סימנים מזהים',
      city: 'עיר',
      neighborhood: 'שכונה',
      location: 'מיקום',
      notes: 'הערות',
      finderName: 'שם המוצא/ת',
      contactName: 'שם איש קשר',
      phone: 'טלפון',
      email: 'אימייל',
      microchip: 'מספר שבב',
      verificationPrompt: 'שאלת אימות פרטית',
      verificationAnswer: 'תשובת אימות',
      privateMarkerPrompt: 'סימן פיזי פרטי',
      verificationQuizHint: 'דוגמה: “יש כתם לבן בכף הרגל האחורית?” — כך אפשר למנוע התחזות.',
      saveFound: 'לשלוח דיווח מציאה',
      saveLost: 'לשלוח דיווח אובדן',
      saveVolunteer: 'שמירת מתנדב',
      runShelter: 'ביצוע סריקה',
      useLocation: 'להשתמש במיקום שלי',
      bestFrame: 'אם מעלים וידאו, השרת בוחר אוטומטית את הפריים הכי טוב לזיהוי.',
      possibleMatches: 'התאמות אפשריות',
      instantPreviewTitle: 'בודקים התאמות כבר עכשיו',
      instantPreviewText: 'אחרי בחירת תמונה, יוצגו כאן דיווחים דומים בלי להמתין לשליחה הסופית.',
      instantMatchHint: 'הפאנל הזה מתעדכן בזמן אמת לפי תמונה, עיר וגזע.',
      instantWaiting: 'בחר/י תמונה כדי להתחיל בדיקת התאמות מהירה.',
      previewEmpty: 'תצוגה מקדימה של התמונה תופיע כאן',
      previewLoading: 'בודק התאמות...',
      previewUnavailable: 'התאמות חיות דורשות backend עם endpoint של preview.',
      noMatchesYet: 'לא נמצאו כרגע התאמות חזקות.',
      recentReports: 'דיווחים רלוונטיים',
      communityTrustTitle: 'אמון וקהילה',
      trust1: 'מספרי קשר מוסתרים', trust1t: 'הקשר בין בעלים למוצא יכול לעבור דרך ערוץ מאובטח.',
      trust2: 'אימות בעלות', trust2t: 'שאלת אימות וסימן פרטי עוזרים למנוע “pet flipping”.',
      trust3: 'שיתוף מתנדבים', trust3t: 'מתנדבי שכונה יכולים לקבל עדיפות להתראות קרובות.',
      municipalDraft: 'טיוטת 106',
      reportSaved: 'הדיווח נשמר.',
      volunteerSaved: 'פרטי המתנדב נשמרו.',
      shelterSaved: 'סריקת המקלט נשמרה.',
      loading: 'טוען...',
      none: 'אין עדיין נתונים.',
      sourcePlatform: 'פלטפורמת מקור',
      radiusKm: 'רדיוס ק״מ',
      shelterName: 'שם המקלט / הרשות',
      matchesTitle: 'דיווחים פעילים',
      volunteerTitle: 'מתנדב שכונתי',
      shelterTitle: 'סריקת קליטת מקלט'
    },
    en: {
      brand: 'PetConnect Israel', language: 'Language', liveMapNav: 'Live map', volunteerLogin: 'Volunteer login',
      heroBadge: '🐾 Time matters — report from your phone in seconds',
      heroTitle: 'If you just saw a stray animal, start with the camera — not a long form.',
      heroText: 'This GitHub Pages version is mobile-first: bold emergency CTAs, direct phone camera capture, automatic location, and fast match previews while the form is still being filled.',
      searchLabel: 'Search by city or animal type', searchPlaceholder: 'For example: Tel Aviv, husky, white cat', searchButton: 'Search',
      emergencyEyebrow: 'Emergency report', emergencyTitle: 'I found a dog right now!', emergencyText: 'This opens the phone camera immediately and sends you into the quick report flow.', emergencyButton: '📸 Open camera now',
      lostBig: 'I lost a pet', lostSmall: 'Blue = owner report', foundBig: 'I saw a stray animal', foundSmall: 'Green = finder report',
      featureCamera: 'Built-in camera flow', featureCameraText: 'One tap opens direct capture with thumb-friendly touch targets.', featureGeo: 'Automatic location', featureGeoText: 'Use Geolocation to fill coordinates and location while reporting.', featureInstant: 'Instant similar results', featureInstantText: 'The Found flow shows possible matches before final submit.',
      liveMapTitle: 'Live map of reports from the last hour', liveMapText: 'Quick visibility into the freshest sightings.', openMap: 'Open full map', storiesTitle: 'Recently reunited', storiesText: 'Successful reunions build trust and hope.', cityTitle: 'City pages', cityText: 'Fast landing pages for major cities in Israel.', footer: 'Static GitHub Pages build • AI, DB, SMS, and alerts still require an external backend', apiBase: 'API base URL', apiWarning: 'To make forms and matching work, edit config.js with your backend URL.',
      foundTitleNew: 'I saw a stray animal', foundSubtitle: 'Fast mobile report with possible matches shown while uploading.', lostTitleNew: 'I lost a pet', lostSubtitle: 'Smart form with location, private markers, and ownership verification.', step1of3: 'Step 1 of 3', stepFoundLabel: 'Photo and details', stepLostLabel: 'Identity and owner details', photoTipTitle: 'Photo tip', photoTip: 'Try shooting from the animal’s height in daylight. A sharp face photo improves matching.', image: 'Photo', video: 'Short video', nosePhoto: 'Nose-up photo', privateMarkerPhoto: 'Private marker photo', animalType: 'Animal type', breed: 'Breed', color: 'Color', collar: 'Collar description', name: 'Pet name', markings: 'Unique markings', city: 'City', neighborhood: 'Neighborhood', location: 'Location', notes: 'Notes', finderName: 'Finder name', contactName: 'Contact name', phone: 'Phone', email: 'Email', microchip: 'Microchip number', verificationPrompt: 'Private verification question', verificationAnswer: 'Verification answer', privateMarkerPrompt: 'Private physical marker', verificationQuizHint: 'Example: “Does the dog have a white spot on the back paw?”', saveFound: 'Submit found report', saveLost: 'Submit lost report', saveVolunteer: 'Save volunteer', runShelter: 'Run scan', useLocation: 'Use my location', bestFrame: 'If you upload video, the backend can choose the best frame automatically.', possibleMatches: 'Possible matches', instantPreviewTitle: 'Checking similar reports already', instantPreviewText: 'After choosing a photo, similar reports can show up before final submit.', instantMatchHint: 'This panel updates from image, city, and breed.', instantWaiting: 'Choose a photo to start a quick match preview.', previewEmpty: 'Your photo preview will appear here', previewLoading: 'Checking matches...', previewUnavailable: 'Live previews require a backend preview endpoint.', noMatchesYet: 'No strong matches yet.', recentReports: 'Relevant reports', communityTrustTitle: 'Trust and community', trust1: 'Masked contact channels', trust1t: 'Owner and finder contact can stay protected.', trust2: 'Ownership verification', trust2t: 'A private question and marker reduce pet flipping.', trust3: 'Volunteer network', trust3t: 'Neighborhood responders can get priority alerts nearby.', municipalDraft: '106 draft', reportSaved: 'Report saved.', volunteerSaved: 'Volunteer saved.', shelterSaved: 'Shelter scan saved.', loading: 'Loading...', none: 'No data yet.', sourcePlatform: 'Source platform', radiusKm: 'Radius km', shelterName: 'Shelter / authority name', matchesTitle: 'Active reports', volunteerTitle: 'Neighborhood volunteer', shelterTitle: 'Shelter intake scan'
    },
    ar: {
      brand: 'PetConnect Israel', language: 'اللغة', liveMapNav: 'الخريطة الحية', volunteerLogin: 'دخول المتطوع',
      heroBadge: '🐾 الوقت حاسم — بلّغ من هاتفك خلال ثوانٍ', heroTitle: 'إذا رأيت حيوانًا شاردًا الآن، ابدأ بالكاميرا لا بنموذج طويل.', heroText: 'هذه النسخة مبنية أولًا للهاتف: أزرار طوارئ واضحة، فتح مباشر للكاميرا، تحديد موقع تلقائي، ومعاينة تطابقات أثناء تعبئة البلاغ.', searchLabel: 'ابحث حسب المدينة أو نوع الحيوان', searchPlaceholder: 'مثال: تل أبيب، هاسكي، قط أبيض', searchButton: 'بحث', emergencyEyebrow: 'بلاغ طارئ', emergencyTitle: 'وجدت كلبًا الآن!', emergencyText: 'هذا الزر يفتح كاميرا الهاتف مباشرة وينقلك إلى البلاغ السريع.', emergencyButton: '📸 افتح الكاميرا الآن', lostBig: 'فقدت حيوانًا', lostSmall: 'الأزرق = بلاغ مالك', foundBig: 'رأيت حيوانًا شاردًا', foundSmall: 'الأخضر = بلاغ مُبلّغ', featureCamera: 'كاميرا مدمجة', featureCameraText: 'ضغطة واحدة تفتح الالتقاط المباشر مع أزرار كبيرة ومريحة.', featureGeo: 'موقع تلقائي', featureGeoText: 'استخدم تحديد الموقع لملء الإحداثيات والمكان أثناء البلاغ.', featureInstant: 'نتائج فورية مشابهة', featureInstantText: 'صفحة العثور تعرض تطابقات محتملة قبل الإرسال النهائي.', liveMapTitle: 'خريطة حية لبلاغات الساعة الأخيرة', liveMapText: 'رؤية سريعة لأحدث المشاهدات.', openMap: 'افتح الخريطة الكاملة', storiesTitle: 'عادوا مؤخرًا إلى البيت', storiesText: 'القصص الناجحة تبني الثقة والأمل.', cityTitle: 'صفحات المدن', cityText: 'صفحات سريعة للمدن الرئيسية في إسرائيل.', footer: 'نسخة ثابتة لـ GitHub Pages • الذكاء الاصطناعي وقاعدة البيانات والتنبيهات تحتاج Backend خارجي', apiBase: 'رابط الخادم', apiWarning: 'لكي تعمل النماذج والتطابقات، عدّل config.js وضع رابط الخادم.', foundTitleNew: 'رأيت حيوانًا شاردًا', foundSubtitle: 'بلاغ سريع للهاتف مع تطابقات محتملة أثناء رفع الصورة.', lostTitleNew: 'فقدت حيوانًا', lostSubtitle: 'نموذج ذكي مع الموقع وعلامات خاصة وأسئلة تحقق.', step1of3: 'الخطوة 1 من 3', stepFoundLabel: 'الصورة والتفاصيل', stepLostLabel: 'هوية الحيوان وبيانات المالك', photoTipTitle: 'نصيحة تصوير', photoTip: 'حاول التصوير من مستوى الحيوان وفي ضوء النهار. صورة واضحة للوجه تحسن التطابق.', image: 'صورة', video: 'فيديو قصير', nosePhoto: 'صورة مقربة للأنف', privateMarkerPhoto: 'صورة خاصة لعلامة مميزة', animalType: 'نوع الحيوان', breed: 'السلالة', color: 'اللون', collar: 'وصف الطوق', name: 'اسم الحيوان', markings: 'علامات مميزة', city: 'المدينة', neighborhood: 'الحي', location: 'الموقع', notes: 'ملاحظات', finderName: 'اسم المُبلّغ', contactName: 'اسم جهة الاتصال', phone: 'الهاتف', email: 'البريد الإلكتروني', microchip: 'رقم الشريحة', verificationPrompt: 'سؤال تحقق خاص', verificationAnswer: 'إجابة التحقق', privateMarkerPrompt: 'علامة جسدية خاصة', verificationQuizHint: 'مثال: هل توجد بقعة بيضاء في القدم الخلفية؟', saveFound: 'إرسال بلاغ العثور', saveLost: 'إرسال بلاغ الفقدان', saveVolunteer: 'حفظ المتطوع', runShelter: 'بدء المسح', useLocation: 'استخدم موقعي', bestFrame: 'عند رفع فيديو يمكن للخادم اختيار أفضل لقطة تلقائيًا.', possibleMatches: 'تطابقات محتملة', instantPreviewTitle: 'نفحص التقارير المشابهة الآن', instantPreviewText: 'بعد اختيار الصورة يمكن أن تظهر نتائج مشابهة قبل الإرسال النهائي.', instantMatchHint: 'هذه اللوحة تتحدث وفق الصورة والمدينة والسلالة.', instantWaiting: 'اختر صورة لبدء معاينة سريعة.', previewEmpty: 'ستظهر معاينة الصورة هنا', previewLoading: 'جارٍ فحص التطابقات...', previewUnavailable: 'المعاينة الحية تحتاج endpoint للمعاينة في الخادم.', noMatchesYet: 'لا توجد تطابقات قوية حاليًا.', recentReports: 'تقارير ذات صلة', communityTrustTitle: 'الثقة والمجتمع', trust1: 'قنوات اتصال محمية', trust1t: 'يمكن حماية التواصل بين المالك والواجد.', trust2: 'تحقق من الملكية', trust2t: 'سؤال خاص وعلامة مميزة يقللان الاحتيال.', trust3: 'شبكة متطوعين', trust3t: 'متطوعو الأحياء يمكنهم تلقي تنبيهات قريبة.', municipalDraft: 'مسودة 106', reportSaved: 'تم حفظ البلاغ.', volunteerSaved: 'تم حفظ بيانات المتطوع.', shelterSaved: 'تم حفظ مسح الملجأ.', loading: 'جارٍ التحميل...', none: 'لا توجد بيانات بعد.', sourcePlatform: 'المنصة', radiusKm: 'نطاق كم', shelterName: 'اسم الملجأ / السلطة', matchesTitle: 'بلاغات نشطة', volunteerTitle: 'متطوع الحي', shelterTitle: 'مسح استقبال الملجأ'
    }
  };

  let livePreviewTimer = null;
  let pendingCapturedImage = null;

  function apiBase() {
    return (window.PETCONNECT_CONFIG && window.PETCONNECT_CONFIG.API_BASE_URL || '').replace(/\/$/, '');
  }
  function apiReady() { return !!apiBase(); }
  function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function currentLang() { return localStorage.getItem('petconnect_lang') || 'he'; }
  function setLang(lang) { localStorage.setItem('petconnect_lang', TRANSLATIONS[lang] ? lang : 'he'); applyTranslations(); }
  const KEY_ALIASES = {home:'brand', found:'foundBig', lost:'lostBig', matches:'matchesTitle', volunteer:'volunteerTitle', shelter:'shelterTitle', oneTap:'emergencyButton', reportLost:'saveLost'};
  function t(key) { const lang = currentLang(); const actual = TRANSLATIONS[lang]?.[key] ? key : (KEY_ALIASES[key] || key); return TRANSLATIONS[lang]?.[actual] || TRANSLATIONS.he[actual] || key; }
  function cityLabel(city) { const lang = currentLang(); return city?.[lang] || city?.he || city?.en || ''; }
  function relativePrefix() { const path = location.pathname; const depth = path.split('/').filter(Boolean).length; return depth <= 1 ? '' : '../'; }

  function applyTranslations() {
    const lang = currentLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.he;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
    const brand = document.getElementById('brand-text'); if (brand) brand.textContent = dict.brand;
    const select = document.getElementById('language-select'); if (select) select.value = lang;
    document.title = dict.brand;
    renderCityGrid(); renderStories(); initBreedPickers();
  }

  function renderStories() {
    const box = document.getElementById('stories-grid');
    if (!box) return;
    box.innerHTML = STORIES.map(story => `
      <article class="story-card">
        <div class="story-emoji">${story.emoji}</div>
        <div>
          <strong>${escapeHtml(story[currentLang()] || story.he)}</strong>
          <div class="small">${escapeHtml(story.city)}</div>
        </div>
      </article>`).join('');
  }

  function renderCityGrid() {
    const grid = document.querySelector('[data-city-grid]');
    if (!grid) return;
    grid.innerHTML = CITIES.map(city => `<a class="city-link" href="${relativePrefix()}${city.slug}/">${escapeHtml(cityLabel(city))}</a>`).join('');
  }

  function initConfigEcho() {
    document.querySelectorAll('[data-api-url]').forEach(el => { el.textContent = apiBase() || 'config.js not set'; });
    document.querySelectorAll('[data-api-warning]').forEach(el => {
      el.textContent = t('apiWarning');
      el.hidden = apiReady();
    });
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function dataURLtoBlob(dataurl) {
    const parts = String(dataurl).split(',');
    const match = parts[0].match(/:(.*?);/);
    const mime = match ? match[1] : 'image/jpeg';
    const bin = atob(parts[1]);
    const len = bin.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function showImagePreview(input) {
    const box = input.closest('form')?.querySelector('[data-image-preview]');
    if (!box) return;
    const file = input.files?.[0];
    if (!file) { box.innerHTML = `<span>${escapeHtml(t(box.dataset.i18nEmpty || 'previewEmpty'))}</span>`; return; }
    const url = URL.createObjectURL(file);
    box.innerHTML = `<img src="${url}" alt="preview">`;
  }

  function initStoredCapture() {
    const input = document.getElementById('home-camera-input');
    const btn = document.getElementById('home-camera-button');
    if (btn && input) {
      btn.addEventListener('click', () => input.click());
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        const dataUrl = await readFileAsDataURL(file);
        sessionStorage.setItem('petconnect_captured_image', JSON.stringify({ dataUrl, name: file.name || 'capture.jpg', type: file.type || 'image/jpeg' }));
        location.href = relativePrefix() + 'found-pet/?captured=1';
      });
    }

    const stored = sessionStorage.getItem('petconnect_captured_image');
    if (!stored || !document.body.dataset.page || document.body.dataset.page !== 'found') return;
    try {
      const data = JSON.parse(stored);
      pendingCapturedImage = new File([dataURLtoBlob(data.dataUrl)], data.name || 'capture.jpg', { type: data.type || 'image/jpeg' });
      const box = document.querySelector('[data-image-preview]');
      if (box) box.innerHTML = `<img src="${data.dataUrl}" alt="preview">`;
      const note = document.querySelector('#found-form .notice');
      if (note) setNotice(note, 'ok', 'התמונה מהמצלמה נטענה. אפשר להשלים את הפרטים ולשלוח.');
      scheduleLivePreview();
    } catch {}
  }

  function initOpenCameraButtons() {
    document.querySelectorAll('[data-open-camera]').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = btn.closest('.form-card')?.querySelector('input[name="image"]');
        if (form) form.click();
      });
    });
  }

  function setNotice(el, type, text) {
    if (!el) return;
    el.className = `notice ${type}`;
    el.hidden = !text;
    el.textContent = text || '';
  }

  async function useLocation(button) {
    const form = button.closest('form');
    if (!form || !navigator.geolocation) return;
    button.disabled = true;
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = String(pos.coords.latitude.toFixed(6));
      const lng = String(pos.coords.longitude.toFixed(6));
      const latField = form.querySelector('[name="latitude"]');
      const lngField = form.querySelector('[name="longitude"]');
      if (latField) latField.value = lat;
      if (lngField) lngField.value = lng;
      const locField = form.querySelector('[name="seen_location"], [name="last_seen_location"]');
      if (locField && !locField.value) locField.value = `${lat}, ${lng}`;
      button.disabled = false;
      scheduleLivePreview();
    }, () => { button.disabled = false; });
  }

  function initGeolocate() { document.querySelectorAll('[data-use-location]').forEach(btn => btn.addEventListener('click', () => useLocation(btn))); }

  function initBreedPickers() {
    document.querySelectorAll('form').forEach(form => {
      const animalSelect = form.querySelector('[name="animal_type"]');
      const breedSelect = form.querySelector('[data-breed-select]');
      const chips = form.querySelector('[data-breed-chips]');
      if (!animalSelect || !breedSelect || !chips) return;
      const render = () => {
        const animal = animalSelect.value || 'dog';
        const options = BREEDS[animal] || BREEDS.dog;
        const current = breedSelect.value;
        breedSelect.innerHTML = options.map(opt => `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.labels[currentLang()] || opt.labels.he)}</option>`).join('');
        if (options.some(o => o.value === current)) breedSelect.value = current;
        chips.innerHTML = options.slice(0, 6).map(opt => `<button type="button" class="breed-chip ${breedSelect.value === opt.value ? 'active' : ''}" data-breed="${escapeHtml(opt.value)}">${opt.icon} ${escapeHtml(opt.labels[currentLang()] || opt.labels.he)}</button>`).join('');
        chips.querySelectorAll('[data-breed]').forEach(btn => btn.addEventListener('click', () => { breedSelect.value = btn.dataset.breed; render(); scheduleLivePreview(); }));
      };
      animalSelect.addEventListener('change', render);
      breedSelect.addEventListener('change', render);
      render();
    });
  }

  function initSearch() {
    const input = document.getElementById('home-search');
    const btn = document.getElementById('home-search-button');
    if (!input || !btn) return;
    const go = () => {
      const q = input.value.trim();
      if (!q) { location.href = relativePrefix() + 'matches/'; return; }
      const city = CITIES.find(c => [c.he, c.ar, c.en, c.slug].some(v => String(v).toLowerCase() === q.toLowerCase()));
      if (city) location.href = relativePrefix() + city.slug + '/';
      else location.href = relativePrefix() + 'matches/?q=' + encodeURIComponent(q);
    };
    btn.addEventListener('click', go);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }

  async function postMultipart(form, endpoint, successMsg) {
    const note = form.querySelector('.notice');
    if (!apiReady()) { setNotice(note, 'warn', t('apiWarning')); return; }
    const fd = new FormData(form);
    if (form.id === 'found-form' && pendingCapturedImage && !fd.get('image')?.name) fd.set('image', pendingCapturedImage, pendingCapturedImage.name);
    try {
      const res = await fetch(apiBase() + endpoint, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');
      setNotice(note, 'ok', successMsg);
      renderApiResult(form, data);
      if (form.id === 'found-form') sessionStorage.removeItem('petconnect_captured_image');
    } catch (err) { setNotice(note, 'err', err.message || 'Request failed'); }
  }

  async function postJson(form, endpoint, successMsg) {
    const note = form.querySelector('.notice');
    if (!apiReady()) { setNotice(note, 'warn', t('apiWarning')); return; }
    const body = Object.fromEntries(new FormData(form).entries());
    ['latitude', 'longitude', 'radius_km'].forEach(k => { if (body[k] === '') delete body[k]; else if (body[k] != null) body[k] = Number(body[k]); });
    try {
      const res = await fetch(apiBase() + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');
      setNotice(note, 'ok', successMsg);
      renderApiResult(form, data);
    } catch (err) { setNotice(note, 'err', err.message || 'Request failed'); }
  }

  function renderMatchCard(match) {
    const overlap = Array.isArray(match.tag_overlap) && match.tag_overlap.length ? `<div class="small">${escapeHtml(match.tag_overlap.join(' • '))}</div>` : '';
    return `<div class="result-card">
      <div class="match-head"><strong>${escapeHtml(match.name || 'Pet')}</strong><span class="score-pill">${escapeHtml(match.score || '')}</span></div>
      <div class="small">${escapeHtml(match.city || '')}</div>
      <div class="small">${escapeHtml(match.reason || '')}</div>
      ${overlap}
      ${match.private_marker_prompt ? `<div class="small"><strong>${escapeHtml(t('privateMarkerPrompt'))}:</strong> ${escapeHtml(match.private_marker_prompt)}</div>` : ''}
    </div>`;
  }

  function renderApiResult(form, data) {
    const out = form.parentElement.querySelector('[data-result]');
    if (!out) return;
    const parts = [];
    if (data.best_frame) parts.push(`<div class="result-card"><strong>${escapeHtml(t('bestFrame'))}</strong><div class="small">${escapeHtml(JSON.stringify(data.best_frame))}</div></div>`);
    if (data.municipal_draft) parts.push(`<div class="result-card"><strong>${escapeHtml(t('municipalDraft'))}</strong><div class="small">${escapeHtml(data.municipal_draft.subject || '')}</div><div class="small">${escapeHtml(data.municipal_draft.body || '')}</div></div>`);
    if (Array.isArray(data.matches) && data.matches.length) parts.push(`<div class="list">${data.matches.map(renderMatchCard).join('')}</div>`);
    else if (Array.isArray(data.matches)) parts.push(`<div class="result-card">${escapeHtml(t('noMatchesYet'))}</div>`);
    out.innerHTML = parts.join('');
  }

  async function previewFoundMatches() {
    const form = document.getElementById('found-form');
    const box = document.querySelector('[data-live-matches]');
    const status = document.querySelector('[data-live-match-status]');
    if (!form || !box || !status) return;
    const fd = new FormData(form);
    const file = form.querySelector('input[name="image"]')?.files?.[0] || pendingCapturedImage;
    const video = form.querySelector('input[name="video"]')?.files?.[0];
    if (!file && !video) { status.className = 'empty'; status.textContent = t('instantWaiting'); box.innerHTML = ''; return; }
    if (!apiReady()) { status.className = 'empty'; status.textContent = t('previewUnavailable'); box.innerHTML = ''; return; }
    status.className = 'empty'; status.textContent = t('previewLoading');
    if (file && !fd.get('image')?.name) fd.set('image', file, file.name);
    try {
      let res = await fetch(apiBase() + '/api/found-reports/preview', { method: 'POST', body: fd });
      if (res.status === 404) {
        // graceful fallback: show recent reports by city instead
        const params = new URLSearchParams();
        const city = String(fd.get('city') || '').trim();
        if (city) params.set('city', city);
        res = await fetch(apiBase() + '/api/lost-pets?' + params.toString());
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed');
        const items = Array.isArray(data) ? data.slice(0, 4).map(item => ({ name: item.name, city: item.city, score: '—', reason: t('recentReports'), tag_overlap: item.semantic_tags || [], private_marker_prompt: item.private_marker_prompt || '' })) : [];
        status.textContent = items.length ? t('possibleMatches') : t('noMatchesYet');
        box.innerHTML = items.map(renderMatchCard).join('');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      const matches = Array.isArray(data.matches) ? data.matches : [];
      status.textContent = matches.length ? `${t('possibleMatches')} · ${matches.length}` : t('noMatchesYet');
      box.innerHTML = matches.map(renderMatchCard).join('');
    } catch (err) {
      status.textContent = err.message || 'Preview failed';
      box.innerHTML = '';
    }
  }

  function scheduleLivePreview() {
    clearTimeout(livePreviewTimer);
    livePreviewTimer = setTimeout(previewFoundMatches, 450);
  }

  function initFoundPreviewHooks() {
    const form = document.getElementById('found-form');
    if (!form) return;
    ['change', 'input'].forEach(evt => form.addEventListener(evt, e => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches('input[name="image"], input[name="video"], input[name="city"], select[name="breed"], select[name="animal_type"], input[name="microchip_number"]')) scheduleLivePreview();
      if (target.matches('input[name="image"]')) showImagePreview(target);
    }));
  }

  function initLostPreviewHooks() {
    const input = document.getElementById('lost-image');
    if (!input) return;
    input.addEventListener('change', () => showImagePreview(input));
  }

  async function fetchRecentReports() {
    if (!apiReady()) return FALLBACK_RECENT;
    try {
      const res = await fetch(apiBase() + '/api/lost-pets');
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) throw new Error('bad response');
      return data;
    } catch { return FALLBACK_RECENT; }
  }

  async function initMaps() {
    if (typeof L === 'undefined') return;
    document.querySelectorAll('[data-map]').forEach(el => {
      if (el._leaflet_id) return;
      const map = L.map(el).setView([31.5, 34.9], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      map.on('click', evt => {
        const form = el.closest('.grid')?.querySelector('form') || document.querySelector('form');
        if (!form) return;
        const lat = form.querySelector('[name="latitude"]');
        const lng = form.querySelector('[name="longitude"]');
        const loc = form.querySelector('[name="seen_location"], [name="last_seen_location"]');
        if (lat) lat.value = evt.latlng.lat.toFixed(6);
        if (lng) lng.value = evt.latlng.lng.toFixed(6);
        if (loc && !loc.value) loc.value = `${evt.latlng.lat.toFixed(6)}, ${evt.latlng.lng.toFixed(6)}`;
        if (el._marker) el._marker.setLatLng(evt.latlng); else el._marker = L.marker(evt.latlng).addTo(map);
        scheduleLivePreview();
      });
      el._map = map;
    });

    const homeMapEl = document.getElementById('home-map');
    if (homeMapEl && homeMapEl._map) {
      const items = await fetchRecentReports();
      items.slice(0, 20).forEach(item => {
        if (item.latitude && item.longitude) L.circleMarker([item.latitude, item.longitude], { radius: 8, color: '#ff6b00', fillColor: '#ff6b00', fillOpacity: 0.8 }).addTo(homeMapEl._map).bindPopup(`<strong>${escapeHtml(item.name || item.animal_type || 'Report')}</strong><br>${escapeHtml(item.city || '')}`);
      });
    }

    const matchesMap = document.getElementById('matches-map');
    if (matchesMap) {
      const map = L.map(matchesMap).setView([31.5, 34.9], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      window._matchesMap = map;
    }
  }

  async function loadMatches() {
    const list = document.getElementById('matches-list');
    if (!list) return;
    if (!apiReady()) { list.innerHTML = `<div class="empty">${escapeHtml(t('apiWarning'))}</div>`; return; }
    list.innerHTML = `<div class="empty">${escapeHtml(t('loading'))}</div>`;
    const params = new URLSearchParams(location.search);
    const city = document.body.dataset.citySlug || params.get('city') || '';
    const q = params.get('q') || '';
    try {
      const res = await fetch(apiBase() + '/api/lost-pets' + (city ? ('?city=' + encodeURIComponent(city)) : ''));
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      let items = Array.isArray(data) ? data : [];
      if (q) items = items.filter(item => JSON.stringify(item).toLowerCase().includes(q.toLowerCase()));
      if (!items.length) { list.innerHTML = `<div class="empty">${escapeHtml(t('none'))}</div>`; return; }
      list.innerHTML = items.map(item => `
        <div class="result-card">
          <div class="match-head"><strong>${escapeHtml(item.name || 'Pet')}</strong><span class="status-pill">${escapeHtml(item.status || 'active')}</span></div>
          <div class="small">${escapeHtml(item.animal_type || '')} · ${escapeHtml(item.breed || '')} · ${escapeHtml(item.city || '')}</div>
          <div class="small">${escapeHtml(item.color || '')} · ${escapeHtml(item.unique_markings || '')}</div>
          <div class="small">${escapeHtml(item.last_seen_location || '')}</div>
        </div>`).join('');
      if (window._matchesMap) items.forEach(item => { if (item.latitude && item.longitude) L.marker([item.latitude, item.longitude]).addTo(window._matchesMap).bindPopup(`<strong>${escapeHtml(item.name || 'Pet')}</strong><br>${escapeHtml(item.city || '')}`); });
    } catch (err) { list.innerHTML = `<div class="empty">${escapeHtml(err.message || 'Failed')}</div>`; }
  }

  function initForms() {
    const lost = document.getElementById('lost-form'); if (lost) lost.addEventListener('submit', e => { e.preventDefault(); postMultipart(lost, '/api/lost-pets', t('reportSaved')); });
    const found = document.getElementById('found-form'); if (found) found.addEventListener('submit', e => { e.preventDefault(); postMultipart(found, '/api/found-reports', t('reportSaved')); });
    const shelter = document.getElementById('shelter-form'); if (shelter) shelter.addEventListener('submit', e => { e.preventDefault(); postMultipart(shelter, '/api/shelter/intake-scan', t('shelterSaved')); });
    const vol = document.getElementById('volunteer-form'); if (vol) vol.addEventListener('submit', e => { e.preventDefault(); postJson(vol, '/api/volunteers', t('volunteerSaved')); });
  }

  function initPwa() { if ('serviceWorker' in navigator) navigator.serviceWorker.register(relativePrefix() + 'sw.js').catch(() => {}); }

  function initLang() {
    const select = document.getElementById('language-select');
    if (select) select.addEventListener('change', e => setLang(e.target.value));
    applyTranslations();
  }

  function renderCityPageMeta() {
    const slug = document.body.dataset.citySlug;
    if (!slug) return;
    const city = CITIES.find(c => c.slug === slug);
    const title = document.getElementById('city-page-title');
    const subtitle = document.getElementById('city-page-subtitle');
    if (title) title.textContent = `${cityLabel(city)} · ${t('matchesTitle')}`;
    if (subtitle) subtitle.textContent = t('liveMapText');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLang(); initConfigEcho(); initSearch(); initStoredCapture(); initOpenCameraButtons(); initGeolocate(); initBreedPickers(); initMaps(); initForms(); initFoundPreviewHooks(); initLostPreviewHooks(); loadMatches(); renderStories(); renderCityGrid(); renderCityPageMeta(); initPwa();
  });
})();
