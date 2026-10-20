import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import ClientService from '@/services/client.service';
import Client from '@/store/models/client';
import ClientField from '@/store/models/client-field';
import { useClientFieldsStore } from '@/store/client-fields';
import {
  createNew, persisted, replaceAll, updateRecord,
} from '@/store/orm';

const repo = () => useRepo(Client);

function getClientById(clientId) {
  return repo().query()
    .with('bank_account')
    .with('fields')
    .find(clientId);
}

export const useClientsStore = defineStore('clients', {
  state: () => ({
    clientId: null,
    isModalOpen: false,
  }),
  actions: {
    init() {
      return this.getClients();
    },
    terminate() {
      useRepo(ClientField).flush();
      return repo().flush();
    },
    async getClients() {
      const clients = await ClientService.getClients();
      replaceAll(repo(), clients);
      return clients;
    },
    async getClient(clientId) {
      const client = await ClientService.getClient(clientId);
      this.clientId = client.id;
      repo().save(persisted(client));
    },
    async createNewClient(client) {
      if (!Object.hasOwn(client, 'id')) {
        client = repo().make(client);
      }
      useClientFieldsStore().addAllFields(client.id);

      const res = await ClientService.createClient(getClientById(client.id) || client);
      repo().save(persisted(res));
      return getClientById(res.id);
    },
    clientProps(payload) {
      return updateRecord(repo(), payload.clientId, payload.props);
    },
    async updateClient(payload) {
      if (payload.props) {
        this.clientProps(payload);
      }
      return ClientService.updateClient(getClientById(payload.clientId));
    },
    openNewClientModal() {
      const client = createNew(repo());
      this.clientId = client.id;
      this.isModalOpen = true;
    },
    async deleteClient(clientId) {
      const res = await ClientService.deleteClient(clientId);
      repo().destroy(clientId);
      return res;
    },
  },
  getters: {
    client(state) {
      return getClientById(state.clientId);
    },
    all() {
      return repo().query()
        .where('$isNew', false)
        .with('bank_account')
        .with('fields')
        .get();
    },
  },
});
