import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import InvoiceTeamField from '@/store/models/invoice-team-field';
import { useInvoicesStore } from '@/store/invoices';
import { updateRecord } from '@/store/orm';

const repo = () => useRepo(InvoiceTeamField);

export const useInvoiceTeamFieldsStore = defineStore('invoiceTeamFields', {
  actions: {
    init() {},
    terminate() {},
    invoiceTeamFieldProps(payload) {
      return updateRecord(repo(), payload.fieldId, payload.props);
    },
    updateInvoiceTeamField(payload) {
      this.invoiceTeamFieldProps(payload);
      return useInvoicesStore().updateInvoice({
        invoiceId: payload.invoiceId,
      });
    },
    addInvoiceTeamField(payload) {
      repo().save({
        ...payload.props,
        invoice_id: payload.invoiceId,
      });
    },
    removeInvoiceTeamFields(invoiceId) {
      return repo().where('invoice_id', invoiceId).delete();
    },
    removeInvoiceTeamField(fieldId) {
      return repo().destroy(fieldId);
    },
  },
});
