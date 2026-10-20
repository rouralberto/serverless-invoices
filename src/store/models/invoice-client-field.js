import { Model } from 'pinia-orm';

export default class InvoiceClientField extends Model {
  static entity = 'invoice_client_fields';

  static fields() {
    return {
      id: this.uid(),
      invoice_id: this.attr(null),
      client_field_id: this.attr(null),
      label: this.attr(''),
      value: this.attr(''),
    };
  }
}
