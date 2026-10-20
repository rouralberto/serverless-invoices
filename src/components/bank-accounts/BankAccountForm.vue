<template>
    <div>
        <div class="row">
            <div class="col-12">
                <h4>{{ t('title') }}</h4>
            </div>
        </div>
        <div v-if="bankAccount" class="row">
            <AppInput :value="bankAccount.bank_name"
                      @change="updateProp({ bank_name: $event })"
                      :label="t('bank_name')"
                      field="bank_name"
                      :errors="errors"
                      class="col-sm-10"/>
            <AppTextarea :value="bankAccount.account_no"
                         @change="updateProp({ account_no: $event })"
                         :label="t('account_no')"
                         field="account_no"
                         :errors="errors"
                         class="col-12"/>
        </div>

        <div v-else class="row">
            <div class="col-12 pt-3">
                <p>{{ t('loading') }} ..</p>
            </div>
        </div>

        <div class="row mt-3 text-end">
            <div class="col-12">
                <button v-if="!isNew" class="btn btn-primary"
                        @click="$emit('done')">{{ t('done') }}
                </button>
                <button v-if="isNew" class="btn btn-primary ms-2"
                        :disabled="loading"
                        @click="createBankAccount">{{ t('create') }}
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import NotificationService from '@/services/notification.service';
import AppInput from '@/components/form/AppInput.vue';
import AppTextarea from '@/components/form/AppTextarea.vue';
import Errors from '@/utils/errors';
import { useBankAccountsStore } from '@/store/bank-accounts';

export default {
  setup() {
    return useTranslation('bank-account-form');
  },
  emits: ['done'],
  components: {
    AppInput,
    AppTextarea,
  },
  data() {
    return {
      errors: new Errors(),
      loading: false,
    };
  },
  computed: {
    ...mapStores(useBankAccountsStore),
    ...mapState(useBankAccountsStore, ['bankAccount', 'isDraft']),
    isNew() {
      return this.isDraft;
    },
  },
  methods: {
    async updateProp(props) {
      await this.bankAccountsStore.updateBankAccount(props);
      if (!this.isNew) {
        NotificationService.success(this.t('notification_updated'));
      }
    },
    async createBankAccount() {
      this.loading = true;
      await this.bankAccountsStore.createBankAccount();
      this.loading = false;
      this.$emit('done');
    },
  },
};
</script>
