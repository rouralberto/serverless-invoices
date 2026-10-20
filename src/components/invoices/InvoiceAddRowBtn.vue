<template>
    <tr class="d-print-none">
        <td :colspan="colspan">
            <button class="btn btn-sm" @click="addRow">
                <i class="material-icons md-18 pointer">add</i>
            </button>
            <AppError :errors="errors" field="rows"/>
        </td>
    </tr>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import AppError from '@/components/form/AppError.vue';
import { useInvoiceRowsStore } from '@/store/invoice-rows';

export default {
  props: ['invoice', 'errors'],
  components: {
    AppError,
  },
  computed: {
    ...mapStores(useInvoiceRowsStore),
    ...mapState(useInvoiceRowsStore, ['taxes']),
    colspan() {
      return 5 + this.taxes.length;
    },
  },
  methods: {
    addRow() {
      this.invoiceRowsStore.addRow(this.invoice.id);
    },
  },
};
</script>
