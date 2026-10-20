<template>
    <div>
        <label :for="field" :class="labelClasses" v-if="label">{{ label }}</label>
        <div :class="containerClasses">
            <VueDatePicker :disabled="disabled"
                           :inline="inline"
                           :class="[
                               errors && errors.has(field) ? 'is-invalid' : '',
                               inputClasses,
                               ]"
                           :placeholder="placeholder"
                           auto-apply
                           :week-start="1"
                           :time-config="{ enableTimePicker: type === 'datetime' }"
                           :formats="{ input: formatInput }"
                           :range="mode === 'range'"
                           :model-value="inputValue"
                           @update:model-value="outputValue"/>
            <slot></slot>
            <AppError v-if="errors" :errors="errors" :field="field"/>
        </div>
    </div>
</template>

<script>
import dayjs from 'dayjs';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import AppError from '@/components/form/AppError.vue';

export default {
  components: {
    AppError,
    VueDatePicker,
  },
  props: {
    errors: {},
    label: {},
    mode: {},
    value: {},
    field: {},
    disabled: {},
    inline: {
      default: false,
    },
    format: {
      default: 'YYYY-MM-DD',
    },
    modelFormat: {
      default: 'YYYY-MM-DD',
    },
    type: {},
    placeholder: {},
    labelClasses: {},
    inputClasses: {},
    containerClasses: {},
  },
  emits: ['input', 'change'],
  computed: {
    inputValue() {
      return Array.isArray(this.value)
        ? this.value.map(val => dayjs(val, this.modelFormat).toDate())
        : dayjs(this.value, this.modelFormat).toDate();
    },
  },
  methods: {
    formatInput(date) {
      return Array.isArray(date)
        ? date.map(val => dayjs(val).format(this.format)).join(' - ')
        : dayjs(date).format(this.format);
    },
    outputValue(event) {
      const value = Array.isArray(event)
        ? event.map(val => this.toModelFormat(val))
        : this.toModelFormat(event);
      this.$emit('input', value);
      this.$emit('change', value);
    },
    toModelFormat(val) {
      return val ? dayjs(val).format(this.modelFormat) : null;
    },
  },
};
</script>
