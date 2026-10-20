import '@/config/local-storage.config';
import { createApp } from 'vue';
import { createBootstrap } from 'bootstrap-vue-next';
import Notifications from '@kyvg/vue3-notification';
import I18NextVue from 'i18next-vue';
import App from '@/App.vue';
import router from '@/router';
import pinia from '@/store/store';
import i18next from '@/config/i18n.config';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(I18NextVue, { i18next });
app.use(createBootstrap({
  components: {
    // Keep dropdowns inline like BootstrapVue's `btn-group` wrapper did.
    BDropdown: { wrapperClass: 'btn-group' },
    // Like BootstrapVue, only render modal content while the modal is shown.
    BModal: { lazy: true, unmountLazy: true },
  },
}));
app.use(Notifications);

app.mount('#app');

export default app;
