import { Relation } from 'pinia-orm';
import { stripOrmFlags } from '@/utils/helpers';

/**
 * Keeps only the model's own attributes, dropping relations and unknown keys,
 * so updating a record never re-parents or overwrites related records.
 */
export function attributesOnly(repo, props) {
  const fields = repo.getModel().$fields();
  return Object.fromEntries(Object.entries(props || {})
    .filter(([key]) => fields[key] && !(fields[key] instanceof Relation)));
}

export function updateRecord(repo, id, props) {
  // `save` would create a record for an unknown id; updating a missing record is a no-op.
  if (id === null || id === undefined || !repo.find(id)) {
    return null;
  }
  repo.save({ id, ...attributesOnly(repo, props) });
  return repo.find(id);
}

/**
 * Marks records loaded from storage as persisted. `save` merges with existing
 * records, so the flag has to be reset explicitly.
 */
export function persisted(records) {
  const clean = stripOrmFlags(records);
  return Array.isArray(clean)
    ? clean.map(record => ({ ...record, $isNew: false }))
    : { ...clean, $isNew: false };
}

export function replaceAll(repo, records) {
  repo.flush();
  return repo.save(persisted(records));
}

export function createNew(repo, props = {}) {
  return repo.save({ ...props, $isNew: true });
}
