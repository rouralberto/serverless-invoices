<template>
    <div>
        <div v-for="field in team.fields" :key="field.id" class="col-12">
            <AppEditable :value="field.label"
                         :placeholder="t('label')"
                         @change="updateFieldProp({ label: $event }, field)"/>
            <i class="material-icons md-18 float-end pointer" @click="removeField(field)">close</i>
            <AppInput :value="field.value" @change="updateFieldProp({ value: $event }, field)"
                      :placeholder="field.label"/>
        </div>
        <div class="col-12">
            <button class="btn btn-sm btn-secondary" @click="addNewField">
                <i class="material-icons md-18">add</i>
                {{ t('field') }}
            </button>
        </div>
    </div>
</template>
<script>
import { mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import NotificationService from '@/services/notification.service';
import ConfirmService from '@/services/confirm.service';
import AppInput from '@/components/form/AppInput.vue';
import AppEditable from '@/components/form/AppEditable.vue';
import { useTeamsStore } from '@/store/teams';

export default {
  setup() {
    return useTranslation('team-fields');
  },
  props: ['team'],
  components: {
    AppEditable,
    AppInput,
  },
  computed: {
    ...mapStores(useTeamsStore),
  },
  methods: {
    addNewField() {
      this.teamsStore.addField();
    },
    async removeField(field) {
      const confirmed = await ConfirmService.confirm(`${this.t('delete_modal.title')} ${field.label}?`, {
        okTitle: this.t('delete_modal.ok_title'),
        okVariant: 'danger',
        cancelTitle: this.t('delete_modal.cancel_title'),
      });
      if (confirmed) {
        await this.teamsStore.deleteField(field.id);
        NotificationService.success(this.t('notification_delete'));
      }
    },
    updateFieldProp(props, field) {
      this.teamsStore.updateField(field.id, props);
    },
  },
};
</script>
