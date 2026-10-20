<template>
    <thead>
        <tr>
            <th>{{ t('item') }}</th>
            <th>{{ t('quantity') }}</th>
            <th>{{ t('unit') }}</th>
            <th>{{ t('price') }}</th>
            <th v-for="tax in taxes" :key="tax.id">
                {{ tax.label }} %
            </th>
            <th class="text-end">{{ t('sum') }}</th>
        </tr>
    </thead>
</template>

<script>
import { mapState } from 'pinia';
import { useTranslation } from 'i18next-vue';
import { useInvoiceRowsStore } from '@/store/invoice-rows';

export default {
  setup() {
    return useTranslation('invoice-rows-header');
  },
  computed: {
    ...mapState(useInvoiceRowsStore, ['taxes']),
  },
};
</script>
