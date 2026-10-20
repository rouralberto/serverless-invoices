import { defineStore } from 'pinia';
import dayjs from 'dayjs/esm';
import * as db from '@/services/db';
import { useBankAccountsStore } from '@/store/bank-accounts';
import { useClientsStore } from '@/store/clients';
import { useTaxesStore } from '@/store/taxes';
import { useTeamsStore } from '@/store/teams';
import {
  generateInvoiceNumber, toStorable, uuidv4, validate,
} from '@/utils/helpers';
import Errors from '@/utils/errors';

// Required fields mapped to their label in the `validation.fields` translations.
const REQUIRED_FIELDS = {
  currency: 'currency',
  issued_at: 'issued_at',
  due_at: 'due_at',
  number: 'number',
};

const REQUIRED_FOR_BOOKING = {
  ...REQUIRED_FIELDS,
  client_id: 'client',
  client_name: 'client_name',
  client_address: 'address',
  client_postal_code: 'postal_code',
  client_city: 'city',
  client_email: 'client_email',
  client_country: 'country',
  from_name: 'name',
  from_address: 'address',
  from_postal_code: 'postal_code',
  from_country: 'country',
  from_city: 'city',
  from_website: 'website',
  from_email: 'your_email',
  from_phone: 'your_phone',
  bank_name: 'bank_name',
  bank_account_no: 'bank_account',
  rows: {
    item: 'item',
    quantity: 'quantity',
    price: 'price',
    unit: 'unit',
  },
};

function newInvoice() {
  return {
    id: uuidv4(),
    number: '',
    status: 'draft',
    issued_at: '',
    is_compact: false,
    due_at: '',
    late_fee: '',
    currency: '',
    from_name: '',
    from_address: '',
    from_postal_code: '',
    from_city: '',
    from_country: '',
    from_county: '',
    from_website: '',
    from_email: '',
    from_phone: '',
    bank_name: '',
    bank_account_no: '',
    client_name: '',
    client_address: '',
    client_postal_code: '',
    client_country: '',
    client_county: '',
    client_city: '',
    client_email: '',
    client_id: null,
    rows: [],
    notes: '',
    updated_at: '',
    created_at: '',
    client_fields: [],
    team_fields: [],
  };
}

// Older versions stored a stale copy of the client (and a `total`) inside each invoice.
function fromStorage({ client, total, ...invoice }) {
  return {
    ...invoice,
    rows: (invoice.rows || []).map(row => ({ ...row, taxes: row.taxes || [] })),
    client_fields: invoice.client_fields || [],
    team_fields: invoice.team_fields || [],
  };
}

function rowTotal(row) {
  return row.quantity * row.price;
}

/**
 * Taxes of an invoice grouped by label, e.g. { VAT: { label: 'VAT', rate: '20', total: 40 } }.
 */
export function invoiceTaxes(invoice) {
  const taxes = {};
  invoice.rows.forEach(row => row.taxes.forEach((tax) => {
    if (!Object.hasOwn(taxes, tax.label)) {
      taxes[tax.label] = { total: 0, label: tax.label, rate: tax.value };
    }
    taxes[tax.label].total += rowTotal(row) * tax.value / 100;
  }));
  return taxes;
}

/**
 * The invoice as the UI shows it: rows in order, its client, and computed totals.
 */
function withDetails(invoice) {
  const subTotal = invoice.rows.reduce((sum, row) => sum + rowTotal(row), 0);
  const taxes = invoiceTaxes(invoice);
  const taxTotal = Object.values(taxes).reduce((sum, tax) => sum + tax.total, 0);
  return {
    ...invoice,
    rows: [...invoice.rows].sort((a, b) => a.order - b.order),
    client: useClientsStore().find(invoice.client_id),
    subTotal,
    taxes,
    taxTotal,
    total: subTotal + taxTotal,
  };
}

/**
 * Distinct, labelled taxes used by the rows of an invoice.
 */
function rowTaxes(invoice) {
  const taxesByLabel = new Map();
  invoice.rows
    .flatMap(row => row.taxes)
    .filter(tax => !!tax.label && !taxesByLabel.has(tax.label))
    .forEach(tax => taxesByLabel.set(tax.label, tax));
  return [...taxesByLabel.values()];
}

function copyTaxes(taxes, rowId) {
  return taxes.map(tax => ({
    id: uuidv4(), row_id: rowId, label: tax.label, value: tax.value,
  }));
}

function teamDetails(team, invoiceId) {
  return {
    from_name: team.company_name,
    from_address: team.company_address,
    from_postal_code: team.company_postal_code,
    from_city: team.company_city,
    from_country: team.company_country,
    from_county: team.company_county,
    from_website: team.website,
    from_email: team.contact_email,
    from_phone: team.contact_phone,
    team_fields: team.fields.map(field => ({
      id: uuidv4(),
      invoice_id: invoiceId,
      team_field_id: field.id,
      label: field.label,
      value: field.value,
    })),
  };
}

