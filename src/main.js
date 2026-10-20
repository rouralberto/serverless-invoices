import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/material-icons';
import '@fontsource/material-icons-round';
import { createApp } from 'vue';
import Notifications from '@kyvg/vue3-notification';
import I18NextVue from 'i18next-vue';
import App from '@/App.vue';
import router from '@/router';
import pinia from '@/store/store';
import i18next, { initialized } from '@/config/i18n.config';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(I18NextVue, { i18next });
app.use(Notifications);

// Mount once translations are in, so the first render isn't blank.
initialized.then(() => app.mount('#app'));

export default app;
