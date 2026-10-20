<template>
    <BModal v-model="isOpen"
            centered
            no-footer
            no-header
            size="md"
            content-class="bg-base dp--24">
        <BankAccountForm @done="close()"/>
    </BModal>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import { BModal } from 'bootstrap-vue-next';
import BankAccountForm from '@/components/bank-accounts/BankAccountForm.vue';
import { useBankAccountsStore } from '@/store/bank-accounts';

export default {
  components: {
    BModal,
    BankAccountForm,
  },
  computed: {
    isOpen: {
      get() {
        return !!this.bankAccountsStore.isModalOpen;
      },
      set(val) {
        if (!val) {
          this.$router.push({ query: {} });
          this.bankAccountsStore.getBankAccounts();
        }
        this.bankAccountsStore.isModalOpen = val;
      },
    },
    ...mapStores(useBankAccountsStore),
    ...mapState(useBankAccountsStore, ['bankAccount']),
  },
  watch: {
    '$route.query.bankAccountId'() {
      this.getBankAccount();
    },
  },
  mounted() {
    this.getBankAccount();
  },
  methods: {
    getBankAccount() {
      const query = this.$route.query;
      if (Object.hasOwn(query, 'bankAccountId')) {
        if ((this.bankAccount && this.bankAccount.id !== query.bankAccountId) || !this.bankAccount) {
          this.bankAccountsStore.getBankAccount(query.bankAccountId);
        }

        this.bankAccountsStore.isModalOpen = true;
      } else {
        this.bankAccountsStore.isModalOpen = false;
      }
    },
    close() {
      this.isOpen = false;
    },
  },
};
</script>
