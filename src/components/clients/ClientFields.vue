<template>
    <div>
        <div v-for="field in client.fields" :key="field.id" class="col-sm-6">
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
import { useClientsStore } from '@/store/clients';

export default {
  setup() {
    return useTranslation('client-fields');
  },
  props: ['client'],
  components: {
    AppEditable,
    AppInput,
  },
  computed: {
    ...mapStores(useClientsStore),
  },
  methods: {
    addNewField() {
      this.clientsStore.addField(this.client.id);
    },
    async removeField(field) {
      const confirmed = await ConfirmService.confirm(`${this.t('delete_modal.title')} ${field.label}?`, {
        okTitle: this.t('delete_modal.ok_title'),
        okVariant: 'danger',
        cancelTitle: this.t('delete_modal.cancel_title'),
      });
      if (confirmed) {
        await this.clientsStore.deleteField(this.client.id, field.id);
        NotificationService.success(this.t('notification_deleted'));
      }
    },
    updateFieldProp(props, field) {
      this.clientsStore.updateField(this.client.id, field.id, props);
    },
  },
};
</script>
