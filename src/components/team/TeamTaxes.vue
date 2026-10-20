<template>
    <div>
        <div v-for="tax in taxes" :key="tax.id">
            <AppEditable :value="tax.label"
                         :placeholder="t('label')"
                         @change="updateTaxProp({ label: $event }, tax)"/> (%)
            <i class="material-icons md-18 float-end pointer" @click="removeTax(tax)">close</i>
            <AppInput :value="tax.value" @change="updateTaxProp({ value: $event }, tax)"
                      :placeholder="tax.label" type="number"/>
        </div>
        <button type="button" class="btn btn-sm btn-secondary" @click="addNewTax">
            <i class="material-icons md-18">add</i>
            {{ t('tax') }}
        </button>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import NotificationService from '@/services/notification.service';
import ConfirmService from '@/services/confirm.service';
import AppInput from '@/components/form/AppInput.vue';
import AppEditable from '@/components/form/AppEditable.vue';
import { useTaxesStore } from '@/store/taxes';

export default {
  setup() {
    return useTranslation('team-taxes');
  },
  emits: ['changed'],
  components: {
    AppEditable,
    AppInput,
  },
  computed: {
    ...mapStores(useTaxesStore),
    ...mapState(useTaxesStore, { taxes: 'all' }),
  },
  methods: {
    addNewTax() {
      this.taxesStore.addNewTax();
    },
    async removeTax(field) {
      const confirmed = await ConfirmService.confirm(`${this.t('delete_modal.title')} ${field.label}?`, {
        okTitle: this.t('delete_modal.ok_title'),
        okVariant: 'danger',
        cancelTitle: this.t('delete_modal.cancel_title'),
        cancelVariant: 'btn-link',
        contentClass: 'bg-base dp--24',
      });
      if (confirmed) {
        await this.taxesStore.deleteTax(field.id);
        try {
          this.$emit('changed');
          NotificationService.success(this.t('notification_deleted'));
        } catch (err) {
          NotificationService.error(err.message);
        }
      }
    },
    updateTaxProp(props, tax) {
      this.taxesStore.updateTax({
        props,
        taxId: tax.id,
      });
      this.$emit('changed');
    },
  },
};
</script>
