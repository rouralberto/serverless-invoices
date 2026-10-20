<template>
    <div>
        <div class="row">
            <div class="col-12 d-flex justify-content-between">
                <h4>{{ t('title') }}</h4>
                <div v-if="client">
                    <div v-if="!isNew">
                        <AppDropdown size="sm">
                            <template #button-content>
                                <i class="material-icons">more_vert</i>
                            </template>
                            <li><button type="button" class="dropdown-item" @click="deleteClient">{{ t('delete') }}</button></li>
                        </AppDropdown>
                        <button class="btn btn-sm btn-primary"
                                @click="$emit('done')">{{ t('done') }}
                        </button>
                    </div>
                    <button v-else class="btn btn-primary ms-2"
                            :disabled="loading"
                            @click="createClient">{{ t('create') }}
                    </button>
                </div>
            </div>
        </div>

        <AppTabs v-if="client"
                 :tabs="[
                   { key: 'general', title: t('tabs.general') },
                   { key: 'invoicing', title: t('tabs.invoicing') },
                   { key: 'address', title: t('tabs.address') },
                 ]"
                 nav-class="nav-tabs--simple mb-4"
                 nav-wrapper-class="px-0"
                 content-class="col-12"
                 class="row">
            <template #general>
                <div class="row">
                    <AppInput :value="client.company_name" @change="updateProp({ company_name: $event })"
                              :label="t('general.company_name')" field="company_name" :errors="errors" class="col-12"/>
                    <AppInput :value="client.invoice_email" @change="updateProp({ invoice_email: $event })"
                              :label="t('general.invoice_email')" field="invoice_email" :errors="errors"
                              class="col-sm-7"/>
                </div>

                <ClientFields class="row" :client="client"/>
            </template>

            <template #invoicing>
                <div class="row">
                    <AppInput :value="client.currency" @change="updateProp({ currency: $event })"
                              :label="t('invoicing.currency')" field="currency" :errors="errors" class="col-sm-4"/>
                    <AppInput :value="client.rate" @change="updateProp({ rate: $event })"
                              :label="t('invoicing.rate')" field="rate" :errors="errors" class="col-sm-4"/>
                    <AppCheckbox :value="client.has_tax" @input="updateProp({ has_tax: $event })"
                                 :label="t('invoicing.has_tax')" field="has_tax" :errors="errors" class="col-sm-4"/>
                    <AppSelect :value="bankAccount"
                               track-by="id"
                               :label="t('invoicing.bank_account')"
                               label-field="bank_name"
                               :options="bankAccounts"
                               @input="bankAccountChanged"
                               class="col-12"/>
                </div>
            </template>

            <template #address>
                <div class="row">
                    <AppInput :value="client.company_address" @change="updateProp({ company_address: $event })"
                              :label="t('address.company_address')" field="company_address" :errors="errors"
                              class="col-12"/>
                    <AppInput :value="client.company_postal_code"
                              @change="updateProp({ company_postal_code: $event })"
                              :label="t('address.company_postal_code')" field="company_postal_code" :errors="errors"
                              class="col-sm-5"/>
                    <AppInput :value="client.company_city" @change="updateProp({ company_city: $event })"
                              :label="t('address.company_city')" field="company_city" :errors="errors"
                              class="col-sm-7"/>
                    <AppInput :value="client.company_county" @change="updateProp({ company_county: $event })"
                              :label="t('address.company_county')" field="company_county" :errors="errors"
                              class="col-sm-6"/>
                    <AppInput :value="client.company_country" @change="updateProp({ company_country: $event })"
                              :label="t('address.company_country')" field="company_country" :errors="errors"
                              class="col-sm-6"/>
                </div>
            </template>

        </AppTabs>

        <div v-if="!client">{{ t('loading') }}</div>
    </div>
</template>
<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import NotificationService from '@/services/notification.service';
import ConfirmService from '@/services/confirm.service';
import AppInput from '@/components/form/AppInput.vue';
import AppSelect from '@/components/form/AppSelect.vue';
import AppCheckbox from '@/components/form/AppCheckbox.vue';
import AppDropdown from '@/components/ui/AppDropdown.vue';
import AppTabs from '@/components/ui/AppTabs.vue';
import ClientFields from '@/components/clients/ClientFields.vue';
import Errors from '@/utils/errors';
import { useBankAccountsStore } from '@/store/bank-accounts';
import { useClientsStore } from '@/store/clients';

export default {
  setup() {
    return useTranslation('client-form');
  },
  emits: ['done'],
  components: {
    AppCheckbox,
    AppDropdown,
    AppInput,
    AppSelect,
    AppTabs,
    ClientFields,
  },
  data() {
    return {
      errors: new Errors(),
      loading: false,
    };
  },
  computed: {
    ...mapStores(useClientsStore, useBankAccountsStore),
    ...mapState(useClientsStore, ['client', 'isDraft']),
    ...mapState(useBankAccountsStore, { bankAccounts: 'all' }),
    isNew() {
      return this.isDraft;
    },
    bankAccount() {
      return this.bankAccountsStore.find(this.client.bank_account_id);
    },
  },
  methods: {
    async updateProp(props) {
      await this.clientsStore.updateClient(this.client.id, props);
      if (!this.isNew) {
        NotificationService.success(this.t('notification_updated'));
      }
    },
    bankAccountChanged(bankAccount) {
      this.updateProp({ bank_account_id: bankAccount ? bankAccount.id : null });
    },
    async createClient() {
      this.loading = true;
      await this.clientsStore.createDraftClient();
      this.loading = false;
      this.$emit('done');
    },
    async deleteClient() {
      const confirmed = await ConfirmService.confirm(`${this.t('delete_modal.title')} ${this.client.company_name}?`, {
        okTitle: this.t('delete_modal.ok_title'),
        okVariant: 'danger',
        cancelTitle: this.t('delete_modal.cancel_title'),
      });
      if (confirmed) {
        const clientId = this.client.id;
        this.$emit('done');
        await this.clientsStore.deleteClient(clientId);
        NotificationService.success(this.t('notification_deleted'));
      }
    },
  },
};
</script>
