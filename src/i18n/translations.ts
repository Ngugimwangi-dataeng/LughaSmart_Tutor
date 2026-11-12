import { SupportedLocale } from '../types';

export interface Translations {
  brandName: string;
  tagline: string;
  navCourses: string;
  navStudentDashboard: string;
  navProgress: string;
  navTutorConsole: string;
  navLiveSession: string;
  navAudioStudio: string;
  navDatabase: string;
  navScalability: string;
  readyForClass: string;
  notReady: string;
  readyStatusActive: string;
  readyStatusInactive: string;
  checkoutMpesa: string;
  checkoutVisa: string;
  enrollNow: string;
  instantAccess: string;
  curriculumPdf: string;
  pronunciationStudio: string;
  securityProtected: string;
  endToEndEncrypted: string;
  tutorOnlyNotice: string;
  priceKes: string;
  lessons: string;
  duration: string;
  tutor: string;
  recordAudio: string;
  stopRecording: string;
  submitPronunciation: string;
  nativeCadenceScore: string;
  viewCurriculum: string;
  updatePdf: string;
  switchRole: string;
  viewAsStudent: string;
  viewAsTutor: string;
  viewModeWeb: string;
  viewModeMobile: string;
}

export const translations: Record<SupportedLocale, Translations> = {
  en: {
    brandName: 'LughaSmart Tutor',
    tagline: 'Master Indigenous & National Kenyan Languages with Certified Native Tutors',
    navCourses: 'Curriculum & Courses',
    navStudentDashboard: 'Student Portal',
    navProgress: 'My Progress',
    navTutorConsole: 'Tutor Console',
    navLiveSession: 'Live Session Room',
    navAudioStudio: 'Pronunciation Lab',
    navDatabase: 'PostgreSQL Architecture',
    navScalability: 'Cloud Scalability',
    readyForClass: 'I am Ready for Class',
    notReady: 'Not Available for Class',
    readyStatusActive: 'Tutor notified — you are visible in the live teaching queue',
    readyStatusInactive: 'Toggle when ready to join instant live tutor instruction',
    checkoutMpesa: 'Pay with Safaricom M-Pesa (STK Push)',
    checkoutVisa: 'Pay with Visa / Mastercard',
    enrollNow: 'Enroll & Unlock Access',
    instantAccess: 'Instant Curated Lesson Plan Access Unlocked',
    curriculumPdf: 'Curriculum PDF & Syllabus',
    pronunciationStudio: 'Native Audio Pronunciation Studio',
    securityProtected: 'Strict RBAC Segregation Enforced',
    endToEndEncrypted: '256-bit End-to-End Encrypted Session',
    tutorOnlyNotice: 'HTTP 403 Forbidden: Student accounts cannot access /tutor/* pathways.',
    priceKes: 'KES',
    lessons: 'Lessons',
    duration: 'Duration',
    tutor: 'Instructor',
    recordAudio: 'Record Pronunciation',
    stopRecording: 'Stop Recording',
    submitPronunciation: 'Submit for Tutor Review',
    nativeCadenceScore: 'Phonetic Accuracy Score',
    viewCurriculum: 'View Syllabus PDF',
    updatePdf: 'Upload New Curriculum PDF',
    switchRole: 'Switch Role',
    viewAsStudent: 'Student View',
    viewAsTutor: 'Tutor View',
    viewModeWeb: 'Web View (1440px)',
    viewModeMobile: 'Mobile App View',
  },
  sw: {
    brandName: 'LughaSmart Mkufunzi',
    tagline: 'Jifunze Lugha za Asili na Kitaifa za Kenya na Wakufunzi Walioidhinishwa',
    navCourses: 'Mitaala na Kozi',
    navStudentDashboard: 'Dawati la Mwanafunzi',
    navProgress: 'Maendeleo Yangu',
    navTutorConsole: 'Dawati la Mkufunzi',
    navLiveSession: 'Darasa la Moja kwa Moja',
    navAudioStudio: 'Maabara ya Matamshi',
    navDatabase: 'Muundo wa PostgreSQL',
    navScalability: 'Upanuzi wa Wingu',
    readyForClass: 'Niko Tayari kwa Darasa',
    notReady: 'Siko Tayari kwa Darasa',
    readyStatusActive: 'Mkufunzi amearifiwa — unaonekana kwenye orodha ya mafundisho ya moja kwa moja',
    readyStatusInactive: 'Washa ukiwa tayari kuanza mafunzo ya papo hapo',
    checkoutMpesa: 'Lipa kwa Safaricom M-Pesa (STK Push)',
    checkoutVisa: 'Lipa kwa Kadi ya Visa / Mastercard',
    enrollNow: 'Jiandikishe na Ufungue Masomo',
    instantAccess: 'Ufikiaji wa Papo Hapo wa Mtaala Umefunguliwa',
    curriculumPdf: 'Mwongozo wa PDF na Mtaala',
    pronunciationStudio: 'Studio ya Matamshi ya Sauti ya Asili',
    securityProtected: 'Ulinzi Mkali wa Udhibiti wa Majukumu (RBAC)',
    endToEndEncrypted: 'Mawasiliano Yaliyosimbwa kwa Ncha-hadi-Ncha (256-bit)',
    tutorOnlyNotice: 'HTTP 403 Imekataliwa: Wanafunzi hawaruhusiwi kuingia dawati la mwalimu.',
    priceKes: 'KES',
    lessons: 'Masomo',
    duration: 'Muda',
    tutor: 'Mkufunzi',
    recordAudio: 'Rekodi Matamshi Yako',
    stopRecording: 'Simamisha Kurekodi',
    submitPronunciation: 'Wasilisha kwa Uhakiki wa Mwalimu',
    nativeCadenceScore: 'Alama ya Usahihi wa Sauti',
    viewCurriculum: 'Tazama Mwongozo wa PDF',
    updatePdf: 'Sasisha Mwongozo Mpya wa PDF',
    switchRole: 'Badilisha Jukumu',
    viewAsStudent: 'Mtazamo wa Mwanafunzi',
    viewAsTutor: 'Mtazamo wa Mwalimu',
    viewModeWeb: 'Mtazamo wa Wavuti',
    viewModeMobile: 'Mtazamo wa Programu ya Simu',
  },
  fr: {
    brandName: 'LughaSmart Tuteur',
    tagline: 'Maîtrisez les langues kényanes indigènes et nationales avec des tuteurs certifiés',
    navCourses: 'Cours et Programmes',
    navStudentDashboard: 'Espace Étudiant',
    navProgress: 'Mes Progrès',
    navTutorConsole: 'Console Tuteur',
    navLiveSession: 'Session en Direct',
    navAudioStudio: 'Lab de Prononciation',
    navDatabase: 'Architecture PostgreSQL',
    navScalability: 'Évolutivité Cloud',
    readyForClass: 'Je suis prêt pour le cours',
    notReady: 'Indisponible pour le cours',
    readyStatusActive: 'Tuteur notifié — visible dans la file d’attente en direct',
    readyStatusInactive: 'Activez lorsque vous êtes prêt pour la leçon en direct',
    checkoutMpesa: 'Payer avec Safaricom M-Pesa (STK Push)',
    checkoutVisa: 'Payer avec Visa / Mastercard',
    enrollNow: 'S’inscrire et Débloquer',
    instantAccess: 'Accès Immédiat au Plan de Cours Débloqué',
    curriculumPdf: 'Curriculum & Syllabus PDF',
    pronunciationStudio: 'Atelier Audio de Prononciation Native',
    securityProtected: 'Ségrégation Stricte des Rôles (RBAC)',
    endToEndEncrypted: 'Chiffrement de Bout en Bout 256 bits',
    tutorOnlyNotice: 'HTTP 403 Interdit : Les étudiants ne peuvent pas accéder aux chemins /tuteur.',
    priceKes: 'KES',
    lessons: 'Leçons',
    duration: 'Durée',
    tutor: 'Instructeur',
    recordAudio: 'Enregistrer la Prononciation',
    stopRecording: 'Arrêter l’enregistrement',
    submitPronunciation: 'Soumettre pour Avis du Tuteur',
    nativeCadenceScore: 'Score de Précision Phonétique',
    viewCurriculum: 'Consulter le PDF',
    updatePdf: 'Mettre à jour le PDF du programme',
    switchRole: 'Changer de Rôle',
    viewAsStudent: 'Vue Étudiant',
    viewAsTutor: 'Vue Tuteur',
    viewModeWeb: 'Vue Web',
    viewModeMobile: 'Vue Application Mobile',
  },
  de: {
    brandName: 'LughaSmart Tutor',
    tagline: 'Kenianische Stammessprachen & Landessprachen mit muttersprachlichen Tutoren lernen',
    navCourses: 'Kurse & Lehrpläne',
    navStudentDashboard: 'Studentenportal',
    navProgress: 'Mein Lernfortschritt',
    navTutorConsole: 'Dozentenkonsole',
    navLiveSession: 'Live-Klassenzimmer',
    navAudioStudio: 'Aussprache-Labor',
    navDatabase: 'PostgreSQL-Architektur',
    navScalability: 'Cloud-Skalierbarkeit',
    readyForClass: 'Ich bin bereit für den Unterricht',
    notReady: 'Nicht bereit für den Unterricht',
    readyStatusActive: 'Tutor benachrichtigt — sichtbar in der Live-Warteschlange',
    readyStatusInactive: 'Aktivieren, wenn Sie bereit für Live-Unterricht sind',
    checkoutMpesa: 'Zahlung per Safaricom M-Pesa (STK Push)',
    checkoutVisa: 'Zahlung per Visa / Mastercard',
    enrollNow: 'Jetzt Einschreiben & Freischalten',
    instantAccess: 'Sofortiger Zugriff auf den Lehrplan freigeschaltet',
    curriculumPdf: 'Lehrplan & Leitfaden als PDF',
    pronunciationStudio: 'Studio für muttersprachliche Aussprache',
    securityProtected: 'Strenge rollenbasierte Zugriffskontrolle (RBAC)',
    endToEndEncrypted: '256-Bit Ende-zu-Ende-Verschlüsselung',
    tutorOnlyNotice: 'HTTP 403 Verboten: Studenten haben keinen Zugriff auf /tutor/* Pfade.',
    priceKes: 'KES',
    lessons: 'Lektionen',
    duration: 'Dauer',
    tutor: 'Lehrkraft',
    recordAudio: 'Aussprache aufnehmen',
    stopRecording: 'Aufnahme beenden',
    submitPronunciation: 'Zur Bewertung einreichen',
    nativeCadenceScore: 'Phonetische Genauigkeit',
    viewCurriculum: 'Lehrplan-PDF öffnen',
    updatePdf: 'Neues Lehrplan-PDF hochladen',
    switchRole: 'Rolle wechseln',
    viewAsStudent: 'Studentenansicht',
    viewAsTutor: 'Dozentenansicht',
    viewModeWeb: 'Webansicht',
    viewModeMobile: 'Mobile App Ansicht',
  },
  zh: {
    brandName: 'LughaSmart 导师系统',
    tagline: '跟随认证母语导师，精通肯尼亚本土语言与国家通用语',
    navCourses: '课程与教学大纲',
    navStudentDashboard: '学员中心',
    navProgress: '我的学习进度',
    navTutorConsole: '导师控制台',
    navLiveSession: '实时互动教室',
    navAudioStudio: '语音发音实验室',
    navDatabase: 'PostgreSQL 架构',
    navScalability: '云端高并发架构',
    readyForClass: '我已准备好上课',
    notReady: '暂未准备好',
    readyStatusActive: '导师已收到通知 — 您已在实时授课队列中',
    readyStatusInactive: '准备好接受导师一对一实时指导时点击开启',
    checkoutMpesa: '使用 Safaricom M-Pesa 支付 (STK Push)',
    checkoutVisa: '使用 Visa / 万事达信用卡支付',
    enrollNow: '立即报名并解锁课程',
    instantAccess: '已即时解锁定制化教学计划与导师预约',
    curriculumPdf: '课程大纲 PDF 文档',
    pronunciationStudio: '母语发音录制与评测工坊',
    securityProtected: '严格的角色访问隔离机制 (RBAC)',
    endToEndEncrypted: '256 位端到端加密通信',
    tutorOnlyNotice: 'HTTP 403 禁止访问：学员身份严禁访问 /tutor/* 导师端管理路径。',
    priceKes: '肯尼亚先令 (KES)',
    lessons: '课时',
    duration: '学习周期',
    tutor: '主讲导师',
    recordAudio: '录制我的发音',
    stopRecording: '停止录音',
    submitPronunciation: '提交导师专业点评',
    nativeCadenceScore: '发音准确度评分',
    viewCurriculum: '查看教学大纲 PDF',
    updatePdf: '上传/更新课程 PDF',
    switchRole: '切换身份',
    viewAsStudent: '学员视图',
    viewAsTutor: '导师视图',
    viewModeWeb: '桌面网页视图',
    viewModeMobile: '移动端原生模拟',
  }
};
