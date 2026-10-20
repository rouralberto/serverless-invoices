import storage from 'localforage';
import { stripLegacyFlags, toStorable } from '@/utils/helpers';

/**
 * All data lives in the browser's IndexedDB as one document per collection:
 * `team` (object) and `clients`, `bank_accounts`, `taxes`, `invoices` (arrays).
 * S3 is only used for backups.
 */
storage.config({
  name: 'serverlessInvoices',
  version: 1.0,
  storeName: 'default',
});

// Ask the browser not to evict our data under storage pressure. Chromium decides
// silently (installed/bookmarked/frequently used sites); Firefox asks the user once.
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persisted()
    .then(isPersisted => isPersisted || navigator.storage.persist());
}

export async function load(key, fallback = null) {
  const value = await storage.getItem(key);
  return value === null ? fallback : stripLegacyFlags(value);
}

export function save(key, value) {
  return storage.setItem(key, toStorable(value));
}

export async function loadAll() {
  const keys = await storage.keys();
  const values = await Promise.all(keys.map(key => storage.getItem(key)));
  return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
}

export function saveAll(data) {
  return Promise.all(Object.entries(data).map(([key, value]) => storage.setItem(key, value)));
}
