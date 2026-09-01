<template>
    <div>
        <div v-if="!clients">{{ $t('loading') }}</div>
        <div v-else-if="clients.length > 0">
            <div class="input-group search-input-group mb-3">
                <div class="input-group-prepend">
                    <span class="input-group-text search-icon">
                        <i class="material-icons md-18">search</i>
                    </span>
                </div>
                <input type="text"
                       class="form-control search-input"
                       v-model="searchQuery"
                       :placeholder="$t('search_placeholder')">
            </div>
            <table class="table table-hover">
                <thead>
                <tr>
                    <th>{{ $t('company_name') }}</th>
                    <th>{{ $t('email') }}</th>
                    <th>{{ $t('city') }}</th>
                    <th class="text-right"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="client in filteredClients" :key="client.id">
                    <td>{{ client.company_name }}</td>
                    <td>{{ client.invoice_email }}</td>
                    <td>{{ client.company_city }}</td>
                    <td class="text-right text-nowrap">
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
            <button class="btn btn-sm btn-link" @click="createNewClient">{{ $t('add_client') }}</button>
        </div>
        <EmptyState v-else>
            <template v-slot>
                <button class="btn btn-sm btn-link" @click="createNewClient">{{ $t('add_client') }}</button>
            </template>
        </EmptyState>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import EmptyState from '@/components/EmptyState';
import NotificationService from '@/services/notification.service';

export default {
  i18nOptions: { namespaces: 'clients-list' },
  components: {
    EmptyState,
  },
  data() {
    return {
      searchQuery: '',
    };
  },
  computed: {
    ...mapGetters({
      clients: 'clients/all',
    }),
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
  mounted() {
    this.$store.dispatch('clients/getClients');
  },
  methods: {
    createNewClient() {
      this.$store.dispatch('clients/openNewClientModal');
    },
    openClientModal(client) {
      this.$store.commit('clients/clientId', client.id);
      this.$router.push({
        query: {
          clientId: client.id,
        },
      });
    },
    async deleteClient(client) {
      const confirmed = await this.$bvModal.msgBoxConfirm(
        `${this.$t('delete_modal.title')} ${client.company_name}?`,
        {
          okTitle: this.$t('delete_modal.ok_title'),
          okVariant: 'danger',
          cancelTitle: this.$t('delete_modal.cancel_title'),
          cancelVariant: 'btn-link',
          contentClass: 'bg-base dp--24',
        },
      );

      if (!confirmed) {
        return;
      }

      await this.$store.dispatch('clients/deleteClient', client.id);

      try {
        NotificationService.success(this.$t('notification_deleted'));
      } catch (err) {
        NotificationService.error(err.message);
      }
    },
  },
};
</script>
