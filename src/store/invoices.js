import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import dayjs from 'dayjs';
import InvoiceService from '@/services/invoice.service';
import Invoice from '@/store/models/invoice';
import InvoiceRow from '@/store/models/invoice-row';
import InvoiceRowTax from '@/store/models/invoice-row-tax';
import InvoiceClientField from '@/store/models/invoice-client-field';
import InvoiceTeamField from '@/store/models/invoice-team-field';
import { useClientsStore } from '@/store/clients';
import { useInvoiceClientFieldsStore } from '@/store/invoice-client-fields';
import { useInvoiceRowsStore } from '@/store/invoice-rows';
import { useInvoiceTeamFieldsStore } from '@/store/invoice-team-fields';
import { useTeamsStore } from '@/store/teams';
import {
  createNew, persisted, replaceAll, updateRecord,
} from '@/store/orm';
import { generateInvoiceNumber, pick } from '@/utils/helpers';
import Errors from '@/utils/errors';

const repo = () => useRepo(Invoice);

const withRows = query => query
  .with('taxes')
  .orderBy('order', 'asc');

function getInvoice(invoiceId) {
  return repo().query()
    .with('client')
    .with('client_fields')
    .with('team_fields')
    .with('rows', withRows)
    .find(invoiceId);
}

export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    errors: new Errors(),
    invoiceId: null,
    isCustomizationsModalOpen: false,
  }),
  actions: {
    setErrors(errors) {
      this.errors.set(errors);
    },
    clearErrors() {
      this.errors.clear();
    },
    init() {
      this.getInvoices();
    },
    terminate() {
      [InvoiceRowTax, InvoiceRow, InvoiceClientField, InvoiceTeamField]
        .forEach(model => useRepo(model).flush());
      return repo().flush();
    },
    async getInvoices() {
      const invoices = await InvoiceService.getInvoices();
      replaceAll(repo(), invoices);
      return invoices;
    },
    async getInvoice(invoiceId) {
      const invoice = await InvoiceService.getInvoice(invoiceId);
      repo().save(persisted(invoice));
      this.invoiceId = invoiceId;
      return invoice;
    },
    async createNewInvoice() {
      const invoice = createNew(repo());
      await InvoiceService.createInvoice(invoice);
      await this.prefillInvoice({
        invoiceId: invoice.id,
      });
      await this.prefillTeam({
        invoiceId: invoice.id,
      });
      return invoice.id;
    },
    async duplicateInvoice(originalInvoiceId) {
      const invoiceId = await this.createNewInvoice();

      const {
        $isNew,
        id,
        number,
        status,
        created_at,
        due_at,
        issued_at,
        updated_at,
        ...invoiceProps
      } = getInvoice(originalInvoiceId);

      await this.updateInvoice({ invoiceId, props: invoiceProps });

      const invoiceRows = useInvoiceRowsStore();
      for (let i = 0; i < invoiceProps.rows.length; i++) {
        const {
          id: _id,
          invoice_id,
          taxes,
          ...props
        } = invoiceProps.rows[i];

        invoiceRows.updateInvoiceRow({
          props,
          id: invoiceRows.addRow(invoiceId),
          invoiceId,
        });
      }

      return invoiceId;
    },
    invoiceProps(payload) {
      return updateRecord(repo(), payload.invoiceId, payload.props);
    },
    updateClient(payload) {
      const clientProps = pick(payload.props, {
        bank_account_id: 'bank_account_id',
        client_name: 'company_name',
        client_address: 'company_address',
        client_postal_code: 'company_postal_code',
        client_country: 'company_country',
        client_county: 'company_county',
        client_city: 'company_city',
        client_email: 'invoice_email',
        currency: 'currency',
      });
      const invoice = getInvoice(payload.invoiceId);

      if (Object.keys(clientProps).length > 0 && invoice.client_id) {
        useClientsStore().updateClient({
          props: clientProps,
          clientId: invoice.client_id,
        });
      }
    },
    updateTeam(payload) {
      const teamProps = pick(payload.props, {
        late_fee: 'invoice_late_fee',
        from_name: 'company_name',
        from_address: 'company_address',
        from_postal_code: 'company_postal_code',
        from_city: 'company_city',
        from_country: 'company_country',
        from_county: 'company_county',
        from_website: 'website',
        from_email: 'contact_email',
        from_phone: 'contact_phone',
      });
      const invoice = getInvoice(payload.invoiceId);

      if ('due_at' in payload.props || 'issued_at' in payload.props) {
        teamProps.invoice_due_days = dayjs(invoice.due_at)
          .diff(invoice.issued_at, 'days');
      }

      if (Object.keys(teamProps).length > 0) {
        useTeamsStore().updateTeam(teamProps);
      }
    },
    async updateInvoice(payload) {
      if (payload.props) {
        this.invoiceProps(payload);
      }

      this.clearErrors();
      return InvoiceService.updateInvoice(getInvoice(payload.invoiceId))
        .catch(err => this.setErrors(err.errors));
    },
    async deleteInvoice(invoice) {
      const res = await InvoiceService.deleteInvoice(invoice.id);
      repo().destroy(invoice.id);
      return res;
    },
    async bookInvoice() {
      this.clearErrors();

      try {
        await InvoiceService.bookInvoice(this.invoice);
        return this.getInvoice(this.invoice.id);
      } catch (err) {
        this.setErrors(err.errors);
      }
    },
    prefillClient(payload) {
      const client = payload.client;
      const invoiceClientFields = useInvoiceClientFieldsStore();
      invoiceClientFields.removeInvoiceClientFields(payload.invoiceId);

      client.fields.forEach((field) => {
        invoiceClientFields.addInvoiceClientField({
          invoiceId: payload.invoiceId,
          props: {
            label: field.label,
            value: field.value,
            client_field_id: field.id,
          },
        });
      });

      return this.updateInvoice({
        invoiceId: payload.invoiceId,
        props: {
          client_id: client.id,
          client_name: client.company_name,
          client_address: client.company_address,
          client_postal_code: client.company_postal_code,
          client_city: client.company_city,
          client_county: client.company_county,
          client_country: client.company_country,
          client_email: client.invoice_email,
          currency: client.currency || useTeamsStore().team.currency || 'USD',
          bank_name: client.bank_account ? client.bank_account.bank_name : null,
          bank_account_no: client.bank_account ? client.bank_account.account_no : null,
        },
      });
    },
    prefillInvoice(payload) {
      const team = useTeamsStore().team;

      const props = {
        issued_at: dayjs()
          .format('YYYY-MM-DD'),
        due_at: dayjs()
          .add(team.invoice_due_days || 14, 'days')
          .format('YYYY-MM-DD'),
        number: generateInvoiceNumber(this.all),
        late_fee: team.invoice_late_fee || 0.5,
        currency: team.currency || 'USD',
      };

      return this.updateInvoice({
        invoiceId: payload.invoiceId,
        props,
      });
    },
    prefillTeam(payload) {
      const team = useTeamsStore().team;
      const invoiceTeamFields = useInvoiceTeamFieldsStore();
      invoiceTeamFields.removeInvoiceTeamFields(payload.invoiceId);

      team.fields.forEach((field) => {
        invoiceTeamFields.addInvoiceTeamField({
          invoiceId: payload.invoiceId,
          props: {
            label: field.label,
            value: field.value,
            team_field_id: field.id,
          },
        });
      });

      const props = {
        from_name: team.company_name,
        from_address: team.company_address,
        from_postal_code: team.company_postal_code,
        from_city: team.company_city,
        from_country: team.company_country,
        from_county: team.company_county,
        from_website: team.website,
        from_email: team.contact_email,
        from_phone: team.contact_phone,
      };

      return this.updateInvoice({
        invoiceId: payload.invoiceId,
        props,
      });
    },
  },
  getters: {
    invoice(state) {
      return getInvoice(state.invoiceId);
    },
    all() {
      return repo().query()
        .where('$isNew', false)
        .with('client')
        .with('rows', withRows) // TODO: do we need this?
        .orderBy('issued_at', 'desc')
        .orderBy('number', 'desc')
        .get();
    },
  },
});
