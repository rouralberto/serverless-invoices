import { Model } from 'pinia-orm';

export default class ClientField extends Model {
  static entity = 'client_fields';

  static fields() {
    return {
      id: this.uid(),
      client_id: this.attr(null),
      label: this.attr(''),
      value: this.attr(''),
    };
  }
}
