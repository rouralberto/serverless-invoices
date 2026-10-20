import { Model } from 'pinia-orm';

export default class TeamField extends Model {
  static entity = 'team_fields';

  static fields() {
    return {
      id: this.uid(),
      team_id: this.attr(null),
      label: this.attr(''),
      value: this.attr(''),
    };
  }
}
