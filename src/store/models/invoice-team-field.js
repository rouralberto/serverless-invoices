import { Model } from 'pinia-orm';

export default class InvoiceTeamField extends Model {
  static entity = 'invoice_team_fields';

  static fields() {
    return {
      id: this.uid(),
      invoice_id: this.attr(null),
      team_field_id: this.attr(null),
      label: this.attr(''),
      value: this.attr(''),
    };
  }
}
