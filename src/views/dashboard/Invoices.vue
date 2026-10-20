<template>
    <div>
        <div class="page-header">
            <div>
                <h1 class="page-header__title">{{ t('title') }}</h1>
                <p class="page-header__subtitle">{{ t('invoice_count', { count: invoices.length }) }}</p>
            </div>
            <div class="page-header__actions">
                <button class="btn btn-outline-secondary" @click="openCustomerRankingModal">
                    <i class="material-icons-round md-18">leaderboard</i>
                    {{ t('customer_ranking') }}
                </button>
                <button class="btn btn-primary" @click="createNewInvoice">
                    <i class="material-icons-round md-18">add</i>
                    {{ t('new_invoice') }}
                </button>
            </div>
        </div>

        <div class="kpi-grid">
            <div v-for="kpi in kpis" :key="kpi.key" class="kpi surface" :class="`kpi--${kpi.tone}`">
                <span class="kpi__icon"><i class="material-icons-round">{{ kpi.icon }}</i></span>
                <div>
                    <div class="kpi__label">{{ t(kpi.key) }}</div>
                    <div class="kpi__value">{{ kpi.amount }}</div>
                    <div class="kpi__meta">{{ t('invoice_count', { count: kpi.count }) }}</div>
                </div>
            </div>
        </div>

        <div class="surface fy-summary" v-if="showFySummary">
            <div class="surface__header">
                <h2 class="surface__title">{{ t('fy_summary') }}</h2>
                <div class="d-flex align-items-center gap-2">
                    <label class="text-secondary small text-nowrap mb-0" for="fyStartMonth">{{ t('fy_start') }}</label>
                    <select id="fyStartMonth"
                            v-model="selectedFyStartMonth"
                            class="form-select form-select-sm"
                            @change="onFyStartMonthChange">
                        <option v-for="month in monthOptions" :key="month.value" :value="month.value">{{ month.text }}</option>
                    </select>
                    <button type="button" class="btn-icon" :title="t('hide')" @click="setShowFySummary(false)">
                        <i class="material-icons-round md-18">close</i>
                    </button>
                </div>
            </div>
            <div class="fy-summary__years">
                <div v-for="fyData in financialYearTotals" :key="fyData.label" class="fy-summary__year">
                    <div class="fy-summary__label">{{ fyData.label }}</div>
                    <div class="fy-summary__total">{{ fyData.total }}</div>
                    <div v-for="month in fyData.months" :key="month.label" class="fy-bar">
                        <span class="fy-bar__label">{{ month.label }}</span>
                        <span class="fy-bar__track"><span class="fy-bar__fill" :style="{ width: `${month.share}%` }"></span></span>
                        <span class="fy-bar__amount">{{ month.amount }}</span>
                    </div>
                </div>
                <p v-if="financialYearTotals.length === 0" class="text-secondary small mb-0">{{ t('no_invoices') }}</p>
            </div>
        </div>

        <div class="surface">
            <div class="surface__toolbar">
                <label class="search-field">
                    <i class="material-icons-round md-18">search</i>
                    <input type="search"
                           class="form-control"
                           v-model="searchQuery"
                           :placeholder="t('search_client_placeholder')">
                </label>
                <div class="form-check form-switch mb-0">
                    <input type="checkbox"
                           class="form-check-input"
                           role="switch"
                           id="hidePaidInvoicesCheckbox"
                           v-model="hidePaidInvoices"
                           @change="onHidePaidInvoicesChange">
                    <label class="form-check-label small" for="hidePaidInvoicesCheckbox">{{ t('hide_paid_invoices') }}</label>
                </div>
                <button v-if="!showFySummary" type="button" class="btn btn-sm btn-link" @click="setShowFySummary(true)">
                    <i class="material-icons-round md-16">insights</i>
                    {{ t('show_fy_summary') }}
                </button>
                <div class="search-results-summary ms-auto" v-if="searchQuery">
                    <span class="text-secondary small">
                        {{ t('invoice_count', { count: filteredInvoices.length }) }}
                        <span class="mx-1">·</span>
                        <span class="fw-medium">{{ formatCurrency(filteredInvoicesTotal) }}</span>
                    </span>
                    <button v-if="filteredInvoices.length"
                            class="btn-icon"
                            type="button"
                            @click="copyFilteredInvoices">
                        <i class="material-icons-round md-18">{{ copyIcon }}</i>
                    </button>
                </div>
            </div>
            <InvoicesList :invoices="filteredInvoices">
                <template #empty>
                    <EmptyState v-if="invoices.length === 0" icon="receipt_long" :content="t('no_invoices_yet')">
                        <button type="button" class="btn btn-primary" @click="createNewInvoice">
                            <i class="material-icons-round md-18">add</i>
                            {{ t('create_first_invoice') }}
                        </button>
                    </EmptyState>
                    <EmptyState v-else icon="search_off"/>
                </template>
            </InvoicesList>
        </div>

        <!-- Customer Ranking Modal -->
        <AppModal v-model="isCustomerRankingModalOpen"
                  centered
                  :title="t('ranking_title')"
                  size="lg"
                  content-class="bg-base dp--24">
            <div v-if="customerRanking.length > 0">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <small class="text-muted">{{ t('ranking_subtitle') }}</small>
                    <small class="text-muted">{{ t('customer_count', { count: customerRanking.length }) }}</small>
                </div>
                <div class="list-group">
                    <div v-for="(customer, index) in customerRanking"
                         :key="customer.name"
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
                                    {{ customer.name || t('unknown_customer') }}
                                </div>
                                <small class="text-muted">
                                    {{ t('invoice_count', { count: customer.invoiceCount }) }}
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
                <p class="text-muted mt-2">{{ t('no_invoices') }}</p>
            </div>
        </AppModal>
    </div>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import InvoicesList from '@/components/invoices/InvoicesList.vue';
