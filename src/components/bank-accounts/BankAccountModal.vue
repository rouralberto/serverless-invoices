<template>
    <AppModal v-model="isOpen"
              centered
              no-header
              content-class="bg-base dp--24">
        <BankAccountForm @done="close()"/>
    </AppModal>
</template>

<script>
import { mapStores } from 'pinia';
import AppModal from '@/components/ui/AppModal.vue';
import BankAccountForm from '@/components/bank-accounts/BankAccountForm.vue';
import { useBankAccountsStore } from '@/store/bank-accounts';

export default {
  components: {
    AppModal,
    BankAccountForm,
  },
  computed: {
    ...mapStores(useBankAccountsStore),
    isOpen: {
      get() {
        return this.bankAccountsStore.isModalOpen;
      },
      set(val) {
        if (!val) {
          this.close();
        }
      },
    },
  },
  watch: {
    '$route.query.bankAccountId'() {
      this.openFromRoute();
    },
  },
  mounted() {
    this.openFromRoute();
  },
  methods: {
    // Existing accounts open through ?bankAccountId= so the modal can be linked to.
    openFromRoute() {
      const { bankAccountId } = this.$route.query;
      if (bankAccountId) {
        this.bankAccountsStore.openBankAccount(bankAccountId);
      } else if (!this.bankAccountsStore.isDraft) {
        this.bankAccountsStore.closeModal();
      }
    },
    close() {
      const { bankAccountId, ...query } = this.$route.query;
      this.bankAccountsStore.closeModal();
      if (bankAccountId) {
        this.$router.push({ query });
      }
    },
  },
};
</script>
