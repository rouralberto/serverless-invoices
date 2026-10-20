<template>
    <footer class="app-footer d-print-none">
        <small :title="t('title')" class="pointer">
            <i class="material-icons-round md-16">lock</i>
            {{ t('what_about_my_data') }}
        </small>
        <a href="https://github.com/rouralberto/serverless-invoices"
           class="app-footer__github"
           target="_blank"
           rel="noopener">
            <img src="@/assets/img/github.png" :alt="t('github_alt')" v-if="theme === 'dark'">
            <img src="@/assets/img/github-dark.png" :alt="t('github_alt')" v-else>
        </a>
    </footer>
</template>

<script>
import { mapState } from 'pinia';
import { useTranslation } from 'i18next-vue';
import { useThemesStore } from '@/store/themes';

export default {
  setup() {
    return useTranslation('the-footer');
  },
  computed: {
    ...mapState(useThemesStore, ['theme']),
  },
};
</script>
