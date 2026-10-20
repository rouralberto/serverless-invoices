<template>
    <div>
        <div v-for="field in invoice.client_fields" :key="field.id">
            <span :class="{'d-print-none': !field.value }">{{ field.label }}: </span>
            <AppEditable :value="field.value"
                         :placeholder="field.label"
                         class="break-line"
                         @change="updateProp({ value: $event }, field)"/>
        </div>
    </div>
</template>
<script>
import { mapStores } from 'pinia';
import AppEditable from '@/components/form/AppEditable.vue';
import { useClientFieldsStore } from '@/store/client-fields';
import { useInvoiceClientFieldsStore } from '@/store/invoice-client-fields';

export default {
  props: ['invoice'],
  components: {
    AppEditable,
  },
  computed: {
    ...mapStores(useInvoiceClientFieldsStore, useClientFieldsStore),
  },
  methods: {
    updateProp(props, field) {
      this.invoiceClientFieldsStore.updateInvoiceClientField({
        props,
        fieldId: field.id,
        invoiceId: this.invoice.id,
      });
      this.clientFieldsStore.updateClientField({
        fieldId: field.client_field_id,
        props,
      });
    },
  },
};
</script>
