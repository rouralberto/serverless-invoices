<template>
    <div>
        <strong>
            <AppEditable :value="invoice.bank_name"
                         @click="isModalOpen = true"
                         :errors="errors"
                         :disabled="true"
                         field="bank_name"
                         :placeholder="t('bank_name')"
                         class="break-line"/>
        </strong>
        <AppEditable :value="invoice.bank_account_no"
                     @click="isModalOpen = true"
                     :errors="errors"
                     :disabled="true"
                     field="bank_account_no"
                     :placeholder="t('bank_account_no')"
                     class="break-line"/>
        <BModal v-model="isModalOpen"
                centered
                :title="t('bank_account_modal_title')"
                no-footer
                size="lg"
                content-class="bg-base dp--24">
           <BankAccountsList @select="accountSelected"/>
        </BModal>
    </div>
</template>
<script>
import { BModal } from 'bootstrap-vue-next';
import { useTranslation } from 'i18next-vue';
import BankAccountsList from '@/components/bank-accounts/BankAccountsList.vue';
import AppEditable from '@/components/form/AppEditable.vue';

export default {
  setup() {
    return useTranslation('invoice-bank-details');
  },
  props: ['invoice', 'errors'],
  emits: ['update'],
  components: {
    AppEditable,
    BModal,
    BankAccountsList,
  },
  data() {
    return {
      isModalOpen: false,
    };
  },
  methods: {
    accountSelected(account) {
      this.$emit('update', {
        bank_account_no: account.account_no,
        bank_name: account.bank_name,
        bank_account_id: account.id,
      });
      this.isModalOpen = false;
    },
  },
};
</script>
