<template>
    <header class="app-header d-print-none">
        <div class="container app__content app-header__inner">
            <router-link :to="{ name: 'invoices' }" class="app-header__brand">
                <img src="@/assets/img/logo.svg" alt="" width="26" height="26">
                <span class="d-none d-sm-inline">Serverless Invoices</span>
            </router-link>

            <nav class="app-header__nav">
                <router-link :to="{ name: 'invoices' }"
                             class="app-header__link"
                             :class="{ active: isInvoicesRoute }">{{ t('invoices') }}</router-link>
                <router-link :to="{ name: 'clients' }"
                             class="app-header__link"
                             active-class="active">{{ t('clients') }}</router-link>
                <button type="button" class="app-header__link" @click="teamsStore.isModalOpen = true">
                    {{ t('company') }}
                </button>
            </nav>

            <div class="app-header__actions">
                <button type="button"
                        class="backup-status"
                        :class="{ 'backup-status--stale': isBackupStale }"
                        :title="lastBackupAt ? new Date(lastBackupAt).toLocaleString(locale) : t('invoices:last_backup_hint')"
                        @click="saveJson">
                    <i class="material-icons-round md-18">{{ isBackupStale ? 'cloud_off' : 'cloud_done' }}</i>
                    <span class="d-none d-lg-inline">{{ t('invoices:last_backup', { when: lastBackupLabel }) }}</span>
                </button>
                <button type="button"
                        class="btn-icon"
                        :title="theme === 'dark' ? t('theme_light') : t('theme_dark')"
                        @click="toggleTheme">
                    <i class="material-icons-round md-18">{{ theme === 'dark' ? 'light_mode' : 'dark_mode' }}</i>
                </button>
                <LanguageSwitcher/>
                <AppDropdown toggle-class="btn-icon" :title="t('data')">
                    <template #button-content>
                        <i class="material-icons-round md-18">more_vert</i>
                    </template>
                    <li><h6 class="dropdown-header">{{ t('data') }}</h6></li>
                    <li>
                        <button type="button" class="dropdown-item" @click="dataStore.exportJson()">
                            <i class="material-icons-round md-18">download</i>{{ t('invoices:export') }}
                        </button>
                    </li>
                    <li>
                        <button type="button" class="dropdown-item" @click="dataStore.isImportModalOpen = true">
                            <i class="material-icons-round md-18">upload</i>{{ t('invoices:import') }}
                        </button>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <button type="button" class="dropdown-item" @click="saveJson">
                            <i class="material-icons-round md-18">cloud_upload</i>{{ t('invoices:save_in_s3') }}
                        </button>
                    </li>
                </AppDropdown>
            </div>
        </div>
    </header>
</template>

<script>
import { mapActions, mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import AppDropdown from '@/components/ui/AppDropdown.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { intlLocale } from '@/config/i18n.config';
import { useDataStore } from '@/store/data';
import { useLanguageStore } from '@/store/language';
import { useTeamsStore } from '@/store/teams';
import { useThemesStore } from '@/store/themes';
import { fromNow } from '@/utils/format';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default {
  setup() {
    return useTranslation(['app-header', 'invoices']);
  },
  components: {
    AppDropdown,
    LanguageSwitcher,
  },
  computed: {
    ...mapStores(useDataStore, useTeamsStore),
    ...mapState(useDataStore, ['lastBackupAt']),
    ...mapState(useThemesStore, ['theme']),
    ...mapState(useLanguageStore, { languageCode: 'code' }),
    isInvoicesRoute() {
      return ['invoices', 'invoice'].includes(this.$route.name);
    },
    locale() {
      return intlLocale(this.languageCode);
    },
    lastBackupLabel() {
      return this.lastBackupAt ? fromNow(this.lastBackupAt, this.locale) : this.t('invoices:never');
    },
    isBackupStale() {
      return !this.lastBackupAt || Date.now() - new Date(this.lastBackupAt).getTime() > WEEK_MS;
    },
  },
  methods: {
    ...mapActions(useThemesStore, ['toggleTheme']),
    saveJson() {
      // storeInBucket already alerts the user when the upload fails.
      this.dataStore.saveJson().catch(() => {});
    },
  },
};
</script>
