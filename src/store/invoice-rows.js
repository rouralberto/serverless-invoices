import InvoiceRow from '@/store/models/invoice-row';
import InvoiceRowTax from '@/store/models/invoice-row-tax';
import { flatten, uniqBy } from 'lodash';

function addTaxes(taxes, row) {
  taxes.forEach((tax) => {
    const rowTax = new InvoiceRowTax();
    rowTax.label = tax.label;
    rowTax.value = tax.value;
    rowTax.row_id = row.id;
    rowTax.$save();
  });
}

export default {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    init() {
    },
    terminate() {
    },
    invoiceRowProps(store, payload) {
      return InvoiceRow.update({
        where: payload.id,
        data: payload.props,
      });
    },
    async updateInvoiceRow({ dispatch }, payload) {
      await dispatch('invoiceRowProps', payload);
      return dispatch('invoices/updateInvoice', {
        invoiceId: payload.invoiceId,
      }, { root: true });
    },
    async addRow({ getters, rootGetters }, invoiceId) {
      const invoice = rootGetters['invoices/invoice'];
      const row = await InvoiceRow.createNew();
      const rowCount = InvoiceRow.query().where('invoice_id', invoiceId).count();
      await row.$update({
        invoice_id: invoiceId,
        order: rowCount,
      });

      let client = null;
      if (invoice && invoice.hasOwnProperty('client')) {
        client = invoice.client;
      }

      if ((client && client.has_tax) || !client) {
        const taxes = getters.taxes.length > 0
          ? getters.taxes
          : rootGetters['taxes/allWithLabels'];
        addTaxes(taxes, row);
      }

      return row.id;
    },
    overwriteTaxes({ rootGetters, rootState }) {
      const taxes = rootGetters['taxes/allWithLabels'];
      const rows = InvoiceRow.query()
        .where('invoice_id', rootState.invoices.invoiceId)
        .get();

      rows.forEach((row) => {
        InvoiceRowTax.delete(tax => tax.row_id === row.id)
          .then(() => addTaxes(taxes, row));
      });
    },
    async removeRow(store, rowId) {
      await InvoiceRow.delete(rowId);
    },
    async updateInvoiceRowTax({ dispatch }, payload) {
      await InvoiceRowTax.update({
        where: payload.taxId,
        data: payload.props,
      });
      return dispatch('invoices/updateInvoice', {
        invoiceId: payload.invoiceId,
      }, { root: true });
    },
  },
  getters: {
    taxes(state, getters, rootState, rootGetters) {
      const invoice = rootGetters['invoices/invoice'];

      if (!invoice || !Array.isArray(invoice.rows)) {
        return [];
      }

      let taxes = invoice.rows.map(row => row.taxes);
      taxes = flatten(taxes);
      taxes = uniqBy(taxes, 'label');
      taxes = taxes.filter(tax => !!tax.label);
      return taxes;
    },
  },
};
