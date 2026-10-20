<template>
    <div>
        <div class="page-header">
            <div>
                <h1 class="page-header__title">{{ t('app-header:clients') }}</h1>
                <p class="page-header__subtitle">{{ t('clients_count', { count: clients.length }) }}</p>
            </div>
            <button type="button" class="btn btn-primary" @click="clientsStore.openNewClientModal()">
                <i class="material-icons-round md-18">person_add</i>
                {{ t('add_client') }}
            </button>
        </div>
        <div class="surface">
            <ClientsList/>
        </div>
    </div>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import ClientsList from '@/components/clients/ClientsList.vue';
import { useClientsStore } from '@/store/clients';

export default {
  name: 'clients',
  setup() {
    return useTranslation(['clients-list', 'app-header']);
  },
  components: {
    ClientsList,
  },
  computed: {
    ...mapStores(useClientsStore),
    ...mapState(useClientsStore, { clients: 'all' }),
  },
};
</script>
