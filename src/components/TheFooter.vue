<template>
    <footer class="row text-secondary px-0 mt-3 d-print-none">
        <div class="col-md-4">
            <LanguageSwitcher class="ms-n2 ms-md-0"/>
            <button class="btn btn-sm text-secondary" @click="toggleTheme">
                {{ theme === 'dark' ? t('lights-on') : t('lights-off') }}
                <i class="material-icons material-icons-round md-14 align-text-bottom ms-1">
                    {{ theme === 'dark' ? 'wb_sunny' : 'brightness_2' }}
                </i>
            </button>
        </div>
        <div class="col-md-8 text-start text-md-end">
            <small :title="t('title')"
                   class="pointer">
                {{ t('what_about_my_data') }}
            </small>
            <a href="https://github.com/rouralberto/serverless-invoices"
               class="btn btn-sm btn--icon ms-0 ms-md-2"
               target="_blank">
                <img src="@/assets/img/github.png"
                     :alt="t('github_alt')"
                     v-if="theme === 'dark'">
                <img src="@/assets/img/github-dark.png"
                     :alt="t('github_alt')"
                     v-else>
            </a>
        </div>
    </footer>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useTranslation } from 'i18next-vue';
import { useThemesStore } from '@/store/themes';
import LanguageSwitcher from './LanguageSwitcher.vue';

export default {
  setup() {
    return useTranslation('the-footer');
  },
  components: { LanguageSwitcher },
  computed: {
    ...mapState(useThemesStore, ['theme']),
  },
  methods: {
    ...mapActions(useThemesStore, ['toggleTheme']),
  },
};
</script>
