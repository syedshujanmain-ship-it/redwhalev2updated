import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language =
  | 'english' | 'hinglish' | 'hindi'
  | 'spanish' | 'french' | 'german' | 'chinese' | 'japanese'
  | 'korean' | 'arabic' | 'russian' | 'portuguese' | 'italian'
  | 'dutch' | 'turkish' | 'vietnamese' | 'thai' | 'bengali'
  | 'punjabi' | 'tamil' | 'telugu' | 'marathi' | 'gujarati'
  | 'urdu' | 'malayalam' | 'kannada' | 'oriya' | 'assamese'
  | 'nepali' | 'sinhala' | 'burmese' | 'khmer' | 'lao'
  | 'mongolian' | 'persian' | 'hebrew' | 'greek' | 'bulgarian'
  | 'serbian' | 'croatian' | 'czech' | 'polish' | 'hungarian'
  | 'romanian' | 'albanian' | 'lithuanian' | 'latvian' | 'estonian'
  | 'finnish' | 'swedish' | 'norwegian' | 'danish' | 'icelandic'
  | 'irish' | 'welsh' | 'swahili' | 'amharic' | 'yoruba'
  | 'zulu' | 'filipino' | 'indonesian' | 'malay' | 'sundanese'
  | 'javanese';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languageLabel: string;
}

export const labels: Record<Language, string> = {
  english: 'English', hinglish: 'Hinglish', hindi: 'Hindi',
  spanish: 'Spanish', french: 'French', german: 'German', chinese: 'Chinese',
  japanese: 'Japanese', korean: 'Korean', arabic: 'Arabic', russian: 'Russian',
  portuguese: 'Portuguese', italian: 'Italian', dutch: 'Dutch', turkish: 'Turkish',
  vietnamese: 'Vietnamese', thai: 'Thai', bengali: 'Bengali', punjabi: 'Punjabi',
  tamil: 'Tamil', telugu: 'Telugu', marathi: 'Marathi', gujarati: 'Gujarati',
  urdu: 'Urdu', malayalam: 'Malayalam', kannada: 'Kannada', oriya: 'Oriya',
  assamese: 'Assamese', nepali: 'Nepali', sinhala: 'Sinhala', burmese: 'Burmese',
  khmer: 'Khmer', lao: 'Lao', mongolian: 'Mongolian', persian: 'Persian',
  hebrew: 'Hebrew', greek: 'Greek', bulgarian: 'Bulgarian', serbian: 'Serbian',
  croatian: 'Croatian', czech: 'Czech', polish: 'Polish', hungarian: 'Hungarian',
  romanian: 'Romanian', albanian: 'Albanian', lithuanian: 'Lithuanian',
  latvian: 'Latvian', estonian: 'Estonian', finnish: 'Finnish',
  swedish: 'Swedish', norwegian: 'Norwegian', danish: 'Danish',
  icelandic: 'Icelandic', irish: 'Irish', welsh: 'Welsh', swahili: 'Swahili',
  amharic: 'Amharic', yoruba: 'Yoruba', zulu: 'Zulu', filipino: 'Filipino',
  indonesian: 'Indonesian', malay: 'Malay', sundanese: 'Sundanese',
  javanese: 'Javanese',
};

const ALL_LANGS: Language[] = Object.keys(labels) as Language[];

const LanguageContext = createContext<LanguageContextType>({
  language: 'english',
  setLanguage: () => {},
  languageLabel: 'English',
});

export function getSavedLanguage(): Language {
  const saved = localStorage.getItem('rw_language');
  if (saved && ALL_LANGS.includes(saved as Language)) {
    return saved as Language;
  }
  return 'english';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(getSavedLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem('rw_language', lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageLabel: labels[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
