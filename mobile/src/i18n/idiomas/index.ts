import pt from './pt.json';
import en from './en.json';

export const resources = {
  pt: {
    translation: pt,
  },
  en: {
    translation: en,
  },
};

export type Language = 'pt' | 'en';