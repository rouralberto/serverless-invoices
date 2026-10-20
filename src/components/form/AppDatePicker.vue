<template>
    <span class="date-picker">
        <span class="editable__item" @click="open">{{ formatDate(value, displayFormat, 'YYYY-MM-DD') }}</span>
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
  methods: {
    formatDate,
    open() {
      const { input } = this.$refs;
      try {
        input.showPicker();
      } catch {
        input.focus();
      }
    },
    onChange(event) {
      this.$emit('change', event.target.value || null);
    },
  },
};
</script>
