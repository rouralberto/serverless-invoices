import { createRouter, createWebHistory } from 'vue-router';
import i18next from 'i18next';
import { initialized } from '@/config/i18n.config';
import { useTeamsStore } from '@/store/teams';

const loadData = () => useTeamsStore().init();

const routes = [
  {
    path: '/',
    name: 'dashboard',
    redirect: { name: 'invoices' },
    component: () => import('@/views/dashboard/Dashboard.vue'),
    beforeEnter: loadData,
    children: [
      {
        path: '/invoices',
        name: 'invoices',
        component: () => import('@/views/dashboard/Invoices.vue'),
      },
      {
        path: '/clients',
        name: 'clients',
        component: () => import('@/views/dashboard/Clients.vue'),
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
    beforeEnter: loadData,
    component: () => import('@/views/InvoicePrint.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  if (!Object.hasOwn(to.query, 'lang')) {
    await initialized;
    return { ...to, query: { ...to.query, lang: i18next.language } };
  }
});

export default router;
