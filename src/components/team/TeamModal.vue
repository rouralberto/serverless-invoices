<template>
    <BModal v-model="isOpen"
            centered
            no-footer
            no-header
            content-class="bg-base dp--24">
        <TeamForm @done="close"/>
    </BModal>
</template>

<script>
import { mapState, mapStores, mapWritableState } from 'pinia';
import { BModal } from 'bootstrap-vue-next';
import TeamForm from '@/components/team/TeamForm.vue';
import { useInvoicesStore } from '@/store/invoices';
import { useTeamsStore } from '@/store/teams';

export default {
  components: {
    TeamForm,
    BModal,
  },
  computed: {
    ...mapStores(useTeamsStore, useInvoicesStore),
    ...mapWritableState(useTeamsStore, { isOpen: 'isModalOpen' }),
    ...mapState(useTeamsStore, ['team']),
    ...mapState(useInvoicesStore, ['invoice']),
  },
  mounted() {
    this.getTeam();
  },
  methods: {
    getTeam() {
      this.teamsStore.getTeam();
    },
    async close() {
      await this.promptUpdateInvoice();
      this.isOpen = false;
    },
    async promptUpdateInvoice() {
      if (this.$route.name === 'invoice') {
        /* const confirmed = await ConfirmService.confirm('Update team details on invoice?', {
          okTitle: 'Update',
          cancelTitle: 'Dismiss',
          cancelVariant: 'btn-link',
          contentClass: 'bg-base dp--24',
        });
        if (confirmed) { */
        this.invoicesStore.prefillTeam({
          invoiceId: this.invoice.id,
        });
        /* } */
      }
    },
  },
};
</script>
