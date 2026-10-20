<template>
    <div class="row">
        <div class="col-12 scrollbar invoice-container">
            <div class="card bg-base dp--02 invoice-box" v-if="invoice">
                <div class="card-body">
                    <div class="row mb-5">
                        <TeamLogo class="col-4" :errors="errors"/>
                        <InvoiceHeader :invoice="invoice" :errors="errors" @update="updateProp"
                                       class="col-8 text-end mb-2"/>
                    </div>
                    <div class="row">
                        <InvoiceClientDetails :invoice="invoice" :errors="errors" @update="updateProp"
                                              class="col-6"/>
                        <InvoiceCompanyDetails :invoice="invoice" :errors="errors" @update="updateProp"
                                               class="col-6 text-end"/>
                    </div>
                    <div class="row mt-3">
                        <AppEditable :value="invoice.notes"
                                     class="col-12"
                                     :placeholder="t('insert_note')"
                                     @change="updateProp({ notes: $event })"/>
                    </div>
                    <div class="row">
                        <table class="table" :class="{'invoice__rows--compact': invoice.is_compact}">
                            <InvoiceRowsHeader :invoice="invoice"/>
                            <tbody>
                            <InvoiceRow v-for="(row, index) in invoice.rows" :errors="errors"
                                        :row="row" :index="index" :key="row.id"/>
                            <InvoiceAddRowBtn :invoice="invoice" :errors="errors"/>
                            </tbody>
                            <InvoiceTotals :invoice="invoice" :errors="errors" @update="updateProp"/>
                        </table>
                    </div>
                    <hr>
                    <div class="row ps-3 pe-3 justify-content-between">
                        <InvoiceBankDetails :invoice="invoice" :errors="errors" @update="updateProp"
                                            class="col-auto px-0"/>
                        <InvoiceContactDetails :invoice="invoice" :errors="errors" @update="updateProp"
                                               class="col-auto px-0 text-end"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import InvoiceRow from '@/components/invoices/InvoiceRow.vue';
import InvoiceClientDetails from '@/components/invoices/InvoiceClientDetails.vue';
import InvoiceCompanyDetails from '@/components/invoices/InvoiceCompanyDetails.vue';
import InvoiceBankDetails from '@/components/invoices/InvoiceBankDetails.vue';
import InvoiceContactDetails from '@/components/invoices/InvoiceContactDetails.vue';
import InvoiceHeader from '@/components/invoices/InvoiceHeader.vue';
import InvoiceTotals from '@/components/invoices/InvoiceTotals.vue';
import AppEditable from '@/components/form/AppEditable.vue';
import TeamLogo from '@/components/team/TeamLogo.vue';
import InvoiceRowsHeader from '@/components/invoices/InvoiceRowsHeader.vue';
import InvoiceAddRowBtn from '@/components/invoices/InvoiceAddRowBtn.vue';
import { useInvoicesStore } from '@/store/invoices';

export default {
  setup() {
    return useTranslation('invoice-form');
  },
  components: {
    InvoiceAddRowBtn,
    TeamLogo,
    InvoiceTotals,
    InvoiceHeader,
    InvoiceContactDetails,
    InvoiceBankDetails,
    InvoiceCompanyDetails,
    InvoiceRow,
    InvoiceRowsHeader,
    InvoiceClientDetails,
    AppEditable,
  },
  computed: {
    ...mapStores(useInvoicesStore),
    ...mapState(useInvoicesStore, ['errors', 'invoice']),
  },
  watch: {
    '$route.params.id'() {
      this.getInvoice();
    },
  },
  created() {
    this.getInvoice();
  },
  methods: {
    getInvoice() {
      this.invoicesStore.getInvoice(this.$route.params.id);
    },
    updateProp(props) {
      this.invoicesStore.updateInvoice({
        props,
        invoiceId: this.invoice.id,
      });
    },
  },
};
</script>
