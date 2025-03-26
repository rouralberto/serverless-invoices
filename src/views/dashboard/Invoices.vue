<template>
    <div>
        <div class="row">
            <div class="col-12 mb-4 pr-0 d-flex justify-content-between">
              <h4 class="mb-0">
                {{ $t('title') }}
                <span class="badge font-weight-light">
                  <span class="text-primary" v-b-tooltip.hover title="Total Invoiced">
                    {{ getInvoiceTotals().amount }} ({{ getInvoiceTotals().count }})
                  </span>
                  <span class="text-secondary mx-2">|</span>
                  <span class="text-success" v-b-tooltip.hover title="Total Paid">
                    {{ getInvoiceTotals('paid').amount }} ({{ getInvoiceTotals('paid').count }})
                  </span>
                  <span class="text-secondary mx-2">|</span>
                  <span class="text-info" v-b-tooltip.hover title="Total Booked">
                    {{ getInvoiceTotals('booked').amount }} ({{ getInvoiceTotals('booked').count }})
                  </span>
                  <span class="text-secondary mx-2">|</span>
                  <span class="text-danger" v-b-tooltip.hover title="Total Pending">
                    {{ getInvoiceTotals('sent').amount }} ({{ getInvoiceTotals('sent').count }})
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
                        <li role="presentation"><span class="dropdown-item">—</span></li>
                        <b-dropdown-item @click="saveJson">Save in S3</b-dropdown-item>
                    </b-dropdown>
                </div>
            </div>
        </div>
        <div class="row mb-4">
            <div class="col-12">
                <div class="border rounded p-3">
                    <div class="d-flex flex-wrap">
                        <div v-for="(amount, month) in getMonthlyTotals()" :key="month" class="mr-4 mb-2">
                            <small class="text-muted d-block">{{ month }}</small>
                            <div class="font-weight-bold">{{ amount }}</div>
                        </div>
                    </div>
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
  },
  methods: {
    createNewInvoice() {
      this.$store.dispatch('invoices/createNewInvoice')
        .then(id => this.$router.push({ name: 'invoice', params: { id } }));
    },
    exportJson() {
      this.$store.dispatch('data/exportJson');
    },
    saveJson() {
      this.$store.dispatch('data/saveJson');
    },
    openImportModal() {
      this.$store.commit('data/isImportModalOpen', true);
    },
    getInvoiceTotals(status = 'all') {
      const filteredInvoices = status === 'all'
        ? this.invoices
        : this.invoices.filter(invoice => invoice.status === status);

      const amount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(0);

      return { amount: this.formatCurrency(amount), count: filteredInvoices.length };
    },
    getMonthlyTotals() {
      const monthlyTotals = {};
      
      this.invoices.forEach(invoice => {
        if (!invoice.issued_at) return;
        
        const date = new Date(invoice.issued_at);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthlyTotals[monthYear]) {
          monthlyTotals[monthYear] = 0;
        }
        
        monthlyTotals[monthYear] += invoice.total;
      });

      // Convert amounts to formatted currency
      Object.keys(monthlyTotals).forEach(month => {
        monthlyTotals[month] = this.formatCurrency(monthlyTotals[month].toFixed(0));
      });

      return monthlyTotals;
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
