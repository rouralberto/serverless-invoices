<template>
    <tfoot>
    <tr class="text-end">
        <td :colspan="colspan">{{ t('subtotal') }}</td>
        <td>{{ formatCurrency(invoice.subTotal) }}</td>
    </tr>
    <tr class="text-end" v-for="tax in invoice.taxes" :key="tax.label">
        <td :colspan="colspan">
            {{ tax.label }} ({{ tax.rate }}%)
        </td>
        <td>{{ formatCurrency(tax.total) }}</td>
    </tr>
    <tr class="text-end">
        <th :colspan="colspan">
            {{ t('total') }}
            <AppEditable :value="invoice.currency"
                         :errors="errors"
                         field="currency"
                         :placeholder="t('add_currency')"
                         @change="updateProp({ currency: $event })"/>
        </th>
        <th class="text-nowrap">{{ formatCurrency(invoice.total) }}</th>
    </tr>
    </tfoot>
</template>
<script>
import { mapState } from 'pinia';
import { useTranslation } from 'i18next-vue';
import AppEditable from '../form/AppEditable.vue';
import { formatCurrency } from '@/utils/format';
import { useInvoicesStore } from '@/store/invoices';

export default {
  setup() {
    return useTranslation('invoice-totals');
  },
  props: ['invoice', 'errors'],
  emits: ['update'],
  components: {
    AppEditable,
  },
  computed: {
    ...mapState(useInvoicesStore, ['taxes']),
    colspan() {
      return 4 + this.taxes.length;
    },
  },
  methods: {
    formatCurrency,
    updateProp(props) {
      this.$emit('update', props);
    },
  },
};
</script>
