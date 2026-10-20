import { defineStore } from 'pinia';
import * as db from '@/services/db';
import { uuidv4 } from '@/utils/helpers';

function newBankAccount() {
  return {
    id: uuidv4(),
    bank_name: '',
    account_no: '',
    updated_at: '',
    created_at: '',
  };
}

export const useBankAccountsStore = defineStore('bankAccounts', {
  state: () => ({
    bankAccounts: [],
    bankAccountId: null,
    // An account being filled in the modal that hasn't been created yet.
    draft: null,
    isModalOpen: false,
  }),
  getters: {
    all: state => state.bankAccounts,
    bankAccount: state => (state.draft && state.draft.id === state.bankAccountId
      ? state.draft
      : state.bankAccounts.find(it => it.id === state.bankAccountId) || null),
    isDraft: state => !!state.draft && state.draft.id === state.bankAccountId,
  },
  actions: {
    async load() {
      this.bankAccounts = await db.load('bank_accounts', []);
    },
    save() {
      return db.save('bank_accounts', this.bankAccounts);
    },
    find(bankAccountId) {
      return this.bankAccounts.find(it => it.id === bankAccountId) || null;
    },
    openBankAccount(bankAccountId) {
      this.bankAccountId = bankAccountId;
      this.isModalOpen = true;
    },
    openNewBankAccountModal() {
      this.draft = newBankAccount();
      this.openBankAccount(this.draft.id);
    },
    closeModal() {
      this.isModalOpen = false;
      this.draft = null;
    },
    async createBankAccount() {
      const bankAccount = this.draft;
      this.bankAccounts.push(bankAccount);
      this.draft = null;
      await this.save();
      return this.find(bankAccount.id);
    },
    updateBankAccount(props) {
      Object.assign(this.bankAccount, props);
      return this.isDraft ? undefined : this.save();
    },
  },
});
