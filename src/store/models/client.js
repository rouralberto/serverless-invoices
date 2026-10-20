import { Model } from 'pinia-orm';
import BankAccount from '@/store/models/bank-account';
import ClientField from '@/store/models/client-field';

export default class Client extends Model {
  static entity = 'clients';

  static fields() {
    return {
      id: this.uid(),
      // Set while a record is being created in a modal and hasn't been persisted yet.
      $isNew: this.attr(false),
      company_name: this.attr(''),
      company_address: this.attr(''),
      company_postal_code: this.attr(''),
      company_country: this.attr(''),
      company_county: this.attr(''),
      company_city: this.attr(''),
      has_tax: this.attr(true),
      currency: this.attr(null),
      rate: this.attr(null),
      invoice_email: this.attr(''),
      bank_account_id: this.attr(null),
      bank_account: this.belongsTo(BankAccount, 'bank_account_id'),
      fields: this.hasMany(ClientField, 'client_id'),
      updated_at: this.attr(''),
      created_at: this.attr(''),
    };
  }
}
