<template>
  <div class="empty-state" :class="`text-${align}`">
    <span class="empty-state__icon">
      <i class="material-icons-round">{{ icon }}</i>
    </span>
    <p class="empty-state__text">{{ content || t('content') }}</p>
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
    icon: {
      default: 'inbox',
    },
  },
};
</script>
