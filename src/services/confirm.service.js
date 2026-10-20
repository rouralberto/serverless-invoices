/**
 * Replacement for BootstrapVue's `$bvModal.msgBoxConfirm`. The modal controller
 * has to be created inside a component, so App.vue hands it over on setup.
 */
class ConfirmService {
  modal = null;

  init(modal) {
    this.modal = modal;
  }

  async confirm(message, options = {}) {
    const event = await this.modal.create({
      body: message,
      noHeader: true,
      contentClass: 'bg-base dp--24',
      ...options,
    }).show();
    return event.ok === true;
  }
}

export default new ConfirmService();
