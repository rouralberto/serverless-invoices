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
            <small v-b-tooltip.hover
                   :title="t('title')"
                   class="pointer">
                {{ t('what_about_my_data') }}
            </small>
            <a href="https://github.com/rouralberto/serverless-invoices"
               class="btn btn-sm btn--icon ms-0 ms-md-2"
               target="_blank">
                <img src="@/assets/img/github.png"
                     alt="Serverless Invoices Github"
                     v-if="theme === 'dark'">
                <img src="@/assets/img/github-dark.png"
                     alt="Serverless Invoices Github"
                     v-else>
            </a>
        </div>
    </footer>
</template>

<script>
import { mapWritableState } from 'pinia';
import { vBTooltip } from 'bootstrap-vue-next';
import { useTranslation } from 'i18next-vue';
import { useThemesStore } from '@/store/themes';
import LanguageSwitcher from './LanguageSwitcher.vue';

export default {
  setup() {
    return useTranslation('the-footer');
  },
  components: { LanguageSwitcher },
  directives: {
    'b-tooltip': vBTooltip,
  },
  computed: {
    ...mapWritableState(useThemesStore, ['theme']),
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', this.theme);
      document.documentElement.setAttribute('data-theme', this.theme);
    },
  },
};
</script>
