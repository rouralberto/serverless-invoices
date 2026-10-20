<template>
    <AppModal v-model="isOpen"
              centered
              no-header
              content-class="bg-base dp--24">
        <ClientForm @done="done()"/>
    </AppModal>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import AppModal from '@/components/ui/AppModal.vue';
import ClientForm from '@/components/clients/ClientForm.vue';
import { useClientsStore } from '@/store/clients';
import { useInvoicesStore } from '@/store/invoices';

export default {
  components: {
    AppModal,
    ClientForm,
  },
  computed: {
    ...mapStores(useClientsStore, useInvoicesStore),
    ...mapState(useClientsStore, ['client']),
    ...mapState(useInvoicesStore, ['invoice']),
    isOpen: {
      get() {
        return this.clientsStore.isModalOpen;
      },
      set(val) {
        if (!val) {
          this.close();
        }
      },
    },
  },
  watch: {
    '$route.query.clientId'() {
      this.openFromRoute();
    },
  },
  mounted() {
    this.openFromRoute();
  },
  methods: {
    // Existing clients open through ?clientId= so the modal can be linked to.
    openFromRoute() {
      const { clientId } = this.$route.query;
      if (clientId) {
        this.clientsStore.openClient(clientId);
      } else if (!this.clientsStore.isDraft) {
        this.clientsStore.closeModal();
      }
    },
    close() {
      const { clientId, ...query } = this.$route.query;
      this.clientsStore.closeModal();
      if (clientId) {
        this.$router.push({ query });
      }
    },
    done() {
      // Refresh the open invoice with the client's latest details.
      if (this.$route.name === 'invoice' && this.client && this.invoice.client_id === this.client.id) {
        this.invoicesStore.prefillClient(this.invoice.id, this.client);
      }
      this.close();
    },
  },
};
</script>
