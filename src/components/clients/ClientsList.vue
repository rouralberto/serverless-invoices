<template>
    <div>
        <div v-if="!clients">{{ t('loading') }}</div>
        <div v-else-if="clients.length > 0">
            <div class="input-group search-input-group mb-3">
                <span class="input-group-text search-icon">
                    <i class="material-icons md-18">search</i>
                </span>
                <input type="text"
                       class="form-control search-input"
                       v-model="searchQuery"
                       :placeholder="t('search_placeholder')">
            </div>
            <table class="table table-hover">
                <thead>
                <tr>
                    <th>{{ t('company_name') }}</th>
                    <th>{{ t('email') }}</th>
                    <th>{{ t('city') }}</th>
                    <th class="text-end"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="client in filteredClients" :key="client.id">
                    <td>{{ client.company_name }}</td>
                    <td>{{ client.invoice_email }}</td>
                    <td>{{ client.company_city }}</td>
                    <td class="text-end text-nowrap">
                        <i class="material-icons md-18 p-1 pointer"
                           @click="openClientModal(client)">
                            edit
                        </i>
                        <i class="material-icons md-18 p-1 pointer text-danger"
                           @click="deleteClient(client)">
                            delete
                        </i>
                    </td>
                </tr>
                </tbody>
            </table>
            <button class="btn btn-sm btn-link" @click="createNewClient">{{ t('add_client') }}</button>
        </div>
        <EmptyState v-else>
            <button class="btn btn-sm btn-link" @click="createNewClient">{{ t('add_client') }}</button>
        </EmptyState>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import EmptyState from '@/components/EmptyState.vue';
import NotificationService from '@/services/notification.service';
import ConfirmService from '@/services/confirm.service';
import { useClientsStore } from '@/store/clients';

export default {
  setup() {
    return useTranslation('clients-list');
  },
  components: {
    EmptyState,
  },
  data() {
    return {
      searchQuery: '',
    };
  },
  computed: {
    ...mapStores(useClientsStore),
    ...mapState(useClientsStore, { clients: 'all' }),
    filteredClients() {
      if (!this.clients) {
        return [];
      }

      const query = this.searchQuery.trim().toLowerCase();
      const sorted = [...this.clients].sort((a, b) => (
        (a.company_name || '').localeCompare(b.company_name || '')
      ));

      if (!query) {
        return sorted;
      }

      return sorted.filter(client => (
        (client.company_name || '').toLowerCase().includes(query)
        || (client.invoice_email || '').toLowerCase().includes(query)
        || (client.company_city || '').toLowerCase().includes(query)
      ));
    },
  },
  methods: {
    createNewClient() {
      this.clientsStore.openNewClientModal();
    },
    openClientModal(client) {
      this.$router.push({
        query: {
          ...this.$route.query,
          clientId: client.id,
        },
      });
    },
    async deleteClient(client) {
      const confirmed = await ConfirmService.confirm(
        `${this.t('delete_modal.title')} ${client.company_name}?`,
        {
          okTitle: this.t('delete_modal.ok_title'),
          okVariant: 'danger',
          cancelTitle: this.t('delete_modal.cancel_title'),
        },
      );

      if (!confirmed) {
        return;
      }

      await this.clientsStore.deleteClient(client.id);
      NotificationService.success(this.t('notification_deleted'));
    },
  },
};
</script>
