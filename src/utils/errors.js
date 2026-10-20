export default class Errors {
  constructor(errors) {
    this.errors = errors;
  }

  set(errors) {
    this.errors = errors;
  }

  get(field) {
    if (this.has(field)) {
      return this.errors[field];
    }
    return null;
  }

  has(field) {
    return this.errors && Object.hasOwn(this.errors, field);
  }

  clear() {
    this.errors = {};
  }
}
