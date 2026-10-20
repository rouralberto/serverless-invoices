import storage from 'localforage';

storage.config({
  name: 'serverlessInvoices',
  version: 1.0,
  storeName: 'default',
});

// Ask the browser not to evict our IndexedDB data under storage pressure. Chromium decides
// silently (installed/bookmarked/frequently used sites); Firefox asks the user once.
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persisted()
    .then(isPersisted => isPersisted || navigator.storage.persist());
}
