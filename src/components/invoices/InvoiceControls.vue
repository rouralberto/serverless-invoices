<template>
    <div class="editor-toolbar" v-if="invoice">
        <div class="editor-toolbar__start">
            <router-link class="btn-icon" :to="{ name: 'invoices' }" :title="t('back')">
                <i class="material-icons-round md-20">arrow_back</i>
            </router-link>
            <div>
                <div class="editor-toolbar__title">{{ t('invoice-header:invoice_title') }} {{ invoice.number }}</div>
                <span class="status-pill" :class="`status-pill--${invoice.status}`">{{ t(`statuses.${invoice.status}`) }}</span>
            </div>
        </div>
        <div class="editor-toolbar__end">
            <AppSelect :value="getStatusObj"
                       class="mb-0 text-capitalize"
                       :options="invoiceStatuses"
                       track-by="value"
                       label-field="name"
                       @input="updateProp({status: $event.value})"/>
            <button class="btn btn-outline-secondary"
                    v-if="invoice.status === 'draft'"
                    @click="bookInvoice">
                <i class="material-icons-round md-18">bookmark_added</i>
                {{ t('book') }}
            </button>
            <button class="btn btn-primary" @click="print">
                <i class="material-icons-round md-18">picture_as_pdf</i>
                {{ t('download_pdf') }}
            </button>
            <AppDropdown toggle-class="btn-icon">
                <template #button-content>
                    <i class="material-icons-round md-20">more_vert</i>
                </template>
                <li><h6 class="dropdown-header">{{ t('design_and_layout') }}</h6></li>
                <li>
                    <button type="button" class="dropdown-item" @click="toggleCompact">
                        <i class="material-icons-round md-18">{{ invoice.is_compact ? 'density_medium' : 'density_small' }}</i>
                        {{ invoice.is_compact ? t('comfortable') : t('compact') }}
                    </button>
                </li>
                <li>
                    <button type="button" class="dropdown-item" @click="openCustomizationsModal">
                        <i class="material-icons-round md-18">palette</i>{{ t('customize') }}
                    </button>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <button type="button" class="dropdown-item text-danger" @click="deleteInvoice">
                        <i class="material-icons-round md-18">delete</i>{{ t('delete') }}
                    </button>
                </li>
            </AppDropdown>
        </div>
    </div>
</template>

<script>
import { mapState, mapStores } from 'pinia';
import { useTranslation } from 'i18next-vue';
import NotificationService from '@/services/notification.service';
import ConfirmService from '@/services/confirm.service';
import AppSelect from '@/components/form/AppSelect.vue';
import AppDropdown from '@/components/ui/AppDropdown.vue';
import { useInvoicesStore } from '@/store/invoices';

export default {
  setup() {
    return useTranslation(['invoice-controls', 'statuses', 'invoice-header']);
  },
  components: {
    AppDropdown,
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
      });
      if (confirmed) {
        await this.invoicesStore.deleteInvoice(this.invoice.id);
        NotificationService.success(this.t('notification_deleted'));
        this.$router.push({
          name: 'invoices',
        });
      }
    },
    bookInvoice() {
      this.invoicesStore.bookInvoice(this.invoice.id);
    },
    updateProp(props) {
      this.invoicesStore.updateInvoice(this.invoice.id, props);
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
