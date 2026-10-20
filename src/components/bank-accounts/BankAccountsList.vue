<template>
    <div>
        <div v-if="!bankAccounts">{{ t('loading') }}</div>
        <div v-else-if="bankAccounts && bankAccounts.length > 0">
            <table class="table table-hover">
                <thead>
                <tr>
                    <th>{{ t('bank') }}</th>
                    <th>{{ t('bank_account_details') }}</th>
                    <th class="text-end"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="account in bankAccounts" :key="account.id"
                    @click="onSelect(account)" :class="{pointer: !!$attrs.onSelect }">
                    <td>{{ account.bank_name }}</td>
                    <td>{{ account.account_no }}</td>
                    <td class="text-end">
                        <i class="material-icons md-18 p-1 pointer"
                           @click.stop="openBankAccountModal(account)">
                            edit
                        </i>
                    </td>
                </tr>
                </tbody>
            </table>
            <button class="btn btn-sm btn-link" @click="createNewAccount">{{ t('add_bank_account') }}</button>
        </div>
        <EmptyState v-else>
            <button class="btn btn-sm btn-link" @click="createNewAccount">{{ t('add_bank_account') }}</button>
        </EmptyState>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import EmptyState from '@/components/EmptyState.vue';
import { useBankAccountsStore } from '@/store/bank-accounts';

export default {
  setup() {
    return useTranslation('bank-accounts-list');
  },
  // `select` is intentionally not declared so the listener shows up in $attrs.
  inheritAttrs: false,
  components: {
    EmptyState,
  },
  computed: {
    ...mapStores(useBankAccountsStore),
    ...mapState(useBankAccountsStore, { bankAccounts: 'all' }),
  },
  methods: {
    createNewAccount() {
      this.bankAccountsStore.openNewBankAccountModal();
    },
    openBankAccountModal(bankAccount) {
      this.$router.push({
        query: {
          ...this.$route.query,
          bankAccountId: bankAccount.id,
        },
      });
    },
    onSelect(account) {
      this.$emit('select', account);
    },
  },
};
</script>
