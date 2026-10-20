import { defineStore } from 'pinia';
import localForage from 'localforage';
import MigrationService from '@/services/migration.service';
import { useTeamsStore } from '@/store/teams';
import { download, storeInBucket } from '@/utils/helpers';

async function getAllData() {
  const keys = await localForage.keys();
  const results = await Promise.all(keys.map(key => localForage.getItem(key)));

  const data = {};
  keys.forEach((key, index) => {
    data[key] = results[index];
  });
  return data;
}

export const useDataStore = defineStore('data', {
  state: () => ({
    isImportModalOpen: false,
    // Kept in localStorage rather than IndexedDB so it isn't part of exports, imports or the backup itself.
    lastBackupAt: localStorage.getItem('lastBackupAt'),
  }),
  actions: {
    async migrate() {
      return MigrationService.migrate();
    },
    async saveJson() {
      const data = await getAllData();
      const filename = await storeInBucket(JSON.stringify(data), 'serverless-invoices.json', 'application/json');
      this.lastBackupAt = new Date().toISOString();
      localStorage.setItem('lastBackupAt', this.lastBackupAt);
      return filename;
    },
    async exportJson() {
      const data = await getAllData();
      download(JSON.stringify(data), 'serverless-invoices.json', 'application/json');
    },
    async importJson(data) {
      await Promise.all(Object.keys(data)
        .map(key => localForage.setItem(key, data[key])));
      const teams = useTeamsStore();
      await teams.terminate();
      return teams.init();
    },
  },
});
