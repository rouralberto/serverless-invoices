import local from '@/services/adapters/local.adapter';

// All data lives in the browser (IndexedDB); S3 is only used for backups.
export default local;
