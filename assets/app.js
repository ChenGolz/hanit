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
      successMatchesTitle: 'התאמות אפשריות שנמצאו עכשיו',
      successMatchesText: 'כדאי לבדוק את ההתאמות כבר עכשיו — אולי הבעלים נמצא במרחק כמה רחובות.',
      openLostReport: 'פתיחת דיווח',
      manualPinHint: 'אפשר ללחוץ על המפה כדי להזיז את הסיכה למיקום המדויק האחרון.',
      photoLink: 'קישור לתמונה',
      folderSearchMode: 'חיפוש מהתיקייה',
      staticSearchReady: 'בודק התאמות מול התמונות שהוספת לתיקייה...',
      staticLibraryEmpty: 'עדיין לא נוספו תמונות לחיפוש. הוסיפי קבצים לתיקייה library/pets ועדכני data/pets.json.',
      staticSearchOnly: 'בוצע חיפוש מול התמונות שבתיקייה. הקובץ שהמעלה צירף לא נשמר בשרת.',
      staticSearchSaved: 'החיפוש הושלם מול התמונות שבתיקייה.',
      reportSaved: 'הדיווח נשמר.',
      volunteerSaved: 'פרטי המתנדב נשמרו.',
      installApp: 'התקן את האפליקציה לגישה מהירה',
      scanningFace: 'סורק פנים...',
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
      foundTitleNew: 'I saw a stray animal', foundSubtitle: 'Fast mobile report with possible matches shown while uploading.', lostTitleNew: 'I lost a pet', lostSubtitle: 'Smart form with location, private markers, and ownership verification.', step1of3: 'Step 1 of 3', stepFoundLabel: 'Photo and details', stepLostLabel: 'Identity and owner details', photoTipTitle: 'Photo tip', photoTip: 'Try shooting from the animal’s height in daylight. A sharp face photo improves matching.', image: 'Photo', video: 'Short video', nosePhoto: 'Nose-up photo', privateMarkerPhoto: 'Private marker photo', animalType: 'Animal type', breed: 'Breed', color: 'Color', collar: 'Collar description', name: 'Pet name', markings: 'Unique markings', city: 'City', neighborhood: 'Neighborhood', location: 'Location', notes: 'Notes', finderName: 'Finder name', contactName: 'Contact name', phone: 'Phone', email: 'Email', microchip: 'Microchip number', verificationPrompt: 'Private verification question', verificationAnswer: 'Verification answer', privateMarkerPrompt: 'Private physical marker', verificationQuizHint: 'Example: “Does the dog have a white spot on the back paw?”', saveFound: 'Submit found report', saveLost: 'Submit lost report', saveVolunteer: 'Save volunteer', runShelter: 'Run scan', useLocation: 'Use my location', bestFrame: 'If you upload video, the backend can choose the best frame automatically.', possibleMatches: 'Possible matches', instantPreviewTitle: 'Checking similar reports already', instantPreviewText: 'After choosing a photo, similar reports can show up before final submit.', instantMatchHint: 'This panel updates from image, city, and breed.', instantWaiting: 'Choose a photo to start a quick match preview.', previewEmpty: 'Your photo preview will appear here', previewLoading: 'Checking matches...', previewUnavailable: 'Live previews require a backend preview endpoint.', noMatchesYet: 'No strong matches yet.', recentReports: 'Relevant reports', communityTrustTitle: 'Trust and community', trust1: 'Masked contact channels', trust1t: 'Owner and finder contact can stay protected.', trust2: 'Ownership verification', trust2t: 'A private question and marker reduce pet flipping.', trust3: 'Volunteer network', trust3t: 'Neighborhood responders can get priority alerts nearby.', municipalDraft: '106 draft', reportSaved: 'Report saved.', volunteerSaved: 'Volunteer saved.', installApp: 'Install app for quick access', scanningFace: 'Scanning face...', shelterSaved: 'Shelter scan saved.', loading: 'Loading...', none: 'No data yet.', sourcePlatform: 'Source platform', radiusKm: 'Radius km', shelterName: 'Shelter / authority name', matchesTitle: 'Active reports', volunteerTitle: 'Neighborhood volunteer', shelterTitle: 'Shelter intake scan', folderSearchMode: 'Folder search mode', staticSearchReady: 'Checking against the images you added to the folder...', staticLibraryEmpty: 'No library images were added yet. Put files in library/pets and update data/pets.json.', staticSearchOnly: 'This searched the images you added to the folder. The visitor upload was not saved to a server.', staticSearchSaved: 'Folder search finished successfully.'
    },
    ar: {
      brand: 'PetConnect Israel', language: 'اللغة', liveMapNav: 'الخريطة الحية', volunteerLogin: 'دخول المتطوع',
      heroBadge: '🐾 الوقت حاسم — بلّغ من هاتفك خلال ثوانٍ', heroTitle: 'إذا رأيت حيوانًا شاردًا الآن، ابدأ بالكاميرا لا بنموذج طويل.', heroText: 'هذه النسخة مبنية أولًا للهاتف: أزرار طوارئ واضحة، فتح مباشر للكاميرا، تحديد موقع تلقائي، ومعاينة تطابقات أثناء تعبئة البلاغ.', searchLabel: 'ابحث حسب المدينة أو نوع الحيوان', searchPlaceholder: 'مثال: تل أبيب، هاسكي، قط أبيض', searchButton: 'بحث', emergencyEyebrow: 'بلاغ طارئ', emergencyTitle: 'وجدت كلبًا الآن!', emergencyText: 'هذا الزر يفتح كاميرا الهاتف مباشرة وينقلك إلى البلاغ السريع.', emergencyButton: '📸 افتح الكاميرا الآن', lostBig: 'فقدت حيوانًا', lostSmall: 'الأزرق = بلاغ مالك', foundBig: 'رأيت حيوانًا شاردًا', foundSmall: 'الأخضر = بلاغ مُبلّغ', featureCamera: 'كاميرا مدمجة', featureCameraText: 'ضغطة واحدة تفتح الالتقاط المباشر مع أزرار كبيرة ومريحة.', featureGeo: 'موقع تلقائي', featureGeoText: 'استخدم تحديد الموقع لملء الإحداثيات والمكان أثناء البلاغ.', featureInstant: 'نتائج فورية مشابهة', featureInstantText: 'صفحة العثور تعرض تطابقات محتملة قبل الإرسال النهائي.', liveMapTitle: 'خريطة حية لبلاغات الساعة الأخيرة', liveMapText: 'رؤية سريعة لأحدث المشاهدات.', openMap: 'افتح الخريطة الكاملة', storiesTitle: 'عادوا مؤخرًا إلى البيت', storiesText: 'القصص الناجحة تبني الثقة والأمل.', cityTitle: 'صفحات المدن', cityText: 'صفحات سريعة للمدن الرئيسية في إسرائيل.', footer: 'نسخة ثابتة لـ GitHub Pages • الذكاء الاصطناعي وقاعدة البيانات والتنبيهات تحتاج Backend خارجي', apiBase: 'رابط الخادم', apiWarning: 'لكي تعمل النماذج والتطابقات، عدّل config.js وضع رابط الخادم.', foundTitleNew: 'رأيت حيوانًا شاردًا', foundSubtitle: 'بلاغ سريع للهاتف مع تطابقات محتملة أثناء رفع الصورة.', lostTitleNew: 'فقدت حيوانًا', lostSubtitle: 'نموذج ذكي مع الموقع وعلامات خاصة وأسئلة تحقق.', step1of3: 'الخطوة 1 من 3', stepFoundLabel: 'الصورة والتفاصيل', stepLostLabel: 'هوية الحيوان وبيانات المالك', photoTipTitle: 'نصيحة تصوير', photoTip: 'حاول التصوير من مستوى الحيوان وفي ضوء النهار. صورة واضحة للوجه تحسن التطابق.', image: 'صورة', video: 'فيديو قصير', nosePhoto: 'صورة مقربة للأنف', privateMarkerPhoto: 'صورة خاصة لعلامة مميزة', animalType: 'نوع الحيوان', breed: 'السلالة', color: 'اللون', collar: 'وصف الطوق', name: 'اسم الحيوان', markings: 'علامات مميزة', city: 'المدينة', neighborhood: 'الحي', location: 'الموقع', notes: 'ملاحظات', finderName: 'اسم المُبلّغ', contactName: 'اسم جهة الاتصال', phone: 'الهاتف', email: 'البريد الإلكتروني', microchip: 'رقم الشريحة', verificationPrompt: 'سؤال تحقق خاص', verificationAnswer: 'إجابة التحقق', privateMarkerPrompt: 'علامة جسدية خاصة', verificationQuizHint: 'مثال: هل توجد بقعة بيضاء في القدم الخلفية؟', saveFound: 'إرسال بلاغ العثور', saveLost: 'إرسال بلاغ الفقدان', saveVolunteer: 'حفظ المتطوع', runShelter: 'بدء المسح', useLocation: 'استخدم موقعي', bestFrame: 'عند رفع فيديو يمكن للخادم اختيار أفضل لقطة تلقائيًا.', possibleMatches: 'تطابقات محتملة', instantPreviewTitle: 'نفحص التقارير المشابهة الآن', instantPreviewText: 'بعد اختيار الصورة يمكن أن تظهر نتائج مشابهة قبل الإرسال النهائي.', instantMatchHint: 'هذه اللوحة تتحدث وفق الصورة والمدينة والسلالة.', instantWaiting: 'اختر صورة لبدء معاينة سريعة.', previewEmpty: 'ستظهر معاينة الصورة هنا', previewLoading: 'جارٍ فحص التطابقات...', previewUnavailable: 'المعاينة الحية تحتاج endpoint للمعاينة في الخادم.', noMatchesYet: 'لا توجد تطابقات قوية حاليًا.', recentReports: 'تقارير ذات صلة', communityTrustTitle: 'الثقة والمجتمع', trust1: 'قنوات اتصال محمية', trust1t: 'يمكن حماية التواصل بين المالك والواجد.', trust2: 'تحقق من الملكية', trust2t: 'سؤال خاص وعلامة مميزة يقللان الاحتيال.', trust3: 'شبكة متطوعين', trust3t: 'متطوعو الأحياء يمكنهم تلقي تنبيهات قريبة.', municipalDraft: 'مسودة 106', reportSaved: 'تم حفظ البلاغ.', volunteerSaved: 'تم حفظ بيانات المتطوع.', installApp: 'ثبّت التطبيق للوصول السريع', scanningFace: 'جارٍ فحص الوجه...', shelterSaved: 'تم حفظ مسح الملجأ.', loading: 'جارٍ التحميل...', none: 'لا توجد بيانات بعد.', sourcePlatform: 'المنصة', radiusKm: 'نطاق كم', shelterName: 'اسم الملجأ / السلطة', matchesTitle: 'بلاغات نشطة', volunteerTitle: 'متطوع الحي', shelterTitle: 'مسح استقبال الملجأ', folderSearchMode: 'وضع البحث من المجلد', staticSearchReady: 'يجري الفحص مقابل الصور التي أضفتها إلى المجلد...', staticLibraryEmpty: 'لم تُضَف صور بعد إلى مكتبة البحث. ضعي الملفات في library/pets وحدّثي data/pets.json.', staticSearchOnly: 'تم البحث فقط داخل الصور التي أضفتها إلى المجلد. الملف الذي رفعه الزائر لم يُحفَظ على خادم.', staticSearchSaved: 'انتهى البحث داخل المجلد بنجاح.'
    }
  };

  let livePreviewTimer = null;
  let pendingCapturedImage = null;
  let installPromptEvent = null;
  let loadingCounter = 0;
  const preparedImages = new WeakMap();

  function apiBase() {
    return (window.PETCONNECT_CONFIG && window.PETCONNECT_CONFIG.API_BASE_URL || '').replace(/\/$/, '');
  }
  function apiReady() { return !!apiBase(); }
  const LOCAL_REPORTS_KEY = 'petconnect_local_reports_v1';
  function readLocalReports() {
    try {
      const data = JSON.parse(localStorage.getItem(LOCAL_REPORTS_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  function writeLocalReports(items) {
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(items));
  }
  async function saveReportLocally(form, type) {
    const fd = new FormData(form);
    const imageInput = form.querySelector('input[name="image"]');
    const imageFile = getPreparedFile(imageInput) || (type === 'found' ? pendingCapturedImage : null) || imageInput?.files?.[0] || null;
    let image_url = '';
    if (imageFile) {
      try { image_url = await readFileAsDataURL(imageFile); } catch {}
    }
    const item = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      status: 'saved-on-this-device',
      source: 'local-demo',
      report_type: type,
      created_at: new Date().toISOString(),
      name: String(fd.get('name') || fd.get('finder_name') || (type === 'lost' ? 'Missing pet' : 'Found pet')),
      animal_type: String(fd.get('animal_type') || 'dog'),
      breed: String(fd.get('breed') || ''),
      color: String(fd.get('color') || ''),
      city: String(fd.get('city') || ''),
      neighborhood: String(fd.get('neighborhood') || ''),
      latitude: fd.get('latitude') ? Number(fd.get('latitude')) : null,
      longitude: fd.get('longitude') ? Number(fd.get('longitude')) : null,
      last_seen_location: String(fd.get('last_seen_location') || fd.get('seen_location') || ''),
      notes: String(fd.get('notes') || ''),
      contact_name: String(fd.get('contact_name') || ''),
      contact_phone: String(fd.get('contact_phone') || ''),
      contact_email: String(fd.get('contact_email') || ''),
      image_url,
      local_only: true
    };
    const items = readLocalReports();
    items.unshift(item);
    writeLocalReports(items.slice(0, 100));
    return item;
  }

  const STATIC_LIBRARY_URL = 'data/pets.json';
  let staticLibraryPromise = null;
  const staticImageHashCache = new Map();

  function staticLibraryPath() {
    return relativePrefix() + STATIC_LIBRARY_URL;
  }

  async function loadStaticLibrary() {
    if (!staticLibraryPromise) {
      staticLibraryPromise = fetch(staticLibraryPath(), { cache: 'no-store' })
        .then(res => res.ok ? res.json() : [])
        .then(items => Array.isArray(items) ? items.map((item, index) => normalizeStaticItem(item, index)) : [])
        .catch(() => []);
    }
    return staticLibraryPromise;
  }

  function normalizeStaticItem(item, index) {
    const image = String(item.image || item.image_url || '').trim();
    const normalizedImage = image && !/^https?:\/\//i.test(image) && !image.startsWith('data:') ? relativePrefix() + image.replace(/^\/+/, '') : image;
    return {
      id: item.id || `static-${index + 1}`,
      lost_pet_id: item.id || `static-${index + 1}`,
      name: item.name || item.pet_name || 'Pet',
      city: item.city || '',
      animal_type: item.animal_type || 'dog',
      breed: item.breed || '',
      color: item.color || '',
      unique_markings: item.unique_markings || item.markings || '',
      private_marker_prompt: item.private_marker_prompt || '',
      reason: item.reason || '',
      tag_overlap: Array.isArray(item.tags) ? item.tags : [],
      image_url: normalizedImage,
      report_type: item.report_type || item.type || 'lost',
      microchip_number: item.microchip_number || '',
      searchable: image ? item.searchable !== false : false
    };
  }

  function normalizeCompareValue(value) {
    return String(value || '').trim().toLowerCase();
  }

  async function imageElementFromSource(source) {
    if (typeof source === 'string') {
      if (typeof createImageBitmap === 'function') {
        const res = await fetch(source, { cache: 'force-cache' });
        if (!res.ok) throw new Error('Image fetch failed');
        const blob = await res.blob();
        return await createImageBitmap(blob);
      }
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = source;
      });
    }
    if (typeof createImageBitmap === 'function' && source instanceof Blob) {
      return await createImageBitmap(source);
    }
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(source);
    });
  }

  async function computeAverageHash(source) {
    const cacheKey = typeof source === 'string' ? source : null;
    if (cacheKey && staticImageHashCache.has(cacheKey)) return staticImageHashCache.get(cacheKey);
    const img = await imageElementFromSource(source);
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    const gray = [];
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      gray.push(value);
      sum += value;
    }
    const avg = sum / gray.length;
    const hash = gray.map(v => v >= avg ? '1' : '0').join('');
    if (cacheKey) staticImageHashCache.set(cacheKey, hash);
    return hash;
  }

  function hashSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let same = 0;
    for (let i = 0; i < a.length; i += 1) if (a[i] === b[i]) same += 1;
    return same / a.length;
  }

  function metadataBoost(query, item) {
    let score = 0;
    const queryCity = normalizeCompareValue(query.city);
    const itemCity = normalizeCompareValue(item.city);
    const queryAnimal = normalizeCompareValue(query.animal_type);
    const itemAnimal = normalizeCompareValue(item.animal_type);
    const queryBreed = normalizeCompareValue(query.breed);
    const itemBreed = normalizeCompareValue(item.breed);
    const queryColor = normalizeCompareValue(query.color);
    const itemColor = normalizeCompareValue(item.color);
    const queryChip = normalizeCompareValue(query.microchip_number);
    const itemChip = normalizeCompareValue(item.microchip_number);
    if (queryChip && itemChip && queryChip === itemChip) return 1;
    if (queryCity && itemCity && queryCity === itemCity) score += 0.08;
    if (queryAnimal && itemAnimal && queryAnimal === itemAnimal) score += 0.06;
    if (queryBreed && itemBreed && queryBreed === itemBreed) score += 0.1;
    if (queryColor && itemColor && queryColor === itemColor) score += 0.04;
    return score;
  }

  async function searchStaticLibrary(query) {
    const library = await loadStaticLibrary();
    const candidates = library.filter(item => item.searchable && item.image_url && (!query.report_type || normalizeCompareValue(item.report_type) === normalizeCompareValue(query.report_type)));
    if (!candidates.length) return [];
    const fileHash = query.file ? await computeAverageHash(query.file) : null;
    const results = [];
    for (const item of candidates) {
      let score = metadataBoost(query, item);
      if (fileHash) {
        try {
          const itemHash = await computeAverageHash(item.image_url);
          score += hashSimilarity(fileHash, itemHash) * 0.86;
        } catch {
          score += 0;
        }
      }
      results.push({
        ...item,
        reason: item.reason || t('folderSearchMode'),
        score: Math.max(0, Math.min(99, Math.round(score * 100)))
      });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, query.limit || 6);
  }

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

  function loadingEl() { return document.getElementById('loading-spinner'); }

  function showLoading(key) {
    loadingCounter += 1;
    const el = loadingEl();
    if (!el) return;
    const text = el.querySelector('[data-loading-text]');
    if (text && key) text.textContent = t(key);
    el.hidden = false;
    document.body.classList.add('loading-active');
  }

  function hideLoading() {
    loadingCounter = Math.max(0, loadingCounter - 1);
    if (loadingCounter > 0) return;
    const el = loadingEl();
    if (el) el.hidden = true;
    document.body.classList.remove('loading-active');
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (err) => { URL.revokeObjectURL(url); reject(err); };
      img.src = url;
    });
  }

  async function compressImageFile(file, options = {}) {
    if (!(file instanceof File) || !String(file.type || '').startsWith('image/')) return file;
    const { maxWidth = 800, maxHeight = 800, quality = 0.82 } = options;
    let image;
    try { image = await readImage(file); } catch { return file; }
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) return file;
    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    if (scale === 1 && file.size <= 900 * 1024) return file;
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;
    if (blob.size >= file.size && scale === 1) return file;
    const compressedName = (file.name || 'upload').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], compressedName, { type: 'image/jpeg', lastModified: Date.now() });
  }

  async function prepareImageInput(input, options = {}) {
    const file = input?.files?.[0];
    if (!file) { preparedImages.delete(input); return null; }
    const compressed = await compressImageFile(file, options);
    preparedImages.set(input, compressed);
    return compressed;
  }

  function getPreparedFile(input) {
    if (!input) return null;
    return preparedImages.get(input) || input.files?.[0] || null;
  }

  function showImagePreview(input) {
    const box = input.closest('form')?.querySelector('[data-image-preview]');
    if (!box) return;
    const file = getPreparedFile(input) || input.files?.[0];
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
        showLoading('scanningFace');
        try {
          const compressed = await compressImageFile(file);
          let coords = null;
          try {
            const pos = await getCurrentPosition();
            coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          } catch {
            coords = null;
          }
          const dataUrl = await readFileAsDataURL(compressed);
          sessionStorage.setItem('petconnect_captured_image', JSON.stringify({
            dataUrl,
            name: compressed.name || 'capture.jpg',
            type: compressed.type || 'image/jpeg',
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null
          }));
          location.href = relativePrefix() + 'found-pet/?captured=1';
        } finally {
          hideLoading();
        }
      });
    }

    const stored = sessionStorage.getItem('petconnect_captured_image');
    if (!stored || !document.body.dataset.page || document.body.dataset.page !== 'found') return;
    try {
      const data = JSON.parse(stored);
      pendingCapturedImage = new File([dataURLtoBlob(data.dataUrl)], data.name || 'capture.jpg', { type: data.type || 'image/jpeg' });
      const box = document.querySelector('[data-image-preview]');
      if (box) box.innerHTML = `<img src="${data.dataUrl}" alt="preview">`;
      const form = document.getElementById('found-form');
      if (form && data.latitude && data.longitude) fillLocationFields(form, { latitude: data.latitude, longitude: data.longitude }, false);
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

  function syncMapMarker(form) {
    if (!form) return;
    const mapEl = form.closest('.grid')?.querySelector('[data-map]') || form.parentElement?.querySelector('[data-map]') || document.querySelector('[data-map]');
    const map = mapEl?._map;
    if (!map) return;
    const lat = Number(form.querySelector('[name="latitude"]')?.value);
    const lng = Number(form.querySelector('[name="longitude"]')?.value);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const latlng = [lat, lng];
    if (mapEl._marker) mapEl._marker.setLatLng(latlng); else mapEl._marker = L.marker(latlng).addTo(map);
    map.setView(latlng, Math.max(map.getZoom(), 14));
  }

  function fillLocationFields(form, coords, force = false) {
    if (!form || !coords) return;
    const lat = String(Number(coords.latitude).toFixed(6));
    const lng = String(Number(coords.longitude).toFixed(6));
    const latField = form.querySelector('[name="latitude"]');
    const lngField = form.querySelector('[name="longitude"]');
    const locField = form.querySelector('[name="seen_location"], [name="last_seen_location"]');
    if (latField && (force || !latField.value)) latField.value = lat;
    if (lngField && (force || !lngField.value)) lngField.value = lng;
    if (locField && (force || !locField.value)) locField.value = `${lat}, ${lng}`;
    syncMapMarker(form);
  }

  function getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Geolocation unavailable')); return; }
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 6500, maximumAge: 0, ...options });
    });
  }

  async function captureLocationForForm(form, force = false) {
    if (!form || !navigator.geolocation) return null;
    const latField = form.querySelector('[name="latitude"]');
    const lngField = form.querySelector('[name="longitude"]');
    if (!force && latField?.value && lngField?.value) return { latitude: Number(latField.value), longitude: Number(lngField.value) };
    try {
      const pos = await getCurrentPosition();
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      fillLocationFields(form, coords, force);
      scheduleLivePreview();
      return coords;
    } catch {
      return null;
    }
  }

  async function useLocation(button) {
    const form = button.closest('form');
    if (!form) return;
    button.disabled = true;
    await captureLocationForForm(form, true);
    button.disabled = false;
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
    if (!apiReady()) {
      const localType = form.id === 'lost-form' ? 'lost' : form.id === 'found-form' ? 'found' : '';
      if (!localType) { setNotice(note, 'warn', t('apiWarning')); return; }
      showLoading(form.id === 'found-form' ? 'scanningFace' : 'loading');
      try {
        if (!new FormData(form).get('latitude') || !new FormData(form).get('longitude')) await captureLocationForForm(form, false);
        const saved = await saveReportLocally(form, localType);
        if (form.id === 'found-form') {
          const imageInput = form.querySelector('input[name="image"]');
          const file = getPreparedFile(imageInput) || pendingCapturedImage || imageInput?.files?.[0] || null;
          const matches = file ? await searchStaticLibrary({
            file,
            city: form.querySelector('[name="city"]')?.value,
            animal_type: form.querySelector('[name="animal_type"]')?.value,
            breed: form.querySelector('[name="breed"]')?.value,
            color: form.querySelector('[name="color"]')?.value,
            microchip_number: form.querySelector('[name="microchip_number"]')?.value,
            report_type: 'lost',
            limit: 6
          }) : [];
          const liveStatus = document.querySelector('[data-live-match-status]');
          const liveBox = document.querySelector('[data-live-matches]');
          if (liveStatus) liveStatus.textContent = matches.length ? `${t('possibleMatches')} · ${matches.length}` : t('staticLibraryEmpty');
          if (liveBox) liveBox.innerHTML = matches.length ? matches.map(renderMatchCard).join('') : `<div class="empty">${escapeHtml(t('staticLibraryEmpty'))}</div>`;
          setNotice(note, 'ok', matches.length ? `${t('staticSearchSaved')} • ${matches.length} ${t('possibleMatches')}` : t('staticSearchSaved'));
          renderApiResult(form, { local_saved: true, item: saved, matches, static_search_only: true });
        } else {
          setNotice(note, 'ok', `${successMsg} • נשמר מקומית במכשיר הזה בלבד`);
          renderApiResult(form, { local_saved: true, item: saved });
        }
      } catch (err) {
        setNotice(note, 'err', err.message || 'Local save failed');
      } finally {
        hideLoading();
      }
      return;
    }
    showLoading('scanningFace');
    const fd = new FormData(form);
    if (form.id === 'found-form' && pendingCapturedImage && !fd.get('image')?.name) fd.set('image', pendingCapturedImage, pendingCapturedImage.name);
    for (const name of ['image', 'nose_image', 'private_marker_image']) {
      const input = form.querySelector(`input[name="${name}"]`);
      const prepared = getPreparedFile(input);
      if (prepared) fd.set(name, prepared, prepared.name);
    }
    try {
      if ((form.id === 'found-form' || form.id === 'lost-form') && (!fd.get('latitude') || !fd.get('longitude'))) await captureLocationForForm(form, false);
      const latField = form.querySelector('[name="latitude"]');
      const lngField = form.querySelector('[name="longitude"]');
      if (latField?.value) fd.set('latitude', latField.value);
      if (lngField?.value) fd.set('longitude', lngField.value);
      const res = await fetch(apiBase() + endpoint, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');
      if (form.id === 'found-form' && Array.isArray(data.matches)) {
        const count = data.matches.length;
        const msg = count ? `${successMsg} • ${count} ${t('possibleMatches')}` : successMsg;
        setNotice(note, 'ok', msg);
      } else {
        setNotice(note, 'ok', successMsg);
      }
      renderApiResult(form, data);
      if (form.id === 'found-form') {
        sessionStorage.removeItem('petconnect_captured_image');
        const liveStatus = document.querySelector('[data-live-match-status]');
        const liveBox = document.querySelector('[data-live-matches]');
        if (liveStatus && Array.isArray(data.matches)) liveStatus.textContent = data.matches.length ? `${t('possibleMatches')} · ${data.matches.length}` : t('noMatchesYet');
        if (liveBox && Array.isArray(data.matches)) liveBox.innerHTML = data.matches.map(renderMatchCard).join('');
      }
    } catch (err) { setNotice(note, 'err', err.message || 'Request failed'); }
    finally { hideLoading(); }
  }

  async function postJson(form, endpoint, successMsg) {
    const note = form.querySelector('.notice');
    if (!apiReady()) {
      const body = Object.fromEntries(new FormData(form).entries());
      const items = readLocalReports();
      items.unshift({ id: `local-${Date.now()}`, report_type: 'volunteer', created_at: new Date().toISOString(), local_only: true, ...body });
      writeLocalReports(items.slice(0, 100));
      setNotice(note, 'ok', `${successMsg} • נשמר מקומית במכשיר הזה בלבד`);
      renderApiResult(form, { local_saved: true, item: body });
      return;
    }
    showLoading('loading');
    const body = Object.fromEntries(new FormData(form).entries());
    ['latitude', 'longitude', 'radius_km'].forEach(k => { if (body[k] === '') delete body[k]; else if (body[k] != null) body[k] = Number(body[k]); });
    try {
      const res = await fetch(apiBase() + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');
      setNotice(note, 'ok', successMsg);
      renderApiResult(form, data);
    } catch (err) { setNotice(note, 'err', err.message || 'Request failed'); }
    finally { hideLoading(); }
  }

  function renderMatchCard(match) {
    const overlap = Array.isArray(match.tag_overlap) && match.tag_overlap.length ? `<div class="small">${escapeHtml(match.tag_overlap.join(' • '))}</div>` : '';
    const img = match.image_url ? `<img class="match-thumb" src="${escapeHtml(match.image_url)}" alt="${escapeHtml(match.name || 'Pet')}" loading="lazy">` : `<div class="match-thumb placeholder">🐾</div>`;
    const score = (match.score === 0 || match.score) ? `${escapeHtml(String(match.score))}%` : '';
    const reportLink = match.lost_pet_id ? `${relativePrefix()}matches/?focus=${encodeURIComponent(match.lost_pet_id)}` : '';
    const action = reportLink ? `<a class="button ghost inline-action" href="${reportLink}">${escapeHtml(t('openLostReport'))}</a>` : '';
    return `<div class="result-card match-card">
      ${img}
      <div class="match-content">
        <div class="match-head"><strong>${escapeHtml(match.name || 'Pet')}</strong><span class="score-pill">${score}</span></div>
        <div class="small">${escapeHtml(match.city || '')}</div>
        <div class="small">${escapeHtml(match.reason || '')}</div>
        ${overlap}
        ${match.private_marker_prompt ? `<div class="small"><strong>${escapeHtml(t('privateMarkerPrompt'))}:</strong> ${escapeHtml(match.private_marker_prompt)}</div>` : ''}
        ${action}
      </div>
    </div>`;
  }

  function renderApiResult(form, data) {
    const out = form.closest('.form-layout')?.querySelector('[data-result]') || document.querySelector('[data-result]');
    if (!out) return;
    const parts = [];
    if (data.local_saved && data.item) {
      parts.push(`<div class="result-card"><strong>${escapeHtml(t('reportSaved'))}</strong><div class="small">${escapeHtml(data.static_search_only ? t('staticSearchOnly') : 'נשמר מקומית בדפדפן הזה בלבד, כי עדיין לא הוגדר backend ב‑config.js.')}</div><div class="small">${escapeHtml(data.item.name || '')} ${data.item.city ? '· ' + escapeHtml(data.item.city) : ''}</div></div>`);
    }
    if (Array.isArray(data.matches)) {
      const cards = data.matches.length ? data.matches.map(renderMatchCard).join('') : `<div class="result-card">${escapeHtml(t('noMatchesYet'))}</div>`;
      parts.push(`<div class="result-card success-gallery"><strong>${escapeHtml(t('successMatchesTitle'))}</strong><div class="small">${escapeHtml(t('successMatchesText'))}</div><div class="list">${cards}</div></div>`);
    }
    if (data.best_frame) parts.push(`<div class="result-card"><strong>${escapeHtml(t('bestFrame'))}</strong><div class="small">${escapeHtml(JSON.stringify(data.best_frame))}</div></div>`);
    if (data.municipal_draft) {
      const photoLine = data.municipal_draft.body && /Photo:\s*(\S+)/.exec(data.municipal_draft.body);
      const photoUrl = photoLine?.[1] || '';
      const photoAction = photoUrl ? `<div class="actions"><a class="button ghost inline-action" href="${escapeHtml(photoUrl)}" target="_blank" rel="noopener">${escapeHtml(t('photoLink'))}</a></div>` : '';
      parts.push(`<div class="result-card"><strong>${escapeHtml(t('municipalDraft'))}</strong><div class="small">${escapeHtml(data.municipal_draft.subject || '')}</div><div class="small result-prewrap">${escapeHtml(data.municipal_draft.body || '')}</div>${photoAction}</div>`);
    }
    out.innerHTML = parts.join('');
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function previewFoundMatches() {
    const form = document.getElementById('found-form');
    const box = document.querySelector('[data-live-matches]');
    const status = document.querySelector('[data-live-match-status]');
    if (!form || !box || !status) return;
    const fd = new FormData(form);
    const imageInput = form.querySelector('input[name="image"]');
    const file = getPreparedFile(imageInput) || pendingCapturedImage;
    const video = form.querySelector('input[name="video"]')?.files?.[0];
    if (!file && !video) { status.className = 'empty'; status.textContent = t('instantWaiting'); box.innerHTML = ''; return; }
    if (!apiReady()) {
      if (!file) { status.className = 'empty'; status.textContent = t('instantWaiting'); box.innerHTML = ''; return; }
      status.className = 'empty'; status.textContent = t('staticSearchReady');
      try {
        const matches = await searchStaticLibrary({
          file,
          city: String(fd.get('city') || ''),
          animal_type: String(fd.get('animal_type') || ''),
          breed: String(fd.get('breed') || ''),
          color: String(fd.get('color') || ''),
          microchip_number: String(fd.get('microchip_number') || ''),
          report_type: 'lost',
          limit: 4
        });
        status.textContent = matches.length ? `${t('possibleMatches')} · ${matches.length}` : t('staticLibraryEmpty');
        box.innerHTML = matches.length ? matches.map(renderMatchCard).join('') : `<div class="empty">${escapeHtml(t('staticLibraryEmpty'))}</div>`;
      } catch (err) {
        status.textContent = err.message || t('staticLibraryEmpty');
        box.innerHTML = '';
      }
      return;
    }
    status.className = 'empty'; status.textContent = t('previewLoading');
    if (file) fd.set('image', file, file.name);
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
        const items = Array.isArray(data) ? data.slice(0, 4).map(item => ({ name: item.name, city: item.city, score: '—', reason: t('recentReports'), tag_overlap: item.semantic_tags || [], private_marker_prompt: item.private_marker_prompt || '', image_url: item.image_url || '', lost_pet_id: item.id || '' })) : [];
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
    form.addEventListener('change', async e => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches('input[name="image"]')) {
        showLoading('loading');
        try {
          await prepareImageInput(target);
          showImagePreview(target);
          await captureLocationForForm(form, false);
        } finally { hideLoading(); }
      }
      if (target.matches('input[name="image"], input[name="video"], input[name="city"], select[name="breed"], select[name="animal_type"], input[name="microchip_number"]')) scheduleLivePreview();
    });
    form.addEventListener('input', e => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches('input[name="city"], select[name="breed"], select[name="animal_type"], input[name="microchip_number"]')) scheduleLivePreview();
    });
  }

  function initLostPreviewHooks() {
    const form = document.getElementById('lost-form');
    const input = document.getElementById('lost-image');
    if (!form || !input) return;
    input.addEventListener('change', async () => {
      showLoading('loading');
      try {
        await prepareImageInput(input);
        showImagePreview(input);
        await captureLocationForForm(form, false);
      } finally { hideLoading(); }
    });
  }

  async function fetchRecentReports() {
    if (!apiReady()) {
      const localLost = readLocalReports().filter(item => item.report_type === 'lost');
      const staticLost = (await loadStaticLibrary()).filter(item => normalizeCompareValue(item.report_type) === 'lost');
      return [...localLost, ...staticLost, ...FALLBACK_RECENT];
    }
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
      const form = el.closest('.grid')?.querySelector('form') || document.querySelector('form');
      map.on('click', evt => {
        if (!form) return;
        const lat = form.querySelector('[name="latitude"]');
        const lng = form.querySelector('[name="longitude"]');
        const loc = form.querySelector('[name="seen_location"], [name="last_seen_location"]');
        if (lat) lat.value = evt.latlng.lat.toFixed(6);
        if (lng) lng.value = evt.latlng.lng.toFixed(6);
        if (loc) loc.value = `${evt.latlng.lat.toFixed(6)}, ${evt.latlng.lng.toFixed(6)}`;
        if (el._marker) el._marker.setLatLng(evt.latlng); else el._marker = L.marker(evt.latlng).addTo(map);
        scheduleLivePreview();
      });
      el._map = map;
      if (form) {
        ['latitude', 'longitude'].forEach(name => form.querySelector(`[name="${name}"]`)?.addEventListener('input', () => syncMapMarker(form)));
        syncMapMarker(form);
      }
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
    list.innerHTML = `<div class="empty">${escapeHtml(t('loading'))}</div>`;
    const params = new URLSearchParams(location.search);
    if (!apiReady()) {
      const q = params.get('q') || '';
      const city = document.body.dataset.citySlug || params.get('city') || '';
      const focusId = params.get('focus');
      const staticLost = (await loadStaticLibrary()).filter(item => normalizeCompareValue(item.report_type) === 'lost');
      let items = [...readLocalReports().filter(item => item.report_type === 'lost'), ...staticLost];
      if (city) items = items.filter(item => normalizeCompareValue(item.city).includes(normalizeCompareValue(city)) || normalizeCompareValue(item.city) === normalizeCompareValue(city));
      if (q) items = items.filter(item => JSON.stringify(item).toLowerCase().includes(q.toLowerCase()));
      if (focusId) items = items.sort((a, b) => String(a.id) === focusId ? -1 : String(b.id) === focusId ? 1 : 0);
      if (!items.length) { list.innerHTML = `<div class="empty">${escapeHtml(t('staticLibraryEmpty'))}</div>`; return; }
      list.innerHTML = items.map(item => `
        <div class="result-card ${String(item.id) === focusId ? 'focus-card' : ''}">
          <div class="match-head"><strong>${escapeHtml(item.name || 'Pet')}</strong><span class="status-pill">${escapeHtml(item.status || item.report_type || 'static')}</span></div>
          <div class="small">${escapeHtml(item.animal_type || '')} · ${escapeHtml(item.breed || '')} · ${escapeHtml(item.city || '')}</div>
          <div class="small">${escapeHtml(item.color || '')} · ${escapeHtml(item.unique_markings || item.last_seen_location || '')}</div>
          <div class="small">${escapeHtml(item.last_seen_location || '')}</div>
        </div>`).join('');
      if (window._matchesMap) items.forEach(item => { if (item.latitude && item.longitude) L.marker([item.latitude, item.longitude]).addTo(window._matchesMap).bindPopup(`<strong>${escapeHtml(item.name || 'Pet')}</strong><br>${escapeHtml(item.city || '')}`); });
      return;
    }
    const city = document.body.dataset.citySlug || params.get('city') || '';
    const q = params.get('q') || '';
    try {
      const res = await fetch(apiBase() + '/api/lost-pets' + (city ? ('?city=' + encodeURIComponent(city)) : ''));
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      let items = Array.isArray(data) ? data : [];
      if (q) items = items.filter(item => JSON.stringify(item).toLowerCase().includes(q.toLowerCase()));
      const focusId = params.get('focus');
      if (focusId) items = items.sort((a, b) => String(a.id) === focusId ? -1 : String(b.id) === focusId ? 1 : 0);
      if (!items.length) { list.innerHTML = `<div class="empty">${escapeHtml(t('none'))}</div>`; return; }
      list.innerHTML = items.map(item => `
        <div class="result-card ${String(item.id) === focusId ? 'focus-card' : ''}">
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

  function initInstallPrompt() {
    const button = document.getElementById('install-app-button');
    if (!button) return;
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      installPromptEvent = event;
      button.hidden = false;
    });
    button.addEventListener('click', async () => {
      if (!installPromptEvent) return;
      installPromptEvent.prompt();
      try { await installPromptEvent.userChoice; } catch {}
      installPromptEvent = null;
      button.hidden = true;
    });
    window.addEventListener('appinstalled', () => {
      installPromptEvent = null;
      button.hidden = true;
    });
  }

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
    initLang(); initConfigEcho(); initSearch(); initStoredCapture(); initOpenCameraButtons(); initGeolocate(); initBreedPickers(); initMaps(); initForms(); initFoundPreviewHooks(); initLostPreviewHooks(); loadMatches(); renderStories(); renderCityGrid(); renderCityPageMeta(); initPwa(); initInstallPrompt();
  });
})();
