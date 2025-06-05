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
                    <button class="btn btn-sm btn-outline-secondary mr-2"
                            @click="openCustomerRankingModal">
                      <i class="material-icons md-18 mr-1">leaderboard</i>
                      Customer Ranking
                    </button>
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

        <!-- Customer Ranking Modal -->
        <b-modal v-model="isCustomerRankingModalOpen"
                 centered
                 hide-footer
                 title="Customer Ranking by Invoiced Amounts"
                 size="lg"
                 content-class="bg-base dp--24">
            <div v-if="customerRanking.length > 0">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <small class="text-muted">Showing top customers by total invoiced amounts</small>
                    <small class="text-muted">{{ customerRanking.length }} customers</small>
                </div>
                <div class="list-group">
                    <div v-for="(customer, index) in customerRanking" 
                         :key="customer.name || 'Unknown'" 
                         class="list-group-item d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <div class="ranking-position mr-3">
                                <span class="badge badge-lg" 
                                      :class="getRankingBadgeClass(index)">
                                    {{ index + 1 }}
                                </span>
                            </div>
                            <div>
                                <div class="font-weight-bold">
                                    {{ customer.name || 'Unknown Customer' }}
                                </div>
                                <small class="text-muted">
                                    {{ customer.invoiceCount }} invoice{{ customer.invoiceCount !== 1 ? 's' : '' }}
                                </small>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-weight-bold text-primary">
                                {{ formatCurrency(customer.totalInvoiced.toFixed(0)) }}
                                <small class="text-muted ml-1">({{ customer.percentage.toFixed(1) }}%)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4">
                <i class="material-icons md-48 text-muted">people_outline</i>
                <p class="text-muted mt-2">No invoices found</p>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { BDropdown, BDropdownItem, BModal, VBTooltip } from 'bootstrap-vue';
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
    BModal,
  },
  directives: {
    'b-tooltip': VBTooltip,
  },
  data() {
    return {
      isCustomerRankingModalOpen: false,
    };
  },
  computed: {
    ...mapGetters({
      team: 'teams/team',
      invoices: 'invoices/all',
    }),
    isStorageLocal() {
      return config.storageType === 'local';
    },
    customerRanking() {
      const customerTotals = {};
      
      // Get all invoiced invoices (non-draft) and group by customer
      this.invoices
        .filter(invoice => invoice.status !== 'draft')
        .forEach(invoice => {
          const customerName = invoice.client_name || 'Unknown Customer';
          
          if (!customerTotals[customerName]) {
            customerTotals[customerName] = {
              name: customerName,
              totalInvoiced: 0,
              invoiceCount: 0,
            };
          }
          
          customerTotals[customerName].totalInvoiced += invoice.total || 0;
          customerTotals[customerName].invoiceCount++;
        });

      // Calculate total invoiced across all customers
      const totalInvoicedAllCustomers = Object.values(customerTotals)
        .reduce((sum, customer) => sum + customer.totalInvoiced, 0);

      // Convert to array, calculate percentages, and sort by total invoiced (descending)
      return Object.values(customerTotals)
        .map(customer => ({
          ...customer,
          percentage: totalInvoicedAllCustomers > 0 
            ? (customer.totalInvoiced / totalInvoicedAllCustomers * 100)
            : 0
        }))
        .sort((a, b) => b.totalInvoiced - a.totalInvoiced);
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
    openCustomerRankingModal() {
      this.isCustomerRankingModalOpen = true;
    },
    getRankingBadgeClass(index) {
      if (index === 0) return 'badge-warning'; // Gold
      if (index === 1) return 'badge-secondary'; // Silver
      if (index === 2) return 'badge-info'; // Bronze
      return 'badge-light';
    },
    getInvoiceTotals(status = 'all') {
      const filteredInvoices = status === 'all'
        ? this.invoices.filter(invoice => invoice.status !== 'draft' && invoice.status !== 'cancelled')
        : this.invoices.filter(invoice => invoice.status === status);

      const amount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(0);

      return { amount: this.formatCurrency(amount), count: filteredInvoices.length };
    },
    getMonthlyTotals() {
      const monthlyTotals = {};
      
      this.invoices
        .filter(invoice => invoice.status !== 'draft')
        .forEach(invoice => {
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

<style scoped>
.ranking-position .badge-lg {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}
</style>
