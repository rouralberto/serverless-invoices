<template>
    <AppModal v-model="isOpen"
              centered
              :title="t('title')"
              size="lg"
              scrollable
              content-class="bg-base dp--24 text-center">
        <AppTextarea :value="team.custom_css"
                     @change="updateProp({ custom_css: $event })"
                     :label="t('textarea_label')"
                     field="custom_css"
                     :errors="errors"
                     input-classes="min-vh-50 font-monospace"
                     class="text-start"/>
    </AppModal>
</template>

<script>
import { mapState, mapStores, mapWritableState } from 'pinia';
import { useTranslation } from 'i18next-vue';
import AppTextarea from '@/components/form/AppTextarea.vue';
import AppModal from '@/components/ui/AppModal.vue';
import Errors from '@/utils/errors';
import NotificationService from '@/services/notification.service';
import { useInvoicesStore } from '@/store/invoices';
import { useTeamsStore } from '@/store/teams';

export default {
  setup() {
    return useTranslation('customizations-modal');
  },
  data() {
    return {
      errors: new Errors(),
    };
  },
  components: {
    AppModal,
    AppTextarea,
  },
  computed: {
    ...mapStores(useTeamsStore),
    ...mapWritableState(useInvoicesStore, { isOpen: 'isCustomizationsModalOpen' }),
    ...mapState(useTeamsStore, ['team']),
  },
  watch: {
    team() {
      this.updateStyleEl(this.team ? this.team.custom_css : '');
    },
  },
  created() {
    this.initStyleEl();
    if (this.team) {
      this.updateStyleEl(this.team.custom_css);
    }
  },
  methods: {
    initStyleEl() {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('id', 'custom-styles');
      styleEl.setAttribute('type', 'text/css');
      document.head.appendChild(styleEl);
    },
    updateStyleEl(styles) {
      const styleEl = document.getElementById('custom-styles');
      styleEl.innerHTML = styles;
    },
    close() {
      this.isOpen = false;
    },
    async updateProp(props) {
      await this.teamsStore.updateTeam(props);
      NotificationService.success(this.t('updated'));
      this.updateStyleEl(props.custom_css);
    },
  },
};
</script>
