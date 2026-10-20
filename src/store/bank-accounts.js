import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import BankAccountService from '@/services/bank-account.service';
import BankAccount from '@/store/models/bank-account';
import {
  createNew, persisted, replaceAll, updateRecord,
} from '@/store/orm';

const repo = () => useRepo(BankAccount);

export const useBankAccountsStore = defineStore('bankAccounts', {
  state: () => ({
    bankAccountId: null,
    isModalOpen: null,
  }),
  actions: {
    init() {
      return this.getBankAccounts();
    },
    terminate() {
      return repo().flush();
    },
    async getBankAccounts() {
      const accounts = await BankAccountService.getBankAccounts();
      replaceAll(repo(), accounts);
      return accounts;
    },
    async getBankAccount(bankAccountId) {
      const bankAccount = await BankAccountService.getBankAccount(bankAccountId);
      this.bankAccountId = bankAccount.id;
      return repo().save(persisted(bankAccount));
    },
    async createNewBankAccount(bankAccount) {
      const res = await BankAccountService.createBankAccount(bankAccount);
      repo().save(persisted(res));
      return repo().find(res.id);
    },
    bankAccountProps(props) {
      return updateRecord(repo(), this.bankAccountId, props);
    },
    async updateBankAccount(props) {
      this.bankAccountProps(props);
      return BankAccountService.updateBankAccount(this.bankAccount);
    },
    openNewBankAccountModal() {
      const bankAccount = createNew(repo());
      this.bankAccountId = bankAccount.id;
      this.isModalOpen = true;
    },
  },
  getters: {
    bankAccount(state) {
      return repo().find(state.bankAccountId);
    },
    all() {
      return repo()
        .where('$isNew', false)
        .get();
    },
  },
});
