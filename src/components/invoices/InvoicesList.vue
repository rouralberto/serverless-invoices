<template>
    <div class="table-responsive">
        <div v-if="!displayInvoices" class="col-12">{{ t('loading') }}</div>
        <table class="table table--card table-hover" v-else-if="displayInvoices && displayInvoices.length > 0">
            <thead>
            <tr>
                <th>{{ t('invoice_number') }}</th>
                <th>{{ t('client') }}</th>
                <th>{{ t('issued_at') }}</th>
                <th>{{ t('total') }}</th>
                <th class="text-end">{{ t('status') }}</th>
                <th class="text-end">
                  <i class="pointer material-icons material-icons-round md-18">
                    handyman
                  </i>
                </th>
            </tr>
            </thead>
            <tbody v-if="displayInvoices">
            <tr v-for="invoice in displayInvoices" :key="invoice.id">
                <td class="pointer" @click="openInvoice(invoice)">
                  {{ invoice.number }}
                </td>
                <td class="pointer" @click="openInvoice(invoice)">
                  {{ invoice.client ? invoice.client.company_name : '' }}
                </td>
                <td class="pointer" @click="openInvoice(invoice)">
                  {{ formatDate(invoice.issued_at, 'D MMM YYYY', 'YYYY-MM-DD') }}
                </td>
                <td class="pointer" @click="openInvoice(invoice)">
                    {{ formatCurrency(invoice.subTotal) }}
                    <span v-if="getClientTotal(invoice.client_id) > 0" class="text-secondary">
                      / {{ formatCurrency(getClientTotal(invoice.client_id)) }}
                    </span>
                    <small class="text-secondary" v-if="invoice.taxTotal">
                      <br>{{ t('tax_amount', { amount: formatCurrency(invoice.taxTotal) }) }}
                    </small>
                </td>
                <td class="pointer text-end text-capitalize" @click="openInvoice(invoice)">
                    <i class="material-icons material-icons-round md-18 me-2 text-danger"
                       v-if="isOverDue(invoice)"
                       :title="t('overdue')">warning</i>
                    <i class="material-icons material-icons-round md-18 me-2 text-warning"
                       v-else-if="invoice.status === 'draft'">edit_note</i>
                    <i class="material-icons material-icons-round md-18 me-2 text-success"
                       v-else-if="invoice.status === 'paid'">done</i>
                    <i class="material-icons material-icons-round md-18 me-2 text-muted"
                       v-else-if="invoice.status === 'written_off'"
                       :title="t('statuses.written_off')">money_off</i>
                    {{ t(`statuses.${invoice.status}`) }}
                </td>
              <td class="text-end">
                <i class="pointer material-icons material-icons-round md-18"
                   :title="t('duplicate')"
                   @click="duplicateInvoice(invoice.id)">
                  copy
                </i>
              </td>
            </tr>
            </tbody>
        </table>
        <EmptyState v-else/>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import dayjs from 'dayjs/esm';
import EmptyState from '@/components/EmptyState.vue';
import { formatCurrency, formatDate } from '@/utils/format';
import { useInvoicesStore } from '@/store/invoices';

export default {
  setup() {
    return useTranslation(['invoices-list', 'statuses']);
  },
  props: {
    invoices: {
      type: Array,
      default: null,
    },
  },
  components: {
    EmptyState,
  },
  computed: {
    ...mapStores(useInvoicesStore),
    ...mapState(useInvoicesStore, { allInvoices: 'all' }),
    displayInvoices() {
      // Use prop if provided, otherwise fallback to store
      return this.invoices || this.allInvoices;
    },
  },
  methods: {
    formatDate,
    formatCurrency,
    openInvoice(invoice) {
      this.invoicesStore.invoiceId = invoice.id;
      this.$router.push({
        name: 'invoice',
        params: { id: invoice.id },
      });
    },
    isOverDue: invoice => invoice.status === 'sent' && invoice.due_at < dayjs().format(),
    duplicateInvoice(invoiceId) {
      this.invoicesStore.duplicateInvoice(invoiceId)
        .then(id => this.$router.push({ name: 'invoice', params: { id } }));
    },
    getClientTotal(clientId) {
      if (!clientId) return 0;

      return this.allInvoices
        .filter(invoice => invoice.client_id === clientId)
        .filter(invoice => ['sent', 'paid'].includes(invoice.status))
        .reduce((total, invoice) => total + invoice.subTotal, 0);
    }
  },
};
</script>
