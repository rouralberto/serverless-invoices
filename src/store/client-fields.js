import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import ClientField from '@/store/models/client-field';
import { useClientsStore } from '@/store/clients';
import { updateRecord } from '@/store/orm';

const repo = () => useRepo(ClientField);

export const useClientFieldsStore = defineStore('clientFields', {
  actions: {
    init() {},
    terminate() {},
    clientFieldProps(payload) {
      return updateRecord(repo(), payload.fieldId, payload.props);
    },
    updateClientField(payload) {
      const field = this.clientFieldProps(payload);
      if (!field) {
        return;
      }
      return useClientsStore().updateClient({
        clientId: field.client_id,
      });
    },
    addNewField(clientId) {
      repo().save({ client_id: clientId });
    },
    addAllFields(clientId) {
      // Get all distinct custom fields
      const uniqueLabels = repo().all()
        .map(field => field.label)
        .filter((value, index, self) => self.indexOf(value) === index);

      repo().save(uniqueLabels.map(label => ({
        label,
        client_id: clientId,
      })));
    },
    deleteClientField(fieldId) {
      const field = repo().destroy(fieldId);
      return useClientsStore().updateClient({
        clientId: field.client_id,
      }); // TODO: pass clientId to make generic
    },
  },
});