import EmptyState from '@/components/EmptyState.vue';
import AppModal from '@/components/ui/AppModal.vue';
import { intlLocale } from '@/config/i18n.config';
import { useLanguageStore } from '@/store/language';
import { useInvoicesStore } from '@/store/invoices';
import { useTeamsStore } from '@/store/teams';

export default {
  name: 'invoices',
  setup() {
    return useTranslation('invoices');
  },
  components: {
    InvoicesList,
    EmptyState,
    AppModal,
  },
  data() {
    return {
      isCustomerRankingModalOpen: false,
      selectedFyStartMonth: this.loadFyStartMonth(),
      hidePaidInvoices: this.loadHidePaidInvoices(),
      showFySummary: this.loadShowFySummary(),
      searchQuery: '',
      copiedToClipboard: false,
    };
  },
  computed: {
    ...mapStores(useInvoicesStore),
    ...mapState(useTeamsStore, ['team']),
    ...mapState(useInvoicesStore, { invoices: 'all' }),
    ...mapState(useLanguageStore, { languageCode: 'code' }),
    locale() {
      return intlLocale(this.languageCode);
    },
    monthOptions() {
      const format = new Intl.DateTimeFormat(this.locale, { month: 'long' });
      return Array.from({ length: 12 }, (_, index) => ({
        value: index + 1,
        text: format.format(new Date(2000, index, 1)),
      }));
    },
    kpis() {
      return [
        { key: 'total_invoiced', icon: 'receipt_long', tone: 'primary', ...this.getInvoiceTotals() },
        { key: 'total_paid', icon: 'payments', tone: 'success', ...this.getInvoiceTotals('paid') },
        { key: 'total_booked', icon: 'bookmark_added', tone: 'info', ...this.getInvoiceTotals('booked') },
        { key: 'total_pending', icon: 'schedule', tone: 'danger', ...this.getInvoiceTotals('sent') },
      ];
    },
    financialYearTotals() {
      return this.getFinancialYearTotals();
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
          // Invoices without a client are grouped under '' and shown as "Unknown Customer".
          const customerName = invoice.client_name || '';

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
      this.invoicesStore.createInvoice()
        .then(id => this.$router.push({ name: 'invoice', params: { id } }));
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
            : this.t('financial_year', { start: fyStart, end: fyEnd.toString().slice(-2) });
          const monthYear = date.toLocaleString(this.locale, { month: 'short', year: 'numeric' });

          if (!fyData[fyLabel]) {
            fyData[fyLabel] = {
              fyStart,
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
        .sort((a, b) => fyData[b].fyStart - fyData[a].fyStart) // Most recent first
        .map((fyLabel) => {
          const { months } = fyData[fyLabel];
          const largest = Math.max(...Object.values(months).map(month => month.amount), 1);
          return {
            label: fyLabel,
            total: this.formatCurrency(fyData[fyLabel].total.toFixed(0)),
            months: Object.keys(months)
              .sort((a, b) => months[a].sortKey - months[b].sortKey)
              .map(monthLabel => ({
                label: monthLabel,
                amount: this.formatCurrency(months[monthLabel].amount.toFixed(0)),
                share: Math.max(0, (months[monthLabel].amount / largest) * 100),
              })),
          };
        });
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
    setShowFySummary(show) {
      this.showFySummary = show;
      this.saveShowFySummary(show);
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
