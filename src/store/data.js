import { defineStore } from 'pinia';
import * as db from '@/services/db';
import { useTeamsStore } from '@/store/teams';
import { download, storeInBucket } from '@/utils/helpers';

export const useDataStore = defineStore('data', {
  state: () => ({
    isImportModalOpen: false,
    // Kept in localStorage rather than IndexedDB so it isn't part of exports, imports or the backup itself.
    lastBackupAt: localStorage.getItem('lastBackupAt'),
  }),
  actions: {
    async saveJson() {
      const data = await db.loadAll();
      const filename = await storeInBucket(JSON.stringify(data), 'serverless-invoices.json', 'application/json');
      this.lastBackupAt = new Date().toISOString();
      localStorage.setItem('lastBackupAt', this.lastBackupAt);
      return filename;
    },
    async exportJson() {
      const data = await db.loadAll();
      download(JSON.stringify(data), 'serverless-invoices.json', 'application/json');
    },
    async importJson(data) {
      await db.saveAll(data);
      return useTeamsStore().init();
    },
  },
});
