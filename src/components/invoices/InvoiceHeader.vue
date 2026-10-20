<template>
    <div>
        <h3>
            {{ t('invoice_title') }}
            <AppEditable :value="invoice.number"
                         :errors="errors"
                         field="number"
                         :placeholder="t('invoice_number')"
                         @change="updateProp({ number: $event })"/>
        </h3>
        {{ t('issued_at') }}
        <AppDatePicker :value="invoice.issued_at"
                       @change="updateProp({ issued_at: $event })"
                       :errors="errors"
                       field="issued_at"/>
        <br>{{ t('due_at') }}
        <AppDatePicker :value="invoice.due_at"
                       @change="updateProp({ due_at: $event })"
                       :errors="errors"
                       field="due_at"/>
        <span :class="{'d-print-none': !invoice.late_fee}">
            <br>{{ t('late_fee') }}
            <AppEditable :value="formatCurrency(invoice.late_fee)"
                         :errors="errors"
                         suffix="%"
                         field="late_fee"
                         :placeholder="t('add_late_fee')"
                         @change="updateProp({ late_fee: $event })"/>
        </span>
    </div>
</template>
<script>
import { useTranslation } from 'i18next-vue';
import AppEditable from '@/components/form/AppEditable.vue';
import AppDatePicker from '@/components/form/AppDatePicker.vue';
import { formatCurrency } from '@/utils/format';

export default {
  setup() {
    return useTranslation('invoice-header');
  },
  props: ['invoice', 'errors'],
  emits: ['update'],
  components: {
    AppEditable,
    AppDatePicker,
  },
  methods: {
    formatCurrency,
    updateProp(props) {
      this.$emit('update', props);
    },
  },
  watch: {
    'invoice.number'(newVal) {
      document.title = newVal || 'Serverless Invoices';
    },
  },
  updated() {
    document.title = this.invoice.number ? this.invoice.number : 'Serverless Invoices';
  },
};
</script>
