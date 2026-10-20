<template>
    <div>
        <img v-if="team.logo_url"
             class="pointer"
             @click="openModal"
             :src="team.logo_url" style="width:100%; max-width:200px;">
        <button class="btn btn-sm d-print-none" @click="openModal" v-else>
            <i class="material-icons material-icons-round md-36">file_upload</i>
        </button>
        <AppError :errors="errors" field="logo_url"/>
        <AppModal v-model="isModalOpen"
                  centered
                  :title="t('modal_title')"
                  size="sm"
                  content-class="bg-base dp--24 text-center">
            <AppFileInput accept="image/*" class="mb-4" @selected="logoSelected"
                          :button-text="t('button_text')" output-type="base64"/>
            {{ t('or') }}
            <AppInput :value="team.logo_url"
                      class="mt-4"
                      @change="updateTeam({ logo_url: $event })"
                      :label="t('logo_url')"
                      field="logo_url"
                      :errors="errors"
                      type="url"/>
        </AppModal>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import AppError from '@/components/form/AppError.vue';
import AppInput from '@/components/form/AppInput.vue';
import AppFileInput from '@/components/form/AppFileInput.vue';
import AppModal from '@/components/ui/AppModal.vue';
import { useTeamsStore } from '@/store/teams';

export default {
  setup() {
    return useTranslation('team-logo');
  },
  props: ['errors'],
  components: {
    AppFileInput,
    AppError,
    AppInput,
    AppModal,
  },
  data() {
    return {
      isModalOpen: false,
    };
  },
  computed: {
    ...mapStores(useTeamsStore),
    ...mapState(useTeamsStore, ['team']),
  },
  methods: {
    updateTeam(props) {
      this.teamsStore.updateTeam(props);
    },
    logoSelected(payload) {
      this.errors.clear();
      if (payload.size / 1000 > 512) {
        return this.errors.set({ logo_url: [this.t('logo_url_err')] });
      }
      this.updateTeam({ logo_url: payload.content });
    },
    openModal() {
      this.isModalOpen = true;
    },
  },
};
</script>