export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    invoices: [],
    errors: new Errors(),
    invoiceId: null,
    isCustomizationsModalOpen: false,
  }),
  getters: {
    all: state => state.invoices
      .map(withDetails)
      .sort((a, b) => String(b.issued_at || '').localeCompare(String(a.issued_at || ''))
        || String(b.number || '').localeCompare(String(a.number || ''))),
    invoice: (state) => {
      const invoice = state.invoices.find(it => it.id === state.invoiceId);
      return invoice ? withDetails(invoice) : null;
    },
    // Tax columns shown in the open invoice's table.
    taxes() {
      return this.invoice ? rowTaxes(this.invoice) : [];
    },
  },
  actions: {
    async load() {
      this.invoices = (await db.load('invoices', [])).map(fromStorage);
    },
    save() {
      return db.save('invoices', this.invoices);
    },
    find(invoiceId) {
      return this.invoices.find(it => it.id === invoiceId) || null;
    },
    async createInvoice() {
      const team = useTeamsStore().team;
      const invoice = newInvoice();
      Object.assign(invoice, {
        issued_at: dayjs().format('YYYY-MM-DD'),
        due_at: dayjs().add(team.invoice_due_days || 14, 'days').format('YYYY-MM-DD'),
        number: generateInvoiceNumber(this.invoices),
        late_fee: team.invoice_late_fee || 0.5,
        currency: team.currency || 'USD',
        ...teamDetails(team, invoice.id),
      });
      this.invoices.push(invoice);
      await this.save();
      return invoice.id;
    },
    async duplicateInvoice(originalInvoiceId) {
      const {
        id, number, status, created_at, due_at, issued_at, updated_at, ...original
      } = toStorable(this.find(originalInvoiceId));
      const invoiceId = await this.createInvoice();
      const invoice = this.find(invoiceId);

      Object.assign(invoice, {
        ...original,
        rows: original.rows.map((row) => {
          const rowId = uuidv4();
          return {
            ...row, id: rowId, invoice_id: invoiceId, taxes: copyTaxes(row.taxes, rowId),
          };
        }),
        client_fields: original.client_fields.map(field => ({ ...field, id: uuidv4(), invoice_id: invoiceId })),
        team_fields: original.team_fields.map(field => ({ ...field, id: uuidv4(), invoice_id: invoiceId })),
      });
      await this.save();
      return invoiceId;
    },
    /**
     * Applies the props unless that would leave required fields empty, in which case the
     * errors are shown and nothing changes.
     */
    updateInvoice(invoiceId, props = {}) {
      const invoice = this.find(invoiceId);
      if (!invoice) {
        return;
      }
      this.errors.clear();
      const { errors } = validate(REQUIRED_FIELDS, { ...invoice, ...props });
      if (Object.keys(errors).length > 0) {
        this.errors.set(errors);
        return;
      }
      Object.assign(invoice, props);
      return this.save();
    },
    deleteInvoice(invoiceId) {
      this.invoices = this.invoices.filter(it => it.id !== invoiceId);
      return this.save();
    },
    bookInvoice(invoiceId) {
      const invoice = this.find(invoiceId);
      this.errors.clear();
      const { errors } = validate(REQUIRED_FOR_BOOKING, withDetails(invoice));
      if (Object.keys(errors).length > 0) {
        this.errors.set(errors);
        return;
      }
      invoice.status = 'booked';
      return this.save();
    },
    prefillClient(invoiceId, client) {
      const bankAccount = useBankAccountsStore().find(client.bank_account_id);
      return this.updateInvoice(invoiceId, {
        client_id: client.id,
        client_name: client.company_name,
        client_address: client.company_address,
        client_postal_code: client.company_postal_code,
        client_city: client.company_city,
        client_county: client.company_county,
        client_country: client.company_country,
        client_email: client.invoice_email,
        currency: client.currency || useTeamsStore().team.currency || 'USD',
        bank_name: bankAccount ? bankAccount.bank_name : null,
        bank_account_no: bankAccount ? bankAccount.account_no : null,
        client_fields: client.fields.map(field => ({
          id: uuidv4(),
          invoice_id: invoiceId,
          client_field_id: field.id,
          label: field.label,
          value: field.value,
        })),
      });
    },
    prefillTeam(invoiceId) {
      return this.updateInvoice(invoiceId, teamDetails(useTeamsStore().team, invoiceId));
    },
    updateClientField(invoiceId, fieldId, props) {
      const invoice = this.find(invoiceId);
      const field = invoice.client_fields.find(it => it.id === fieldId);
      Object.assign(field, props);
      useClientsStore().updateField(invoice.client_id, field.client_field_id, props);
      return this.save();
    },
    updateTeamField(invoiceId, fieldId, props) {
      const field = this.find(invoiceId).team_fields.find(it => it.id === fieldId);
      Object.assign(field, props);
      useTeamsStore().updateField(field.team_field_id, props);
      return this.save();
    },
    addRow(invoiceId) {
      const invoice = this.find(invoiceId);
      const client = useClientsStore().find(invoice.client_id);
      const row = {
        id: uuidv4(),
        invoice_id: invoiceId,
        item: '',
        quantity: null,
        price: null,
        unit: '',
        order: invoice.rows.length,
        taxes: [],
        updated_at: '',
        created_at: '',
      };

      if (!client || client.has_tax) {
        const taxes = rowTaxes(invoice);
        row.taxes = copyTaxes(taxes.length > 0 ? taxes : useTaxesStore().allWithLabels, row.id);
      }

      invoice.rows.push(row);
      return this.save();
    },
    updateRow(invoiceId, rowId, props) {
      Object.assign(this.find(invoiceId).rows.find(it => it.id === rowId), props);
      return this.save();
    },
    removeRow(invoiceId, rowId) {
      const invoice = this.find(invoiceId);
      invoice.rows = invoice.rows.filter(it => it.id !== rowId);
      return this.save();
    },
    updateRowTax(invoiceId, rowId, taxId, props) {
      const row = this.find(invoiceId).rows.find(it => it.id === rowId);
      Object.assign(row.taxes.find(it => it.id === taxId), props);
      return this.save();
    },
    // Replaces every row's taxes on the open invoice with the team's current taxes.
    overwriteTaxes() {
      const invoice = this.find(this.invoiceId);
      if (!invoice) {
        return;
      }
      const taxes = useTaxesStore().allWithLabels;
      invoice.rows.forEach((row) => {
        row.taxes = copyTaxes(taxes, row.id);
      });
      return this.save();
    },
  },
});
