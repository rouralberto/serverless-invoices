<template>
    <div v-if="team">
        <InvoiceControls class="d-print-none"/>
        <InvoiceForm/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import InvoiceForm from '@/components/invoices/InvoiceForm.vue';
import InvoiceControls from '@/components/invoices/InvoiceControls.vue';
import { useTeamsStore } from '@/store/teams';

export default {
  name: 'invoice',
  components: {
    InvoiceControls,
    InvoiceForm,
  },
  computed: {
    ...mapState(useTeamsStore, ['team']),
  },
};
</script>
