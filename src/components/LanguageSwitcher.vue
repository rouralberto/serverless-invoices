<template>
    <AppDropdown v-if="selectedLang" toggle-class="btn-icon btn-icon--text">
        <template #button-content>
            <i class="material-icons-round md-18">translate</i>
            <span class="text-uppercase small">{{ selectedLang.code.split('_')[0] }}</span>
        </template>
        <li v-for="lang in languages" :key="lang.code">
            <button type="button"
                    class="dropdown-item"
                    :class="{ active: lang.code === selectedLang.code }"
                    @click="langChanged(lang)">{{ lang.name }}</button>
        </li>
    </AppDropdown>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import AppDropdown from '@/components/ui/AppDropdown.vue';
import { useLanguageStore } from '@/store/language';

export default {
  name: 'language-switcher',
  components: {
    AppDropdown,
  },
  computed: {
    ...mapStores(useLanguageStore),
    ...mapState(useLanguageStore, {
      selectedLang: 'lang',
      languages: 'all',
    }),
  },
  methods: {
    langChanged(lang) {
      this.languageStore.changeLanguage(lang);
    },
  },
};
</script>
