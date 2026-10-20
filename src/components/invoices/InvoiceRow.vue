<template>
    <tr>
        <td>
            <AppEditable :value="row.item"
                         :errors="errors"
                         :field="`rows.${index}.item`"
                         :placeholder="t('enter_item')"
                         @change="updateProp({ item: $event })"/>
        </td>
        <td>
            <AppEditable :value="row.quantity"
                         :errors="errors"
                         :field="`rows.${index}.quantity`"
                         :placeholder="t('enter_quantity')"
                         @change="updateProp({ quantity: $event })"/>
        </td>
        <td>
            <AppEditable :value="row.unit"
                         :errors="errors"
                         :field="`rows.${index}.unit`"
                         :placeholder="t('enter_unit')"
                         @change="updateProp({ unit: $event })"/>
        </td>
        <td>
            <AppEditable :value="formatCurrency(row.price)"
                         :errors="errors"
                         :field="`rows.${index}.price`"
                         :placeholder="t('enter_price')"
                         @change="updateProp({ price: $event })"/>
        </td>
        <td v-for="(tax, taxIndex) in row.taxes" :key="tax.id" :title="tax.label">
            <AppEditable v-if="tax.row_id"
                         :value="formatCurrency(tax.value)"
                         :errors="errors"
                         :field="`rows.${index}.taxes.${taxIndex}.value`"
                         :placeholder="t('enter_tax')"
                         @change="updateTaxProp({ value: $event }, tax)"/>
        </td>
        <td class="text-end position-relative">
            {{ formatCurrency(row.quantity * row.price) }}
            <button class="btn btn-sm d-print-none invoice__row-control"
                    @click="removeRow(row)">
                <i class="material-icons md-18 pointer">remove</i>
            </button>
        </td>
    </tr>
</template>

<script>
import { mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import { formatCurrency } from '../../filters/currency.filter';
import AppEditable from '../form/AppEditable.vue';
import { useInvoiceRowsStore } from '@/store/invoice-rows';

export default {
  setup() {
    return useTranslation('invoice-row');
  },
  props: ['row', 'errors', 'index'],
  name: 'InvoiceRow',
  components: {
    AppEditable,
  },
  computed: {
    ...mapStores(useInvoiceRowsStore),
  },
  methods: {
    formatCurrency,
    updateProp(props) {
      this.invoiceRowsStore.updateInvoiceRow({
        props,
        id: this.row.id,
        invoiceId: this.row.invoice_id,
      });
    },
    updateTaxProp(props, tax) {
      this.invoiceRowsStore.updateInvoiceRowTax({
        props,
        invoiceId: this.row.invoice_id,
        taxId: tax.id,
      });
    },
    async removeRow(row) {
      this.invoiceRowsStore.removeRow(row.id);
      this.updateProp();
    },
  },
};
</script>
