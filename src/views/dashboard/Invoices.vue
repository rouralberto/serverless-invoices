<template>
    <div>
        <div class="row">
            <div class="col-12 mb-4 pr-0 d-flex justify-content-between">
              <h4 class="mb-0">
                {{ $t('title') }}
                <span class="badge font-weight-light">
                  <span class="text-info" v-b-tooltip.hover title="Total Invoiced">
                    {{ formattedTotalMoney }} ({{ totalInvoices }})
                  </span>
                  <span class="text-secondary mx-2">|</span>
                  <span class="text-success" v-b-tooltip.hover title="Total Paid">
                    {{ formattedTotalMoneyPaid }} ({{ totalPaidInvoices }})
                  </span>
                  <span class="text-secondary mx-2">|</span>
                  <span class="text-danger" v-b-tooltip.hover title="Total Pending">
                    {{ formattedTotalMoneyPending }} ({{ totalPendingInvoices }})
                  </span>
                </span>
              </h4>
                <div>
                    <button class="btn btn-sm btn-outline-dark"
                            :class="{ 'mr-3': !isStorageLocal }"
                            @click="createNewInvoice">{{ $t('new_invoice') }}
                    </button>
                    <b-dropdown variant="link" size="sm" no-caret right v-if="isStorageLocal">
                        <template slot="button-content">
                            <i class="material-icons">more_vert</i>
                        </template>
                        <b-dropdown-item @click="exportJson">{{ $t('export') }}</b-dropdown-item>
                        <b-dropdown-item @click="openImportModal">{{ $t('import') }}</b-dropdown-item>
                    </b-dropdown>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <InvoicesList/>
            </div>
        </div>
    </div>
</template>

<script>
import { BDropdown, BDropdownItem, VBTooltip } from 'bootstrap-vue';
import { mapGetters } from 'vuex';
import InvoicesList from '@/components/invoices/InvoicesList';
import config from '@/config/app.config';

export default {
  name: 'invoices',
  i18nOptions: { namespaces: 'invoices' },
  components: {
    InvoicesList,
    BDropdown,
    BDropdownItem,
  },
  directives: {
    'b-tooltip': VBTooltip,
  },
  computed: {
    ...mapGetters({
      team: 'teams/team',
      invoices: 'invoices/all',
    }),
    isStorageLocal() {
      return config.storageType === 'local';
    },
    totalPendingInvoices() {
      return this.invoices.filter(invoice => invoice.status === 'sent').length;
    },
    totalPaidInvoices() {
      return this.invoices.filter(invoice => invoice.status === 'paid').length;
    },
    totalInvoices() {
      return this.invoices.length;
    },
    totalMoneyPending() {
      return this.invoices
        .filter(invoice => invoice.status === 'sent')
        .reduce((sum, invoice) => sum + invoice.total, 0).toFixed(0);
    },
    totalMoneyPaid() {
      return this.invoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.total, 0).toFixed(0);
    },
    totalMoney() {
      return this.invoices.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(0);
    },
    formattedTotalMoney() {
      return this.formatCurrency(this.totalMoney);
    },
    formattedTotalMoneyPending() {
      return this.formatCurrency(this.totalMoneyPending);
    },
    formattedTotalMoneyPaid() {
      return this.formatCurrency(this.totalMoneyPaid);
    },
  },
  methods: {
    createNewInvoice() {
      this.$store.dispatch('invoices/createNewInvoice')
        .then(id => this.$router.push({ name: 'invoice', params: { id } }));
    },
    exportJson() {
      this.$store.dispatch('data/exportJson');
    },
    openImportModal() {
      this.$store.commit('data/isImportModalOpen', true);
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
  },
};
</script>
