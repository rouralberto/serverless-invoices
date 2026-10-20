import { defineStore } from 'pinia';
import * as db from '@/services/db';
import { uuidv4 } from '@/utils/helpers';

export const useTaxesStore = defineStore('taxes', {
  state: () => ({
    taxes: [],
  }),
  getters: {
    all: state => state.taxes,
    allWithLabels: state => state.taxes.filter(tax => !!tax.label),
  },
  actions: {
    async load() {
      this.taxes = await db.load('taxes', []);
    },
    save() {
      return db.save('taxes', this.taxes);
    },
    addTax() {
      this.taxes.push({ id: uuidv4(), label: '', value: '' });
      return this.save();
    },
    updateTax(taxId, props) {
      const tax = this.taxes.find(it => it.id === taxId);
      if (tax) {
        Object.assign(tax, props);
        return this.save();
      }
    },
    deleteTax(taxId) {
      this.taxes = this.taxes.filter(it => it.id !== taxId);
      return this.save();
    },
  },
});
