import { reactive } from 'vue';
import i18next from 'i18next';

/**
 * State for the single <AppConfirm> mounted in App.vue.
 */
export const confirmState = reactive({
  open: false,
  message: '',
  okTitle: '',
  okVariant: 'primary',
  cancelTitle: '',
  resolve: null,
});

class ConfirmService {
  /**
   * Shows a confirmation dialog and resolves to true when the user confirms.
   */
  confirm(message, {
    okTitle = i18next.t('common:ok'),
    okVariant = 'primary',
    cancelTitle = i18next.t('common:cancel'),
  } = {}) {
    return new Promise((resolve) => {
      Object.assign(confirmState, {
        open: true, message, okTitle, okVariant, cancelTitle, resolve,
      });
    });
  }

  answer(confirmed) {
    const { resolve } = confirmState;
    Object.assign(confirmState, { open: false, resolve: null });
    if (resolve) {
      resolve(confirmed);
    }
  }
}

export default new ConfirmService();
