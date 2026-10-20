import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useLanguageStore } from '@/store/language';

i18next
  .use(LanguageDetector)
  .use(Backend);

export const initialized = i18next.init({
  fallbackLng: 'en',
  ns: [],
  backend: {
    loadPath: `${window.location.origin}/locales/{{lng}}/{{ns}}.json`,
  },
  detection: {
    order: ['querystring', 'path', 'localStorage', 'navigator'],
    lookupQuerystring: 'lang',
    caches: ['localStorage'],
  },
});
initialized.then(() => useLanguageStore().initLanguage(i18next.language));

export default i18next;
