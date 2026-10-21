<template>
    <span class="date-picker">
        <span class="editable__item" @click="open">{{ displayValue }}</span>
        <input ref="input"
               type="date"
               class="date-picker__input"
               :id="field"
               :value="value"
               tabindex="-1"
               aria-hidden="true"
               @change="onChange">
        <AppError v-if="errors" :errors="errors" :field="field"/>
    </span>
</template>

<script>
import AppError from '@/components/form/AppError.vue';
import { formatDate } from '@/utils/format';

/**
 * Shows a date as text and opens the browser's native date picker when clicked.
 */
export default {
  components: {
    AppError,
  },
  props: {
    value: {},
    field: {},
    errors: {},
    displayFormat: { default: 'D. MMM YYYY' },
  },
  emits: ['change'],
  computed: {
    displayValue() {
      // Reading the language makes this re-render when it changes (month names are localised).
      return this.$i18next.language && formatDate(this.value, this.displayFormat, 'YYYY-MM-DD');
    },
  },
  beforeUnmount() {
    this.stopWatchingOutside();
  },
  methods: {
    open() {
      const { input } = this.$refs;
      // Focused, so that leaving it is a blur: some browsers (Safari) only close the picker then.
      input.focus({ preventScroll: true });
      try {
        input.showPicker();
      } catch {
        // Focus alone has to do.
      }
      document.addEventListener('pointerdown', this.onPointerDown, true);
    },
    close() {
      const { input } = this.$refs;
      this.stopWatchingOutside();
      input.blur();
      // Taking the input out of the layout for a moment closes the picker in every browser.
      input.style.display = 'none';
      void input.offsetWidth;
      input.style.display = '';
    },
    onPointerDown(event) {
      if (event.target !== this.$refs.input) {
        this.close();
      }
    },
    stopWatchingOutside() {
      document.removeEventListener('pointerdown', this.onPointerDown, true);
    },
    onChange(event) {
      this.$emit('change', event.target.value || null);
    },
  },
};
</script>
