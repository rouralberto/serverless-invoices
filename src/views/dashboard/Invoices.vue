<template>
    <div>
        <div class="row">
            <div class="col-12 mb-4 pe-0 d-flex justify-content-between">
              <h4 class="mb-0">
                {{ t('title') }}
                <span class="badge fw-light">
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
                    <button class="btn btn-sm btn-outline-secondary me-2"
                            @click="openCustomerRankingModal">
                      <i class="material-icons md-18 me-1">leaderboard</i>
                      Customer Ranking
                    </button>
                    <button class="btn btn-sm btn-outline-dark"
                            @click="createNewInvoice">{{ t('new_invoice') }}
                    </button>
                    <BDropdown variant="link" size="sm" no-caret placement="bottom-end">
                        <template #button-content>
                            <i class="material-icons">more_vert</i>
                        </template>

                        <BDropdownItem @click="openClientsListModal">{{ t('manage_customers') }}</BDropdownItem>

                        <template v-if="isStorageLocal">
                        <BDropdownDivider divider-class="my-3"/>

                        <li class="dropdown-item-text px-3 pb-3">
                            <label class="form-label mb-2 text-muted small">Financial Year Start</label>
                            <select
                                v-model="selectedFyStartMonth"
                                class="form-select form-select-sm"
                                @change="onFyStartMonthChange">
                                <option v-for="month in monthOptions"
                                        :key="month.value"
                                        :value="month.value">
                                    {{ month.text }}
                                </option>
                            </select>
                        </li>

                        <li class="dropdown-item-text px-3">
                            <div class="form-check">
                                <input type="checkbox"
                                       class="form-check-input"
                                       id="hidePaidInvoicesCheckbox"
                                       v-model="hidePaidInvoices"
                                       @change="onHidePaidInvoicesChange">
                                <label class="form-check-label text-muted small" for="hidePaidInvoicesCheckbox">
                                    {{ t('hide_paid_invoices') }}
                                </label>
                            </div>
                        </li>

                        <li class="dropdown-item-text px-3">
                            <div class="form-check">
                                <input type="checkbox"
                                       class="form-check-input"
                                       id="showFySummaryCheckbox"
                                       v-model="showFySummary"
                                       @change="onShowFySummaryChange">
                                <label class="form-check-label text-muted small" for="showFySummaryCheckbox">
                                    {{ t('show_fy_summary') }}
                                </label>
                            </div>
                        </li>

                        <BDropdownDivider divider-class="my-3"/>

                        <BDropdownItem @click="exportJson">{{ t('export') }}</BDropdownItem>
                        <BDropdownItem @click="openImportModal">{{ t('import') }}</BDropdownItem>
                        <li role="presentation"><span class="dropdown-item">—</span></li>
                        <BDropdownItem @click="saveJson">Save in S3</BDropdownItem>
                        </template>
                    </BDropdown>
                </div>
            </div>
        </div>
        <div class="row mb-4" v-if="showFySummary">
            <div class="col-12">
                <div class="border rounded p-3">
                    <div class="d-flex flex-wrap">
                        <div v-for="fyData in getFinancialYearTotals()" :key="fyData.label" class="me-4 mb-3">
                            <div class="mb-2">
                                <small class="text-muted d-block">{{ fyData.label }}</small>
                                <div class="fw-bold text-primary">{{ fyData.total }}</div>
                            </div>
                            <div class="ms-2">
                                <div v-for="month in fyData.months" :key="month.label" class="mb-1">
                                    <small class="text-muted">{{ month.label }}: </small>
                                    <small class="font-weight-medium">{{ month.amount }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-12">
                <div class="d-flex align-items-center">
                    <div class="input-group search-input-group flex-grow-1">
                        <span class="input-group-text search-icon">
                            <i class="material-icons md-18">search</i>
                        </span>
                        <input type="text"
                               class="form-control search-input"
                               v-model="searchQuery"
                               :placeholder="t('search_client_placeholder')">
                        <button v-if="searchQuery"
                                class="btn search-clear-btn"
                                type="button"
                                @click="searchQuery = ''">
                            <i class="material-icons md-18">close</i>
                        </button>
                    </div>
                    <div class="search-results-summary ms-3" v-if="searchQuery">
                        <span class="text-muted small">
                            {{ filteredInvoices.length }} {{ filteredInvoices.length === 1 ? 'invoice' : 'invoices' }}
                            <span class="mx-1">·</span>
                            <span class="font-weight-medium">{{ formatCurrency(filteredInvoicesTotal) }}</span>
                        </span>
                    </div>
                    <button v-if="searchQuery && filteredInvoices.length"
                            class="btn btn-outline-secondary btn-sm ms-2 d-flex align-items-center"
                            type="button"
                            @click="copyFilteredInvoices">
                        <i class="material-icons md-18 me-1">{{ copyIcon }}</i>
                    </button>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <InvoicesList :invoices="filteredInvoices"/>
            </div>
        </div>

        <!-- Manage Customers Modal -->
        <BModal v-model="isClientsListModalOpen"
                 centered
                 no-footer
                 :title="t('manage_customers')"
                 size="lg"
                 content-class="bg-base dp--24">
            <ClientsList/>
        </BModal>

        <!-- Customer Ranking Modal -->
        <BModal v-model="isCustomerRankingModalOpen"
                 centered
                 no-footer
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
                            <div class="ranking-position me-3">
                                <span class="badge badge-lg"
                                      :class="getRankingBadgeClass(index)">
                                    {{ index + 1 }}
                                </span>
                            </div>
                            <div>
                                <div class="fw-bold">
                                    {{ customer.name || 'Unknown Customer' }}
                                </div>
                                <small class="text-muted">
                                    {{ customer.invoiceCount }} invoice{{ customer.invoiceCount !== 1 ? 's' : '' }}
                                </small>
                            </div>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold text-primary">
                                {{ formatCurrency(customer.totalInvoiced.toFixed(0)) }}
                                <small class="text-muted ms-1">({{ customer.percentage.toFixed(1) }}%)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4">
                <i class="material-icons md-48 text-muted">people_outline</i>
                <p class="text-muted mt-2">No invoices found</p>
            </div>
        </BModal>
    </div>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import {
  BDropdown, BDropdownDivider, BDropdownItem, BModal, vBTooltip,
} from 'bootstrap-vue-next';
import { useTranslation } from 'i18next-vue';
import InvoicesList from '@/components/invoices/InvoicesList.vue';
import ClientsList from '@/components/clients/ClientsList.vue';
import config from '@/config/app.config';
import { useDataStore } from '@/store/data';
import { useInvoicesStore } from '@/store/invoices';
import { useTeamsStore } from '@/store/teams';

export default {
  name: 'invoices',
  setup() {
    return useTranslation('invoices');
  },
  components: {
    InvoicesList,
    ClientsList,
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    BModal,
  },
  directives: {
    'b-tooltip': vBTooltip,
  },
  data() {
    return {
      isClientsListModalOpen: false,
      isCustomerRankingModalOpen: false,
      selectedFyStartMonth: this.loadFyStartMonth(),
      hidePaidInvoices: this.loadHidePaidInvoices(),
      showFySummary: this.loadShowFySummary(),
      searchQuery: '',
      copiedToClipboard: false,
      monthOptions: [
        { value: 1, text: 'January' },
        { value: 2, text: 'February' },
        { value: 3, text: 'March' },
        { value: 4, text: 'April' },
        { value: 5, text: 'May' },
        { value: 6, text: 'June' },
        { value: 7, text: 'July' },
        { value: 8, text: 'August' },
        { value: 9, text: 'September' },
        { value: 10, text: 'October' },
        { value: 11, text: 'November' },
        { value: 12, text: 'December' },
      ],
    };
  },
  computed: {
    ...mapStores(useInvoicesStore, useDataStore),
    ...mapState(useTeamsStore, ['team']),
    ...mapState(useInvoicesStore, { invoices: 'all' }),
    isStorageLocal() {
      return config.storageType === 'local';
    },
    filteredInvoices() {
      let result = this.invoices;

      // Filter by paid status if enabled
      if (this.hidePaidInvoices) {
        result = result.filter(invoice => invoice.status !== 'paid' && invoice.status !== 'written_off');
      }

      // Filter by search query (client name)
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        result = result.filter(invoice => {
          const clientName = invoice.client_name || '';
          const companyName = (invoice.client && invoice.client.company_name) || '';
          return clientName.toLowerCase().includes(query)
            || companyName.toLowerCase().includes(query);
        });
      }

      return result;
    },
    filteredInvoicesTotal() {
      return this.filteredInvoices
        .filter(invoice => invoice.status !== 'draft' && invoice.status !== 'cancelled' && invoice.status !== 'written_off')
        .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    },
    customerRanking() {
      const customerTotals = {};

      // Get all invoiced invoices (non-draft, non-cancelled, non-written-off) and group by customer
      this.invoices
        .filter(invoice => invoice.status !== 'draft' && invoice.status !== 'cancelled' && invoice.status !== 'written_off')
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
    copyIcon() {
      return this.copiedToClipboard ? 'check' : 'content_copy';
    },
  },
  methods: {
    copyFilteredInvoices() {
      const data = this.filteredInvoices.map(invoice => ({
        number: invoice.number,
        client_name: invoice.client_name || (invoice.client && invoice.client.company_name) || '',
        issued_at: invoice.issued_at,
        amount: invoice.total,
        status: invoice.status,
        lines: (invoice.rows || []).map(row => ({
          item: row.item,
          quantity: row.quantity,
          unit: row.unit,
          price: row.price,
          gst: row.taxes ? row.taxes.reduce((sum, t) => sum + (row.quantity * row.price * t.value / 100), 0) : 0,
          sum: row.quantity * row.price + (row.taxes ? row.taxes.reduce((s, t) => s + (row.quantity * row.price * t.value / 100), 0) : 0),
        })),
      }));
      const text = JSON.stringify(data, null, 2);
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.copiedToClipboard = true;
      setTimeout(() => { this.copiedToClipboard = false; }, 2000);
    },
    createNewInvoice() {
      this.invoicesStore.createNewInvoice()
        .then(id => this.$router.push({ name: 'invoice', params: { id } }));
    },
    exportJson() {
      this.dataStore.exportJson();
    },
    saveJson() {
      this.dataStore.saveJson();
    },
    openImportModal() {
      this.dataStore.isImportModalOpen = true;
    },
    openClientsListModal() {
      this.isClientsListModalOpen = true;
    },
    openCustomerRankingModal() {
      this.isCustomerRankingModalOpen = true;
    },
    getRankingBadgeClass(index) {
      if (index === 0) return 'text-bg-warning'; // Gold
      if (index === 1) return 'text-bg-secondary'; // Silver
      if (index === 2) return 'text-bg-info'; // Bronze
      return 'text-bg-light';
    },
    getInvoiceTotals(status = 'all') {
      const filteredInvoices = status === 'all'
        ? this.invoices.filter(invoice => invoice.status !== 'draft' && invoice.status !== 'cancelled' && invoice.status !== 'written_off')
        : this.invoices.filter(invoice => invoice.status === status);

      const amount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(0);

      return { amount: this.formatCurrency(amount), count: filteredInvoices.length };
    },
    getFinancialYearTotals() {
      const fyData = {};

      this.invoices
        .filter(invoice => invoice.status !== 'draft' && invoice.status !== 'written_off')
        .forEach(invoice => {
          if (!invoice.issued_at) return;

          const date = new Date(invoice.issued_at);
          const month = date.getMonth() + 1; // 1-12
          const year = date.getFullYear();

          // Calculate financial year based on selected start month
          let fyStart, fyEnd;
          if (month >= this.selectedFyStartMonth) {
            fyStart = year;
            fyEnd = year + 1;
          } else {
            fyStart = year - 1;
            fyEnd = year;
          }

          // If January is selected as FY start, show natural calendar year
          const fyLabel = this.selectedFyStartMonth === 1
            ? fyStart.toString()
            : `FY ${fyStart}-${fyEnd.toString().slice(-2)}`;
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

          if (!fyData[fyLabel]) {
            fyData[fyLabel] = {
              total: 0,
              months: {}
            };
          }

          if (!fyData[fyLabel].months[monthYear]) {
            fyData[fyLabel].months[monthYear] = {
              amount: 0,
              sortKey: date.getTime()
            };
          }

          fyData[fyLabel].total += invoice.total;
          fyData[fyLabel].months[monthYear].amount += invoice.total;
        });

      // Convert to array format and sort
      return Object.keys(fyData)
        .sort((a, b) => {
          // Extract year for sorting, handling both "2024" and "FY 24-25" formats
          let yearA, yearB;

          if (a.startsWith('FY ')) {
            yearA = parseInt(a.split(' ')[1].split('-')[0]);
          } else {
            yearA = parseInt(a);
          }

          if (b.startsWith('FY ')) {
            yearB = parseInt(b.split(' ')[1].split('-')[0]);
          } else {
            yearB = parseInt(b);
          }

          return yearB - yearA; // Most recent first
        })
        .map(fyLabel => ({
          label: fyLabel,
          total: this.formatCurrency(fyData[fyLabel].total.toFixed(0)),
          months: Object.keys(fyData[fyLabel].months)
            .sort((a, b) => fyData[fyLabel].months[a].sortKey - fyData[fyLabel].months[b].sortKey)
            .map(monthLabel => ({
              label: monthLabel,
              amount: this.formatCurrency(fyData[fyLabel].months[monthLabel].amount.toFixed(0))
            }))
        }));
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
    loadFyStartMonth() {
      // Load the saved financial year start month from localStorage
      // Default to July (7) if no preference is saved (Australian FY)
      const saved = localStorage.getItem('fyStartMonth');
      return saved ? parseInt(saved, 10) : 7;
    },
    saveFyStartMonth(month) {
      // Save the financial year start month preference to localStorage
      localStorage.setItem('fyStartMonth', month.toString());
    },
    onFyStartMonthChange() {
      // Save the preference when user changes the selection
      this.saveFyStartMonth(this.selectedFyStartMonth);
      // The reactive system will automatically update the financial year totals
      // when selectedFyStartMonth changes since getFinancialYearTotals() depends on it
    },
    loadHidePaidInvoices() {
      // Load the saved hide paid invoices preference from localStorage
      // Default to false if no preference is saved
      const saved = localStorage.getItem('hidePaidInvoices');
      return saved ? JSON.parse(saved) : false;
    },
    saveHidePaidInvoices(hide) {
      // Save the hide paid invoices preference to localStorage
      localStorage.setItem('hidePaidInvoices', JSON.stringify(hide));
    },
    onHidePaidInvoicesChange() {
      // Save the preference when user changes the selection
      this.saveHidePaidInvoices(this.hidePaidInvoices);
    },
    loadShowFySummary() {
      // Load the saved show FY summary preference from localStorage
      // Default to true if no preference is saved (show by default)
      const saved = localStorage.getItem('showFySummary');
      return saved ? JSON.parse(saved) : true;
    },
    saveShowFySummary(show) {
      // Save the show FY summary preference to localStorage
      localStorage.setItem('showFySummary', JSON.stringify(show));
    },
    onShowFySummaryChange() {
      // Save the preference when user changes the selection
      this.saveShowFySummary(this.showFySummary);
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

.dropdown-item-text {
  min-width: 200px;
}

.dropdown-item-text .form-control-sm {
  font-size: 0.875rem;
}

/* Search input styles with dark mode support */
.search-input-group {
  width: 100%;
}

.search-input-group .search-icon {
  background-color: var(--bg-primary);
  border: 1px solid var(--text-caption);
  border-right: none;
  color: var(--text-secondary);
}

.search-input-group .search-input {
  background-color: var(--bg-primary);
  border: 1px solid var(--text-caption);
  border-left: none;
  color: var(--text-primary);
}

.search-input-group .search-input::placeholder {
  color: var(--text-disabled);
}

.search-input-group .search-input:focus,
.search-input-group .search-input:hover {
  background-color: var(--bg-primary);
  border-color: var(--text-secondary);
  box-shadow: none;
}

.search-input-group:hover .search-icon,
.search-input-group:focus-within .search-icon,
.search-input-group .search-input:focus + .search-clear-btn,
.search-input-group .search-input:hover + .search-clear-btn {
  border-color: var(--text-secondary);
}

.search-input-group .search-clear-btn {
  background-color: var(--bg-primary);
  border: 1px solid var(--text-caption);
  border-left: none;
  color: var(--text-secondary);
}

.search-input-group .search-clear-btn:hover {
  background-color: var(--shade);
  color: var(--text-primary);
}

.search-results-summary {
  white-space: nowrap;
}
</style>
