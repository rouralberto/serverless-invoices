import { Model } from 'pinia-orm';
import Invoice from '@/store/models/invoice';
import InvoiceRowTax from '@/store/models/invoice-row-tax';

export default class InvoiceRow extends Model {
  static entity = 'invoice_rows';

  static fields() {
    return {
      id: this.uid(),
      invoice_id: this.attr(null),
      invoice: this.belongsTo(Invoice, 'invoice_id'),
      item: this.attr(''),
      quantity: this.attr(null),
      price: this.attr(null),
      unit: this.attr(''),
      order: this.attr(null),
      taxes: this.hasMany(InvoiceRowTax, 'row_id'),
      updated_at: this.attr(''),
      created_at: this.attr(''),
    };
  }
}
