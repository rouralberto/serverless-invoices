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
import { useClientFieldsStore } from '@/store/client-fields';

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
    ...mapStores(useClientFieldsStore),
    isNew() {
      return this.client && this.client.$isNew;
    },
  },
  methods: {
    addNewField() {
      this.clientFieldsStore.addNewField(this.client.id);
    },
    async removeField(field) {
      const confirmed = await ConfirmService.confirm(`${this.t('delete_modal.title')} ${field.label}?`, {
        okTitle: this.t('delete_modal.ok_title'),
        okVariant: 'danger',
        cancelTitle: this.t('delete_modal.cancel_title'),
        cancelVariant: 'btn-link',
        contentClass: 'bg-base dp--24',
      });
      if (confirmed) {
        await this.clientFieldsStore.deleteClientField(field.id);
        try {
          NotificationService.success(this.t('notification_deleted'));
        } catch (err) {
          NotificationService.error(err.message);
        }
      }
    },
    updateFieldProp(props, field) {
      if (this.isNew) {
        return this.clientFieldsStore.clientFieldProps({
          props,
          fieldId: field.id,
        });
      }
      this.clientFieldsStore.updateClientField({
        props,
        fieldId: field.id,
      });
    },
  },
};
</script>
