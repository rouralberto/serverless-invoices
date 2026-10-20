<template>
    <div>
        <div v-if="!clients">{{ t('loading') }}</div>
        <div v-else-if="clients.length > 0">
            <div class="surface__toolbar">
                <label class="search-field">
                    <i class="material-icons-round md-18">search</i>
                    <input type="search"
                           class="form-control"
                           v-model="searchQuery"
                           :placeholder="t('search_placeholder')">
                </label>
            </div>
            <div class="table-responsive">
                <table class="table data-table">
                    <thead>
                    <tr>
                        <th>{{ t('company_name') }}</th>
                        <th>{{ t('email') }}</th>
                        <th>{{ t('city') }}</th>
                        <th class="text-end"></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="client in filteredClients" :key="client.id" class="pointer" @click="openClientModal(client)">
                        <td class="text-nowrap">
                            <span class="with-avatar">
                                <span class="avatar">{{ initials(client.company_name) }}</span>
                                <span class="fw-medium">{{ client.company_name }}</span>
                            </span>
                        </td>
                        <td class="text-secondary">{{ client.invoice_email }}</td>
                        <td class="text-secondary">{{ client.company_city }}</td>
                        <td class="text-end text-nowrap">
                            <button type="button" class="btn-icon" @click.stop="openClientModal(client)">
                                <i class="material-icons-round md-18">edit</i>
                            </button>
                            <button type="button" class="btn-icon btn-icon--danger" @click.stop="deleteClient(client)">
                                <i class="material-icons-round md-18">delete</i>
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <EmptyState v-else icon="group">
            <button class="btn btn-primary btn-sm" @click="createNewClient">{{ t('add_client') }}</button>
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
import { initials } from '@/utils/format';

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
    initials,
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
