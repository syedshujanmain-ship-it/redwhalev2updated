import React, { createContext, useContext, useState, useCallback } from 'react';

export type AppLanguage =
  | 'en' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko'
  | 'ar' | 'ru' | 'pt' | 'it' | 'bn' | 'ta' | 'te' | 'mr'
  | 'gu' | 'ur' | 'ml' | 'kn' | 'pa' | 'or' | 'as' | 'ne'
  | 'si' | 'my' | 'km' | 'lo' | 'mn' | 'fa' | 'he' | 'el'
  | 'bg' | 'sr' | 'hr' | 'cs' | 'pl' | 'hu' | 'ro' | 'sq'
  | 'lt' | 'lv' | 'et' | 'fi' | 'sv' | 'no' | 'da' | 'is'
  | 'ga' | 'cy' | 'sw' | 'am' | 'yo' | 'zu' | 'fil' | 'id'
  | 'ms' | 'su' | 'jv';

export const appLangLabels: Record<AppLanguage, string> = {
  en: 'English', hi: 'Hindi', es: 'Spanish', fr: 'French', de: 'German',
  zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic', ru: 'Russian',
  pt: 'Portuguese', it: 'Italian', bn: 'Bengali', ta: 'Tamil', te: 'Telugu',
  mr: 'Marathi', gu: 'Gujarati', ur: 'Urdu', ml: 'Malayalam', kn: 'Kannada',
  pa: 'Punjabi', or: 'Oriya', as: 'Assamese', ne: 'Nepali', si: 'Sinhala',
  my: 'Burmese', km: 'Khmer', lo: 'Lao', mn: 'Mongolian', fa: 'Persian',
  he: 'Hebrew', el: 'Greek', bg: 'Bulgarian', sr: 'Serbian', hr: 'Croatian',
  cs: 'Czech', pl: 'Polish', hu: 'Hungarian', ro: 'Romanian', sq: 'Albanian',
  lt: 'Lithuanian', lv: 'Latvian', et: 'Estonian', fi: 'Finnish', sv: 'Swedish',
  no: 'Norwegian', da: 'Danish', is: 'Icelandic', ga: 'Irish', cy: 'Welsh',
  sw: 'Swahili', am: 'Amharic', yo: 'Yoruba', zu: 'Zulu', fil: 'Filipino',
  id: 'Indonesian', ms: 'Malay', su: 'Sundanese', jv: 'Javanese',
};

const ALL_APP_LANGS: AppLanguage[] = Object.keys(appLangLabels) as AppLanguage[];

// Core UI translations — extend as needed. Fallback to English.
const enDict: Record<string, string> = {
  newChat: 'New Chat', settings: 'Settings', voiceTalk: 'Voice Talk',
  send: 'Send', listening: 'Listening', speaking: 'Speaking',
  processing: 'Processing', idle: 'Tap to Speak', stop: 'Stop',
  download: 'Download', close: 'Close', language: 'Language',
  aiLanguage: 'AI Language', appLanguage: 'App Language', theme: 'Theme',
  darkMode: 'Dark Mode', lightMode: 'Light Mode', voice: 'Voice',
  selectVoice: 'Select Voice', typingIndicator: 'Typing Indicator',
  cursorStyle: 'Cursor Style', font: 'Font', appearance: 'Appearance',
  thinkingProcess: 'Thinking Process', autoScroll: 'Auto-scroll',
  autoTitle: 'Auto Title', customMoods: 'Custom Moods', add: 'Add',
  cancel: 'Cancel', save: 'Save', delete: 'Delete', active: 'Active',
  on: 'ON', off: 'OFF', copy: 'Copy', regenerate: 'Regenerate',
  report: 'Report', more: 'More', chatHistory: 'Chat History',
  noHistory: 'No conversations yet', recentChats: 'Recent Chats',
  askAnything: 'Ask anything...', redWhale: 'Red Whale',
  premium: 'Premium', top: 'Top', female: 'Female', male: 'Male',
};

