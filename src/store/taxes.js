import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import Tax from '@/store/models/tax';
import TaxService from '@/services/tax.service';
import { replaceAll, updateRecord } from '@/store/orm';

const repo = () => useRepo(Tax);

export const useTaxesStore = defineStore('taxes', {
  actions: {
    init() {
      return this.getTaxes();
    },
    terminate() {
      return repo().flush();
    },
    async getTaxes() {
      const taxes = await TaxService.getTaxes();
      replaceAll(repo(), taxes);
      return taxes;
    },
    taxProps(payload) {
      return updateRecord(repo(), payload.taxId, payload.props);
    },
    updateTax(payload) {
      const tax = this.taxProps(payload);
      return TaxService.updateTax(tax);
    },
    addNewTax() {
      const tax = repo().save({});
      return TaxService.createTax(tax);
    },
    async deleteTax(taxId) {
      repo().destroy(taxId);
      return TaxService.deleteTax(taxId);
    },
  },
  getters: {
    all() {
      return repo().all();
    },
    allWithLabels() {
      return repo().all().filter(tax => !!tax.label);
    },
  },
});
