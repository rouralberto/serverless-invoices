<template>
    <BModal v-model="isOpen"
            centered
            no-footer
            no-header
            content-class="bg-base dp--24">
        <ClientForm @done="close()"/>
    </BModal>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import { BModal } from 'bootstrap-vue-next';
import ClientForm from '@/components/clients/ClientForm.vue';
import { useClientsStore } from '@/store/clients';
import { useInvoicesStore } from '@/store/invoices';

export default {
  components: {
    ClientForm,
    BModal,
  },
  computed: {
    isOpen: {
      get() {
        return this.clientsStore.isModalOpen;
      },
      set(val) {
        if (!val) {
          this.$router.push({ query: {} });
          this.clientsStore.getClients();
        }
        this.clientsStore.isModalOpen = val;
      },
    },
    ...mapStores(useClientsStore, useInvoicesStore),
    ...mapState(useClientsStore, ['client']),
    ...mapState(useInvoicesStore, ['invoice']),
  },
  watch: {
    '$route.query.clientId'() {
      this.getClient();
    },
  },
  mounted() {
    this.getClient();
  },
  methods: {
    getClient() {
      const query = this.$route.query;
      if (Object.hasOwn(query, 'clientId')) {
        if ((this.client && this.client.id !== query.clientId) || !this.client) {
          this.clientsStore.getClient(query.clientId);
        }

        this.clientsStore.isModalOpen = true;
      } else {
        this.clientsStore.isModalOpen = false;
      }
    },
    async close() {
      await this.promptUpdateInvoice();
      this.isOpen = false;
    },
    async promptUpdateInvoice() {
      if (this.$route.name === 'invoice' && this.invoice.client_id === this.client.id) {
        /* const confirmed = await ConfirmService.confirm('Update client details on invoice?', {
          okTitle: 'Update',
          cancelTitle: 'Dismiss',
          cancelVariant: 'btn-link',
          contentClass: 'bg-base dp--24',
        });
        if (confirmed) { */
        this.invoicesStore.prefillClient({
          client: this.client,
          invoiceId: this.invoice.id,
        });
        /* } */
      }
    },
  },
};
</script>
