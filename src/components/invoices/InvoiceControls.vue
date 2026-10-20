<template>
    <div class="row" v-if="invoice">
        <div class="col-12 mb-4 d-flex justify-content-between align-items-start">
            <router-link class="btn btn-sm btn-light btn--icon-left"
                         :to="{name: 'invoices'}">
                <i class="material-icons">arrow_back</i>
                <span class="d-inline-block">{{ t('back') }}</span>
            </router-link>
            <div class="d-flex align-items-center">
                <AppSelect :value="getStatusObj"
                           class="mb-0 me-2 text-capitalize multiselect--capitalize"
                           :options="invoiceStatuses"
                           label-field="name"
                           @input="updateProp({status: $event.value})"/>
                <button class="btn btn-outline-dark"
                        v-if="invoice.status === 'draft'"
                        @click="bookInvoice">{{ t('book') }}
                </button>
                <BDropdown variant="link" no-caret placement="bottom-end">
                    <template #button-content>
                        <i class="material-icons">more_vert</i>
                    </template>
                    <BDropdownGroup :header="t('design_and_layout')">
                        <BDropdownItemButton @click="toggleCompact">
                            {{ invoice.is_compact ? t('comfortable') : t('compact') }}
                        </BDropdownItemButton>
                        <BDropdownItemButton @click="openCustomizationsModal">
                            {{ t('customize') }}
                        </BDropdownItemButton>
                    </BDropdownGroup>
                    <BDropdownDivider/>
                    <BDropdownItemButton @click="print">{{ t('download_pdf') }}</BDropdownItemButton>
                    <BDropdownItemButton @click="deleteInvoice">{{ t('delete') }}</BDropdownItemButton>
                </BDropdown>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import {
  BDropdown,
  BDropdownDivider,
  BDropdownGroup,
  BDropdownItemButton,
} from 'bootstrap-vue-next';
import { useTranslation } from 'i18next-vue';
import NotificationService from '@/services/notification.service';
import ConfirmService from '@/services/confirm.service';
import AppSelect from '@/components/form/AppSelect.vue';
import { useInvoicesStore } from '@/store/invoices';

export default {
  setup() {
    return useTranslation(['invoice-controls', 'statuses']);
  },
  components: {
    BDropdown,
    BDropdownDivider,
    BDropdownItemButton,
    BDropdownGroup,

    AppSelect,
  },
  computed: {
    ...mapStores(useInvoicesStore),
    ...mapState(useInvoicesStore, ['invoice']),
    getStatusObj() {
      return this.invoiceStatuses
        .find(obj => obj.value === this.invoice.status);
    },
    invoiceStatuses() {
      return [{
        value: 'draft',
        name: this.t('statuses.draft'),
      }, {
        value: 'booked',
        name: this.t('statuses.booked'),
      }, {
        value: 'sent',
        name: this.t('statuses.sent'),
      }, {
        value: 'paid',
        name: this.t('statuses.paid'),
      }, {
        value: 'written_off',
        name: this.t('statuses.written_off'),
      }, {
        value: 'cancelled',
        name: this.t('statuses.cancelled'),
      }];
    },
  },
  methods: {
    async deleteInvoice() {
      const confirmed = await ConfirmService.confirm(`${this.t('delete_modal.title')} ${this.invoice.number}?`, {
        okTitle: this.t('delete_modal.ok_title'),
        okVariant: 'danger',
        cancelTitle: this.t('delete_modal.cancel_title'),
        cancelVariant: 'btn-link',
        contentClass: 'bg-base dp--24',
      });
      if (confirmed) {
        await this.invoicesStore.deleteInvoice(this.invoice);
        NotificationService.success('Deleted');
        this.$router.push({
          name: 'invoices',
        });
      }
    },
    bookInvoice() {
      this.invoicesStore.bookInvoice();
    },
    updateProp(props) {
      this.invoicesStore.updateInvoice({
        props,
        invoiceId: this.invoice.id,
      });
    },
    toggleCompact() {
      this.updateProp({ is_compact: !this.invoice.is_compact });
    },
    openCustomizationsModal() {
      this.invoicesStore.isCustomizationsModalOpen = true;
    },
    print() {
      window.print();
    },
  },
};
</script>
