import { createRouter, createWebHistory } from 'vue-router';
import i18next from 'i18next';
import { initialized } from '@/config/i18n.config';
import config from '@/config/app.config';
import { useTeamsStore } from '@/store/teams';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    redirect: { name: 'invoices' },
    component: () => import('@/views/dashboard/Dashboard.vue'),
    beforeEnter: async () => {
      await useTeamsStore().init();
    },
    children: [
      {
        path: '/invoices',
        name: 'invoices',
        component: () => import('@/views/dashboard/Invoices.vue'),
      },
      {
        path: '/invoice/:id',
        name: 'invoice',
        component: () => import('@/views/dashboard/Invoice.vue'),
      },
    ],
  },
  {
    path: '/invoices/:id/print',
    name: 'invoice-print',
    component: () => import('@/views/InvoicePrint.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(config.base_url),
  routes,
});

router.beforeEach(async (to) => {
  if (!Object.hasOwn(to.query, 'lang')) {
    await initialized;
    return { ...to, query: { ...to.query, lang: i18next.language } };
  }
});

export default router;
