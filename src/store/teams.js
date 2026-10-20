import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import TeamService from '@/services/team.service';
import Team from '@/store/models/team';
import TeamField from '@/store/models/team-field';
import { useBankAccountsStore } from '@/store/bank-accounts';
import { useClientsStore } from '@/store/clients';
import { useDataStore } from '@/store/data';
import { useInvoicesStore } from '@/store/invoices';
import { useTaxesStore } from '@/store/taxes';
import { replaceAll, updateRecord } from '@/store/orm';

const repo = () => useRepo(Team);

export const useTeamsStore = defineStore('teams', {
  state: () => ({
    isModalOpen: false,
  }),
  actions: {
    async init() {
      await useDataStore().migrate();

      const stores = [useClientsStore(), useBankAccountsStore(), useInvoicesStore(), useTaxesStore()];
      await Promise.all(stores.map(store => store.terminate()));

      await this.getTeam();

      stores.forEach(store => store.init());
    },
    async terminate() {
      useRepo(TeamField).flush();
      return repo().flush();
    },
    async getTeam() {
      const team = await TeamService.getTeam();
      replaceAll(repo(), team);
      return team;
    },
    teamProps(props) {
      return updateRecord(repo(), this.team.id, props);
    },
    async updateTeam(props) {
      if (props) {
        this.teamProps(props);
      }
      return TeamService.updateTeam(this.team);
    },
  },
  getters: {
    team() {
      return repo().query().with('fields').first();
    },
  },
});
