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
        <span class="editable__item" @click="isIssuedAtModalOpen = true">{{ formatDate(invoice.issued_at, 'D. MMM YYYY', 'YYYY-MM-DD') }}</span>
        <BModal v-model="isIssuedAtModalOpen"
                centered
                :title="t('modal_issued_at_title')"
                no-footer
                size="sm"
                content-class="bg-base dp--24">
            <AppDatePicker :value="invoice.issued_at"
                           @change="updateProp({ issued_at: $event })"
                           :errors="errors"
                           :inline="true"
                           field="issued_at"/>
        </BModal>
        <br>{{ t('due_at') }}
        <span class="editable__item"
              @click="isDueAtModalOpen = true">{{ formatDate(invoice.due_at, 'D. MMM YYYY', 'YYYY-MM-DD') }}</span>
        <BModal v-model="isDueAtModalOpen"
                centered
                :title="t('modal_due_at_title')"
                no-footer
                size="sm"
                content-class="bg-base dp--24">
            <AppDatePicker :value="invoice.due_at"
                           @change="updateProp({ due_at: $event })"
                           :errors="errors"
                           :inline="true"
                           field="due_at"/>
        </BModal>
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
import { BModal } from 'bootstrap-vue-next';
import { useTranslation } from 'i18next-vue';
import AppEditable from '@/components/form/AppEditable.vue';
import AppDatePicker from '@/components/form/AppDatePicker.vue';
import { formatDate } from '@/filters/date.filter';
import { formatCurrency } from '@/filters/currency.filter';

export default {
  setup() {
    return useTranslation('invoice-header');
  },
  props: ['invoice', 'errors'],
  emits: ['update'],
  components: {
    AppEditable,
    AppDatePicker,
    BModal,
  },
  data() {
    return {
      isIssuedAtModalOpen: false,
      isDueAtModalOpen: false,
    };
  },
  methods: {
    formatDate,
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
