import { defineStore } from 'pinia';
import * as db from '@/services/db';
import { uuidv4 } from '@/utils/helpers';

function newClient(props = {}) {
  return {
    id: uuidv4(),
    company_name: '',
    company_address: '',
    company_postal_code: '',
    company_country: '',
    company_county: '',
    company_city: '',
    has_tax: true,
    currency: null,
    rate: null,
    invoice_email: '',
    bank_account_id: null,
    fields: [],
    updated_at: '',
    created_at: '',
    ...props,
  };
}

// Older versions stored a copy of the bank account inside each client; the id is enough.
function fromStorage({ bank_account, ...client }) {
  return { ...client, fields: client.fields || [] };
}

export const useClientsStore = defineStore('clients', {
  state: () => ({
    clients: [],
    clientId: null,
    // A client being filled in the modal that hasn't been created yet.
    draft: null,
    isModalOpen: false,
  }),
  getters: {
    all: state => state.clients,
    client: state => (state.draft && state.draft.id === state.clientId
      ? state.draft
      : state.clients.find(it => it.id === state.clientId) || null),
    isDraft: state => !!state.draft && state.draft.id === state.clientId,
  },
  actions: {
    async load() {
      this.clients = (await db.load('clients', [])).map(fromStorage);
    },
    save() {
      return db.save('clients', this.clients);
    },
    find(clientId) {
      return this.clients.find(it => it.id === clientId) || null;
    },
    openClient(clientId) {
      this.clientId = clientId;
      this.isModalOpen = true;
    },
    openNewClientModal() {
      this.draft = newClient();
      this.openClient(this.draft.id);
    },
    closeModal() {
      this.isModalOpen = false;
      this.draft = null;
    },
    createClient(props) {
      return this.insertClient(newClient(props));
    },
    async createDraftClient() {
      const client = await this.insertClient(this.draft);
      this.draft = null;
      return client;
    },
    async insertClient(client) {
      // Give new clients every custom field label already used by other clients.
      const labels = new Set(client.fields.map(field => field.label));
      this.clients.flatMap(it => it.fields).forEach(({ label }) => {
        if (label && !labels.has(label)) {
          labels.add(label);
          client.fields.push({
            id: uuidv4(), client_id: client.id, label, value: '',
          });
        }
      });

      this.clients.push(client);
      await this.save();
      return this.find(client.id);
    },
    updateClient(clientId, props) {
      const client = this.draft && this.draft.id === clientId ? this.draft : this.find(clientId);
      if (!client) {
        return;
      }
      Object.assign(client, props);
      return client === this.draft ? undefined : this.save();
    },
    addField(clientId) {
      const client = this.draft && this.draft.id === clientId ? this.draft : this.find(clientId);
      client.fields.push({
        id: uuidv4(), client_id: clientId, label: '', value: '',
      });
      return client === this.draft ? undefined : this.save();
    },
    updateField(clientId, fieldId, props) {
      const client = this.draft && this.draft.id === clientId ? this.draft : this.find(clientId);
      const field = client && client.fields.find(it => it.id === fieldId);
      if (!field) {
        return;
      }
      Object.assign(field, props);
      return client === this.draft ? undefined : this.save();
    },
    deleteField(clientId, fieldId) {
      const client = this.draft && this.draft.id === clientId ? this.draft : this.find(clientId);
      client.fields = client.fields.filter(it => it.id !== fieldId);
      return client === this.draft ? undefined : this.save();
    },
    deleteClient(clientId) {
      this.clients = this.clients.filter(it => it.id !== clientId);
      return this.save();
    },
  },
});
