<template>
    <BDropdown v-if="selectedLang" variant="link" size="sm" placement="bottom-end" no-caret toggle-class="text-secondary">
        <template #button-content>
            <span class="text-secondary">
                <span class="text-uppercase">{{ selectedLang.code }}</span>
                <i class="material-icons md-18">expand_more</i>
            </span>
        </template>
        <BDropdownItemButton v-for="lang in languages"
                             @click="langChanged(lang)"
                             :key="lang.code">{{ lang.name }}</BDropdownItemButton>
    </BDropdown>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { BDropdown, BDropdownItemButton } from 'bootstrap-vue-next';
import { useLanguageStore } from '@/store/language';

export default {
  name: 'language-switcher',
  components: {
    BDropdown,
    BDropdownItemButton,
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
