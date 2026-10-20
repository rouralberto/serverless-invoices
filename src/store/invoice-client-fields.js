import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import InvoiceClientField from '@/store/models/invoice-client-field';
import { useInvoicesStore } from '@/store/invoices';
import { updateRecord } from '@/store/orm';

const repo = () => useRepo(InvoiceClientField);

export const useInvoiceClientFieldsStore = defineStore('invoiceClientFields', {
  actions: {
    init() {},
    terminate() {},
    invoiceClientFieldProps(payload) {
      return updateRecord(repo(), payload.fieldId, payload.props);
    },
    updateInvoiceClientField(payload) {
      this.invoiceClientFieldProps(payload);
      return useInvoicesStore().updateInvoice({
        invoiceId: payload.invoiceId,
      });
    },
    removeInvoiceClientFields(invoiceId) {
      return repo().where('invoice_id', invoiceId).delete();
    },
    addInvoiceClientField(payload) {
      repo().save({
        ...payload.props,
        invoice_id: payload.invoiceId,
      });
    },
    removeInvoiceClientField(fieldId) {
      repo().destroy(fieldId);
    },
  },
});
