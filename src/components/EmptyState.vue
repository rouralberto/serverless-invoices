<template>
  <div :class="`col-12 text-muted text-${align}`">
    <small>{{ content || t('content') }}</small>
    <h4 class="mt-2">¯\_(ツ)_/¯</h4>
    <slot></slot>
  </div>
</template>

<script>
import { useTranslation } from 'i18next-vue';

export default {
  setup() {
    return useTranslation('empty-state');
  },
  props: {
    content: {
      default: null,
    },
    align: {
      default: 'center',
    },
  },
};
</script>
