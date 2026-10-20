import { notify } from '@kyvg/vue3-notification';

/**
 * Modal dialogs live in the browser's top layer, above anything else on the page.
 * Showing the toast container as a popover (and re-showing it whenever a dialog opens)
 * keeps toasts visible on top of them.
 */
export function raiseToasts() {
  const group = document.querySelector('.vue-notification-group');
  if (!group || !group.showPopover) {
    return;
  }
  group.popover = 'manual';
  if (group.matches(':popover-open')) {
    group.hidePopover();
  }
  group.showPopover();
}

class NotificationService {
  success(text) {
    return notify({
      type: 'success',
      text,
    });
  }

  error(text, duration = 5000) {
    return notify({
      type: 'error',
      text,
      duration,
    });
  }
}

export default new NotificationService();
