import { Model } from 'pinia-orm';

export default class InvoiceRowTax extends Model {
  static entity = 'invoice_row_taxes';

  static fields() {
    return {
      id: this.uid(),
      row_id: this.attr(null),
      label: this.attr(''),
      value: this.attr(''),
    };
  }
}
