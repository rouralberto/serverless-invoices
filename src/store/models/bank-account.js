import { Model } from 'pinia-orm';

export default class BankAccount extends Model {
  static entity = 'bank_accounts';

  static fields() {
    return {
      id: this.uid(),
      // Set while a record is being created in a modal and hasn't been persisted yet.
      $isNew: this.attr(false),
      bank_name: this.attr(''),
      account_no: this.attr(''),
      updated_at: this.attr(''),
      created_at: this.attr(''),
    };
  }
}
