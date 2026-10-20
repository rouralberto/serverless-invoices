<template>
    <AppDropdown v-if="selectedLang" size="sm" toggle-class="text-secondary">
        <template #button-content>
            <span class="text-secondary">
                <span class="text-uppercase">{{ selectedLang.code }}</span>
                <i class="material-icons md-18">expand_more</i>
            </span>
        </template>
        <li v-for="lang in languages" :key="lang.code">
            <button type="button" class="dropdown-item" @click="langChanged(lang)">{{ lang.name }}</button>
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
