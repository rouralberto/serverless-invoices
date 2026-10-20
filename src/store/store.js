import { createPinia } from 'pinia';
import { createORM } from 'pinia-orm';

const pinia = createPinia();

// Namespace the ORM's entity stores so they don't clash with the app's own stores (clients, invoices, ...).
pinia.use(createORM({ model: { namespace: 'orm' } }));

export default pinia;
