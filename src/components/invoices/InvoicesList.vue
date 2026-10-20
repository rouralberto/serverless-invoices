<template>
    <div class="table-responsive">
        <div v-if="!displayInvoices" class="p-3">{{ t('loading') }}</div>
        <table class="table data-table" v-else-if="displayInvoices.length > 0">
            <thead>
            <tr>
                <th>{{ t('invoice_number') }}</th>
                <th>{{ t('client') }}</th>
                <th>{{ t('issued_at') }}</th>
                <th class="text-end">{{ t('total') }}</th>
                <th>{{ t('status') }}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="invoice in displayInvoices" :key="invoice.id" class="pointer" @click="openInvoice(invoice)">
                <td class="text-nowrap"><span class="invoice-number">{{ invoice.number }}</span></td>
                <td class="text-nowrap">
                    <span v-if="invoice.client || invoice.client_name" class="with-avatar">
                        <span class="avatar">{{ initials(invoice.client ? invoice.client.company_name : invoice.client_name) }}</span>
                        {{ invoice.client ? invoice.client.company_name : invoice.client_name }}
                    </span>
                </td>
                <td class="text-secondary text-nowrap">{{ formatDate(invoice.issued_at, 'D MMM YYYY', 'YYYY-MM-DD') }}</td>
                <td class="text-end text-nowrap">
                    <span class="fw-medium">{{ formatCurrency(invoice.subTotal) }}</span>
                    <span v-if="getClientTotal(invoice.client_id) > 0" class="text-secondary">
                      / {{ formatCurrency(getClientTotal(invoice.client_id)) }}
                    </span>
                    <small class="d-block text-secondary" v-if="invoice.taxTotal">
                      {{ t('tax_amount', { amount: formatCurrency(invoice.taxTotal) }) }}
                    </small>
                </td>
                <td class="text-nowrap">
                    <span class="status-pill" :class="`status-pill--${invoice.status}`">{{ t(`statuses.${invoice.status}`) }}</span>
                    <span v-if="isOverDue(invoice)" class="status-pill status-pill--overdue ms-1">
                        <i class="material-icons-round md-14">schedule</i>{{ t('overdue') }}
                    </span>
                </td>
                <td class="text-end">
                    <button type="button"
                            class="btn-icon"
                            :title="t('duplicate')"
                            @click.stop="duplicateInvoice(invoice.id)">
                        <i class="material-icons-round md-18">content_copy</i>
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
        <slot v-else name="empty">
            <EmptyState icon="receipt_long"/>
        </slot>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import dayjs from 'dayjs/esm';
import EmptyState from '@/components/EmptyState.vue';
import { formatCurrency, formatDate, initials } from '@/utils/format';
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
    initials,
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
