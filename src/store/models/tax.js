import { Model } from 'pinia-orm';

export default class Tax extends Model {
  static entity = 'taxes';

  static fields() {
    return {
      id: this.uid(),
      label: this.attr(''),
      value: this.attr(''),
    };
  }
}