const fullDicts: Record<string, Record<string, string>> = {
  en: enDict,
  hi: {
    newChat: 'नई चैट', settings: 'सेटिंग्स', voiceTalk: 'वॉइस टॉक',
    send: 'भेजें', listening: 'सुन रहा है', speaking: 'बोल रहा है',
    processing: 'प्रोसेसिंग', idle: 'बोलने के लिए टैप करें', stop: 'रोकें',
    download: 'डाउनलोड', close: 'बंद करें', language: 'भाषा',
    aiLanguage: 'AI भाषा', appLanguage: 'ऐप भाषा', theme: 'थीम',
    darkMode: 'डार्क मोड', lightMode: 'लाइट मोड', voice: 'आवाज़',
    selectVoice: 'आवाज़ चुनें', typingIndicator: 'टाइपिंग इंडिकेटर',
    cursorStyle: 'कर्सर स्टाइल', font: 'फ़ॉन्ट', appearance: 'दिखावट',
    thinkingProcess: 'सोच की प्रक्रिया', autoScroll: 'ऑटो-स्क्रॉल',
    autoTitle: 'ऑटो शीर्षक', customMoods: 'कस्टम मूड', add: 'जोड़ें',
    cancel: 'रद्द', save: 'सहेजें', delete: 'हटाएं', active: 'सक्रिय',
    on: 'चालू', off: 'बंद', copy: 'कॉपी', regenerate: 'फिर से बनाएं',
    report: 'रिपोर्ट', more: 'और', chatHistory: 'चैट इतिहास',
    noHistory: 'अभी तक कोई बातचीत नहीं', recentChats: 'हाल की चैट',
    askAnything: 'कुछ भी पूछें...', redWhale: 'रेड व्हेल',
    premium: 'प्रीमियम', top: 'टॉप', female: 'महिला', male: 'पुरुष',
  },
  es: {
    newChat: 'Nuevo Chat', settings: 'Ajustes', voiceTalk: 'Voz',
    send: 'Enviar', listening: 'Escuchando', speaking: 'Hablando',
    processing: 'Procesando', idle: 'Toca para hablar', stop: 'Detener',
    download: 'Descargar', close: 'Cerrar', language: 'Idioma',
    aiLanguage: 'Idioma IA', appLanguage: 'Idioma App', theme: 'Tema',
    darkMode: 'Modo Oscuro', lightMode: 'Modo Claro', voice: 'Voz',
    selectVoice: 'Seleccionar Voz', typingIndicator: 'Indicador',
    cursorStyle: 'Estilo Cursor', font: 'Fuente', appearance: 'Apariencia',
    thinkingProcess: 'Proceso de Pensamiento', autoScroll: 'Auto-scroll',
    autoTitle: 'Título Auto', customMoods: 'Modos Personalizados', add: 'Añadir',
    cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar', active: 'Activo',
    on: 'ON', off: 'OFF', copy: 'Copiar', regenerate: 'Regenerar',
    report: 'Reportar', more: 'Más', chatHistory: 'Historial',
    noHistory: 'Sin conversaciones', recentChats: 'Chats Recientes',
    askAnything: 'Pregunta algo...', redWhale: 'Red Whale',
    premium: 'Premium', top: 'Top', female: 'Femenina', male: 'Masculina',
  },
  fr: {
    newChat: 'Nouveau Chat', settings: 'Paramètres', voiceTalk: 'Voix',
    send: 'Envoyer', listening: 'Écoute', speaking: 'Parle',
    processing: 'Traitement', idle: 'Touchez pour parler', stop: 'Arrêter',
    download: 'Télécharger', close: 'Fermer', language: 'Langue',
    aiLanguage: 'Langue IA', appLanguage: 'Langue App', theme: 'Thème',
    darkMode: 'Mode Sombre', lightMode: 'Mode Clair', voice: 'Voix',
    selectVoice: 'Choisir Voix', typingIndicator: 'Indicateur',
    cursorStyle: 'Style Curseur', font: 'Police', appearance: 'Apparence',
    thinkingProcess: 'Processus de Pensée', autoScroll: 'Auto-défilement',
    autoTitle: 'Titre Auto', customMoods: 'Humeurs Perso', add: 'Ajouter',
    cancel: 'Annuler', save: 'Sauver', delete: 'Supprimer', active: 'Actif',
    on: 'ON', off: 'OFF', copy: 'Copier', regenerate: 'Régénérer',
    report: 'Signaler', more: 'Plus', chatHistory: 'Historique',
    noHistory: 'Aucune conversation', recentChats: 'Chats Récents',
    askAnything: 'Demandez quelque chose...', redWhale: 'Red Whale',
    premium: 'Premium', top: 'Top', female: 'Féminine', male: 'Masculine',
  },
  de: {
    newChat: 'Neuer Chat', settings: 'Einstellungen', voiceTalk: 'Sprache',
    send: 'Senden', listening: 'Hört zu', speaking: 'Spricht',
    processing: 'Verarbeitung', idle: 'Tippen zum Sprechen', stop: 'Stopp',
    download: 'Herunterladen', close: 'Schließen', language: 'Sprache',
    aiLanguage: 'KI-Sprache', appLanguage: 'App-Sprache', theme: 'Thema',
    darkMode: 'Dunkelmodus', lightMode: 'Hellmodus', voice: 'Stimme',
    selectVoice: 'Stimme wählen', typingIndicator: 'Tippanzeige',
    cursorStyle: 'Cursor-Stil', font: 'Schriftart', appearance: 'Erscheinung',
    thinkingProcess: 'Denkprozess', autoScroll: 'Auto-Scroll',
    autoTitle: 'Auto-Titel', customMoods: 'Benutzerstimmungen', add: 'Hinzufügen',
    cancel: 'Abbrechen', save: 'Speichern', delete: 'Löschen', active: 'Aktiv',
    on: 'AN', off: 'AUS', copy: 'Kopieren', regenerate: 'Neu generieren',
    report: 'Melden', more: 'Mehr', chatHistory: 'Chatverlauf',
    noHistory: 'Noch keine Gespräche', recentChats: 'Neueste Chats',
    askAnything: 'Frag etwas...', redWhale: 'Red Whale',
    premium: 'Premium', top: 'Top', female: 'Weiblich', male: 'Männlich',
  },
  zh: {
    newChat: '新聊天', settings: '设置', voiceTalk: '语音对话',
    send: '发送', listening: '正在聆听', speaking: '正在说话',
    processing: '处理中', idle: '点击说话', stop: '停止',
    download: '下载', close: '关闭', language: '语言',
    aiLanguage: 'AI语言', appLanguage: '应用语言', theme: '主题',
    darkMode: '深色模式', lightMode: '浅色模式', voice: '语音',
    selectVoice: '选择语音', typingIndicator: '输入指示器',
    cursorStyle: '光标样式', font: '字体', appearance: '外观',
    thinkingProcess: '思考过程', autoScroll: '自动滚动',
    autoTitle: '自动标题', customMoods: '自定义情绪', add: '添加',
    cancel: '取消', save: '保存', delete: '删除', active: '活跃',
    on: '开', off: '关', copy: '复制', regenerate: '重新生成',
    report: '举报', more: '更多', chatHistory: '聊天记录',
    noHistory: '暂无对话', recentChats: '最近聊天',
    askAnything: '问点什么...', redWhale: 'Red Whale',
    premium: '高级', top: '顶级', female: '女性', male: '男性',
  },
  ja: {
    newChat: '新しいチャット', settings: '設定', voiceTalk: 'ボイス',
    send: '送信', listening: '聞いています', speaking: '話しています',
    processing: '処理中', idle: 'タップして話す', stop: '停止',
    download: 'ダウンロード', close: '閉じる', language: '言語',
    aiLanguage: 'AI言語', appLanguage: 'アプリ言語', theme: 'テーマ',
    darkMode: 'ダークモード', lightMode: 'ライトモード', voice: '音声',
    selectVoice: '音声を選択', typingIndicator: '入力インジケータ',
    cursorStyle: 'カーソルスタイル', font: 'フォント', appearance: '外観',
    thinkingProcess: '思考プロセス', autoScroll: '自動スクロール',
    autoTitle: '自動タイトル', customMoods: 'カスタムムード', add: '追加',
    cancel: 'キャンセル', save: '保存', delete: '削除', active: 'アクティブ',
    on: 'ON', off: 'OFF', copy: 'コピー', regenerate: '再生成',
    report: '報告', more: 'もっと', chatHistory: 'チャット履歴',
    noHistory: 'まだ会話がありません', recentChats: '最近のチャット',
    askAnything: '何でも聞いて...', redWhale: 'Red Whale',
    premium: 'プレミアム', top: 'トップ', female: '女性', male: '男性',
  },
  ko: {
    newChat: '새 채팅', settings: '설정', voiceTalk: '음성 대화',
    send: '보내기', listening: '듣는 중', speaking: '말하는 중',
    processing: '처리 중', idle: '탭하여 말하기', stop: '중지',
    download: '다운로드', close: '닫기', language: '언어',
    aiLanguage: 'AI 언어', appLanguage: '앱 언어', theme: '테마',
    darkMode: '다크 모드', lightMode: '라이트 모드', voice: '음성',
    selectVoice: '음성 선택', typingIndicator: '입력 표시기',
    cursorStyle: '커서 스타일', font: '글꼴', appearance: '모양',
    thinkingProcess: '생각 과정', autoScroll: '자동 스크롤',
    autoTitle: '자동 제목', customMoods: '사용자 지정 분위기', add: '추가',
    cancel: '취소', save: '저장', delete: '삭제', active: '활성',
    on: '켬', off: '끔', copy: '복사', regenerate: '재생성',
    report: '신고', more: '더보기', chatHistory: '채팅 기록',
    noHistory: '아직 대화 없음', recentChats: '최근 채팅',
    askAnything: '무엇이든 물어보세요...', redWhale: 'Red Whale',
    premium: '프리미엄', top: '탑', female: '여성', male: '남성',
  },
  ar: {
    newChat: 'محادثة جديدة', settings: 'الإعدادات', voiceTalk: 'الصوت',
    send: 'إرسال', listening: 'يستمع', speaking: 'يتكلم',
    processing: 'معالجة', idle: 'اضغط للتحدث', stop: 'إيقاف',
    download: 'تنزيل', close: 'إغلاق', language: 'اللغة',
    aiLanguage: 'لغة الذكاء الاصطناعي', appLanguage: 'لغة التطبيق', theme: 'السمة',
    darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح', voice: 'الصوت',
    selectVoice: 'اختر الصوت', typingIndicator: 'مؤشر الكتابة',
    cursorStyle: 'نمط المؤشر', font: 'الخط', appearance: 'المظهر',
    thinkingProcess: 'عملية التفكير', autoScroll: 'التمرير التلقائي',
    autoTitle: 'عنوان تلقائي', customMoods: 'أوضاع مخصصة', add: 'إضافة',
    cancel: 'إلغاء', save: 'حفظ', delete: 'حذف', active: 'نشط',
    on: 'تشغيل', off: 'إيقاف', copy: 'نسخ', regenerate: 'إعادة توليد',
    report: 'إبلاغ', more: 'المزيد', chatHistory: 'سجل المحادثات',
    noHistory: 'لا توجد محادثات', recentChats: 'المحادثات الأخيرة',
    askAnything: 'اسأل أي شيء...', redWhale: 'Red Whale',
    premium: 'بريميوم', top: 'أعلى', female: 'أنثى', male: 'ذكر',
  },
  ru: {
    newChat: 'Новый чат', settings: 'Настройки', voiceTalk: 'Голос',
    send: 'Отправить', listening: 'Слушает', speaking: 'Говорит',
    processing: 'Обработка', idle: 'Нажмите, чтобы говорить', stop: 'Стоп',
    download: 'Скачать', close: 'Закрыть', language: 'Язык',
    aiLanguage: 'Язык ИИ', appLanguage: 'Язык приложения', theme: 'Тема',
    darkMode: 'Тёмная тема', lightMode: 'Светлая тема', voice: 'Голос',
    selectVoice: 'Выбрать голос', typingIndicator: 'Индикатор набора',
    cursorStyle: 'Стиль курсора', font: 'Шрифт', appearance: 'Внешний вид',
    thinkingProcess: 'Процесс мышления', autoScroll: 'Автопрокрутка',
    autoTitle: 'Автозаголовок', customMoods: 'Пользовательские настроения', add: 'Добавить',
    cancel: 'Отмена', save: 'Сохранить', delete: 'Удалить', active: 'Активный',
    on: 'ВКЛ', off: 'ВЫКЛ', copy: 'Копировать', regenerate: 'Перегенерировать',
    report: 'Пожаловаться', more: 'Ещё', chatHistory: 'История чатов',
    noHistory: 'Пока нет бесед', recentChats: 'Недавние чаты',
    askAnything: 'Спросите что-нибудь...', redWhale: 'Red Whale',
    premium: 'Премиум', top: 'Топ', female: 'Женский', male: 'Мужской',
  },
};

