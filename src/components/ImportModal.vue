<template>
    <AppModal v-model="isOpen"
              centered
              :title="t('title')"
              content-class="bg-base dp--24 text-center">
        <p>
            <AppFileInput @selected="onSelected" :button-text="t('button_text')"/>
            <AppError :errors="errors" field="file"/>
        </p>
        <p>
            <small>{{ t('warning') }}</small>
        </p>
    </AppModal>
</template>

<script>
import { mapStores, mapWritableState } from 'pinia';
import { useTranslation } from 'i18next-vue';
import { useDataStore } from '@/store/data';
import AppFileInput from './form/AppFileInput.vue';
import Errors from '../utils/errors';
import AppError from './form/AppError.vue';
import AppModal from './ui/AppModal.vue';

export default {
  setup() {
    return useTranslation('import-modal');
  },
  components: {
    AppError,
    AppFileInput,
    AppModal,
  },
  data() {
    return {
      errors: new Errors(),
    };
  },
  computed: {
    ...mapStores(useDataStore),
    ...mapWritableState(useDataStore, { isOpen: 'isImportModalOpen' }),
  },
  methods: {
    close() {
      this.isOpen = false;
    },
    onSelected(payload) {
      try {
        const data = JSON.parse(payload.content);

        this.dataStore.importJson(data);
        this.close();
      } catch {
        return this.errors.set({
          file: [this.t('on-select-error')],
        });
      }
    },
  },
};
</script>
