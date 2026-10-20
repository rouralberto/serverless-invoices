<template>
    <div class="form-group">
        <label :for="field" v-if="label">{{ label }}</label>
        <select :id="field"
                class="form-select"
                :class="{ 'is-invalid': errors && errors.has(field) }"
                :disabled="disabled"
                @change="onChange">
            <option v-if="selectedIndex === -1" value="" disabled selected hidden>{{ placeholder }}</option>
            <option v-for="(option, index) in options"
                    :key="trackBy ? option[trackBy] : index"
                    :value="index"
                    :selected="index === selectedIndex">
                {{ labelField ? option[labelField] : option }}
            </option>
        </select>
        <AppError v-if="errors" :errors="errors" :field="field"/>
    </div>
</template>

<script>
import AppError from '@/components/form/AppError.vue';

/**
 * Native select over a list of options (objects or plain values); emits the chosen option.
 */
export default {
  components: {
    AppError,
  },
  props: {
    errors: {},
    label: {},
    value: {},
    field: {},
    options: { type: Array, default: () => [] },
    trackBy: {},
    labelField: {},
    placeholder: { default: '' },
    disabled: { default: false },
  },
  emits: ['input'],
  computed: {
    selectedIndex() {
      if (this.value === null || this.value === undefined) {
        return -1;
      }
      return this.options.findIndex(option => (this.trackBy
        ? option[this.trackBy] === this.value[this.trackBy]
        : option === this.value));
    },
  },
  methods: {
    onChange(event) {
      this.$emit('input', this.options[Number(event.target.value)]);
    },
  },
};
</script>
