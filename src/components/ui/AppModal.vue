<template>
    <dialog ref="dialog"
            class="modal app-modal"
            @cancel.prevent="close"
            @close="close"
            @mousedown="pressedOnBackdrop = $event.target === $refs.dialog"
            @click="onClick">
        <div v-if="modelValue"
             class="modal-dialog"
             :class="{
               [`modal-${size}`]: size !== 'md',
               'modal-dialog-centered': centered,
               'modal-dialog-scrollable': scrollable,
             }">
            <div class="modal-content" :class="contentClass">
                <div v-if="!noHeader" class="modal-header">
                    <h5 class="modal-title">{{ title }}</h5>
                    <button type="button" class="btn-close" :aria-label="$t('common:close')" @click="close"></button>
                </div>
                <div class="modal-body">
                    <slot/>
                </div>
                <div v-if="$slots.footer" class="modal-footer">
                    <slot name="footer"/>
                </div>
            </div>
        </div>
    </dialog>
</template>

<script>
import { raiseToasts } from '@/services/notification.service';

/**
 * A Bootstrap-styled modal on top of the native <dialog> element, which handles the
 * backdrop, focus trapping and Escape. Content is only rendered while it is open.
 */
export default {
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    size: { type: String, default: 'md' },
    centered: { type: Boolean, default: false },
    scrollable: { type: Boolean, default: false },
    noHeader: { type: Boolean, default: false },
    contentClass: { default: null },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      pressedOnBackdrop: false,
    };
  },
  watch: {
    modelValue(open) {
      this.sync(open);
    },
  },
  mounted() {
    this.sync(this.modelValue);
  },
  beforeUnmount() {
    this.sync(false);
  },
  methods: {
    sync(open) {
      const { dialog } = this.$refs;
      if (open && !dialog.open) {
        dialog.showModal();
        raiseToasts();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    },
    close() {
      if (this.modelValue) {
        this.$emit('update:modelValue', false);
      }
    },
    onClick(event) {
      // Clicks outside the content land on the dialog itself; ignore drags that started inside.
      if (event.target === this.$refs.dialog && this.pressedOnBackdrop) {
        this.close();
      }
    },
  },
};
</script>
