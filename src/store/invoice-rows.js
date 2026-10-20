import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import InvoiceRow from '@/store/models/invoice-row';
import InvoiceRowTax from '@/store/models/invoice-row-tax';
import { useInvoicesStore } from '@/store/invoices';
import { useTaxesStore } from '@/store/taxes';
import { updateRecord } from '@/store/orm';

const repo = () => useRepo(InvoiceRow);
const taxRepo = () => useRepo(InvoiceRowTax);

function addTaxes(taxes, row) {
  taxRepo().save(taxes.map(tax => ({
    label: tax.label,
    value: tax.value,
    row_id: row.id,
  })));
}

export const useInvoiceRowsStore = defineStore('invoiceRows', {
  actions: {
    init() {
    },
    terminate() {
    },
    invoiceRowProps(payload) {
      return updateRecord(repo(), payload.id, payload.props);
    },
    updateInvoiceRow(payload) {
      this.invoiceRowProps(payload);
      return useInvoicesStore().updateInvoice({
        invoiceId: payload.invoiceId,
      });
    },
    addRow(invoiceId) {
      const invoice = useInvoicesStore().invoice;
      const rowCount = repo().where('invoice_id', invoiceId).get().length;
      const row = repo().save({
        invoice_id: invoiceId,
        order: rowCount,
      });

      let client = null;
      if (invoice && invoice.client) {
        client = invoice.client;
      }

      if ((client && client.has_tax) || !client) {
        const taxes = this.taxes.length > 0
          ? this.taxes
          : useTaxesStore().allWithLabels;
        addTaxes(taxes, row);
      }

      return row.id;
    },
    overwriteTaxes() {
      const taxes = useTaxesStore().allWithLabels;
      const rows = repo()
        .where('invoice_id', useInvoicesStore().invoiceId)
        .get();

      rows.forEach((row) => {
        taxRepo().where('row_id', row.id).delete();
        addTaxes(taxes, row);
      });
    },
    removeRow(rowId) {
      repo().destroy(rowId);
    },
    updateInvoiceRowTax(payload) {
      updateRecord(taxRepo(), payload.taxId, payload.props);
      return useInvoicesStore().updateInvoice({
        invoiceId: payload.invoiceId,
      });
    },
  },
  getters: {
    taxes() {
      const invoice = useInvoicesStore().invoice;

      if (!invoice || !Array.isArray(invoice.rows)) {
        return [];
      }

      const taxesByLabel = new Map();
      invoice.rows
        .flatMap(row => row.taxes)
        .filter(tax => !!tax.label && !taxesByLabel.has(tax.label))
        .forEach(tax => taxesByLabel.set(tax.label, tax));
      return [...taxesByLabel.values()];
    },
  },
});
