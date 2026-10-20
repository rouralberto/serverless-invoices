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
import { useInvoicesStore } from '@/store/invoices';

export default {
  props: ['invoice'],
  components: {
    AppEditable,
  },
  computed: {
    ...mapStores(useInvoicesStore),
  },
  methods: {
    updateProp(props, field) {
      // Also updates the matching field on the client, so new invoices pick it up.
      this.invoicesStore.updateClientField(this.invoice.id, field.id, props);
    },
  },
};
</script>
