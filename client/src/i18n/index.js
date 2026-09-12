import en from './en.json';
import hi from './hi.json';
import od from './od.json';

export const translations = {
  en,
  hi,
  od,
};

export const getTranslation = (lang = 'en', path = '') => {
  const dict = translations[lang] || translations.en;
  const keys = path.split('.');
  let current = dict;

  for (const k of keys) {
    if (current && current[k] !== undefined) {
      current = current[k];
    } else {
      // Fallback to English
      let fallback = translations.en;
      for (const fk of keys) {
        if (fallback && fallback[fk] !== undefined) {
          fallback = fallback[fk];
        } else {
          return path;
        }
      }
      return fallback;
    }
  }

  return current || path;
};
