<template>
    <AppModal :model-value="state.open"
              no-header
              content-class="bg-base dp--24"
              @update:model-value="answer(false)">
        {{ state.message }}
        <template #footer>
            <button type="button" class="btn btn-link" @click="answer(false)">{{ state.cancelTitle }}</button>
            <button type="button" class="btn" :class="`btn-${state.okVariant}`" @click="answer(true)">{{ state.okTitle }}</button>
        </template>
    </AppModal>
</template>

<script>
import ConfirmService, { confirmState } from '@/services/confirm.service';
import AppModal from '@/components/ui/AppModal.vue';

export default {
  components: { AppModal },
  data() {
    return { state: confirmState };
  },
  methods: {
    answer(confirmed) {
      ConfirmService.answer(confirmed);
    },
  },
};
</script>