// Build translations with English fallback for missing keys
const translations: Record<AppLanguage, Record<string, string>> = {} as any;
for (const lang of ALL_APP_LANGS) {
  const dict = fullDicts[lang] || {};
  translations[lang] = { ...enDict };
  for (const key of Object.keys(dict)) {
    translations[lang][key] = dict[key];
  }
}

interface AppLanguageContextType {
  appLang: AppLanguage;
  setAppLang: (lang: AppLanguage) => void;
  appLangLabel: string;
  t: (key: string) => string;
}

const AppLanguageContext = createContext<AppLanguageContextType>({
  appLang: 'en',
  setAppLang: () => {},
  appLangLabel: 'English',
  t: (key: string) => translations.en[key] || key,
});

export function AppLanguageProvider({ children }: { children: React.ReactNode }) {
  const [appLang, setAppLang] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('rw_app_language');
    if (saved && ALL_APP_LANGS.includes(saved as AppLanguage)) {
      return saved as AppLanguage;
    }
    return 'en';
  });

  const setLang = useCallback((lang: AppLanguage) => {
    setAppLang(lang);
    localStorage.setItem('rw_app_language', lang);
  }, []);

  const t = useCallback(
    (key: string) => translations[appLang][key] || translations.en[key] || key,
    [appLang]
  );

  return (
    <AppLanguageContext.Provider
      value={{
        appLang,
        setAppLang: setLang,
        appLangLabel: appLangLabels[appLang],
        t,
      }}
    >
      {children}
    </AppLanguageContext.Provider>
  );
}

export function useAppLanguage() {
  return useContext(AppLanguageContext);
}
