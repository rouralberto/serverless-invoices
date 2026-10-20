import { defineStore } from 'pinia';
import i18next from 'i18next';
import router from '@/router';
import { LANGUAGES, setLanguage } from '@/config/i18n.config';

export const useLanguageStore = defineStore('language', {
  state: () => ({
    code: i18next.language,
    all: LANGUAGES,
  }),
  getters: {
    lang: state => state.all.find(lang => lang.code === state.code),
  },
  actions: {
    async changeLanguage(lang) {
      await setLanguage(lang.code);
      this.code = lang.code;
      router.push({ query: { ...router.currentRoute.value.query, lang: lang.code } });
    },
  },
});
