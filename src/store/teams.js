import { defineStore } from 'pinia';
import * as db from '@/services/db';
import { uuidv4 } from '@/utils/helpers';
import { useBankAccountsStore } from '@/store/bank-accounts';
import { useClientsStore } from '@/store/clients';
import { useInvoicesStore } from '@/store/invoices';
import { useTaxesStore } from '@/store/taxes';

const customCSS = `
/* @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300&display=swap');

.invoice-box:after {
    background: linear-gradient(to bottom, #1C7CE0, #150051);
}

.invoice-box {
    font-family: 'Work Sans', sans-serif;
} */
`;

function newTeam() {
  return {
    id: uuidv4(),
    company_name: '',
    company_address: '',
    company_postal_code: '',
    company_country: '',
    company_county: '',
    company_city: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    currency: null,
    invoice_late_fee: null,
    invoice_due_days: null,
    fields: [],
    updated_at: '',
    created_at: '',
    logo_url: '',
    custom_css: customCSS,
  };
}

export const useTeamsStore = defineStore('teams', {
  state: () => ({
    team: null,
    isModalOpen: false,
  }),
  actions: {
    async init() {
      const team = await db.load('team');
      this.team = { ...newTeam(), ...team, fields: team?.fields || [] };
      if (!team) {
        await this.save();
      }

      await Promise.all([
        useClientsStore().load(),
        useBankAccountsStore().load(),
        useInvoicesStore().load(),
        useTaxesStore().load(),
      ]);
    },
    save() {
      return db.save('team', this.team);
    },
    updateTeam(props) {
      Object.assign(this.team, props);
      return this.save();
    },
    addField() {
      this.team.fields.push({
        id: uuidv4(), team_id: this.team.id, label: '', value: '',
      });
      return this.save();
    },
    updateField(fieldId, props) {
      const field = this.team.fields.find(it => it.id === fieldId);
      if (field) {
        Object.assign(field, props);
        return this.save();
      }
    },
    deleteField(fieldId) {
      this.team.fields = this.team.fields.filter(it => it.id !== fieldId);
      return this.save();
    },
  },
});
