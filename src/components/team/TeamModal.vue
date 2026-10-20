<template>
    <AppModal v-model="isOpen"
              centered
              no-header
              content-class="bg-base dp--24">
        <TeamForm @done="done"/>
    </AppModal>
</template>

<script>
import { mapState, mapStores, mapWritableState } from 'pinia';
import AppModal from '@/components/ui/AppModal.vue';
import TeamForm from '@/components/team/TeamForm.vue';
import { useInvoicesStore } from '@/store/invoices';
import { useTeamsStore } from '@/store/teams';

export default {
  components: {
    AppModal,
    TeamForm,
  },
  computed: {
    ...mapStores(useInvoicesStore),
    ...mapWritableState(useTeamsStore, { isOpen: 'isModalOpen' }),
    ...mapState(useInvoicesStore, ['invoice']),
  },
  methods: {
    done() {
      // Refresh the open invoice with the company's latest details.
      if (this.$route.name === 'invoice' && this.invoice) {
        this.invoicesStore.prefillTeam(this.invoice.id);
      }
      this.isOpen = false;
    },
  },
};
</script>
