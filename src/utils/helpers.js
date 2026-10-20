import dayjs from 'dayjs';
import i18next from 'i18next';

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function validate(requiredFields, input) {
  const errors = {};

  Object.entries(requiredFields).forEach(([key, value]) => {
    if (Array.isArray(input[key])) {
      input[key].forEach((subInput, index) => {
        Object.entries(value).forEach(([subKey, subValue]) => {
          const error = validateField(subInput, subKey, subValue);
          if (error) {
            errors[`${key}.${index}.${subKey}`] = error;
          }
        });
      });
    } else {
      const error = validateField(input, key, value);
      if (error) {
        errors[key] = error;
      }
    }
  });

  return { errors };
}

export function validateField(input, field, label) {
  if (!Object.hasOwn(input, field) || input[field] === null || input[field].length === 0) {
    return [`${label} is required`];
  }
  return null;
}

const LEGACY_FLAGS = ['$id', '$isNew', '$isDirty'];

/**
 * Removes the bookkeeping flags the old Vuex ORM left on records, at any depth.
 */
export function stripLegacyFlags(value) {
  if (Array.isArray(value)) {
    return value.map(stripLegacyFlags);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !LEGACY_FLAGS.includes(key))
      .map(([key, val]) => [key, stripLegacyFlags(val)]));
  }
  return value;
}

/**
 * Returns a plain copy that is safe to persist: no reactive proxies (IndexedDB can't clone them).
 */
export function toStorable(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Invoice numbers are the issue date plus a counter for that day: 20261001-1, 20261001-2, ...
 */
export function generateInvoiceNumber(invoices, date = dayjs()) {
  const prefix = `${dayjs(date).format('YYYYMMDD')}-`;
  const lastNumberToday = invoices
    .map(invoice => String(invoice.number || ''))
    .filter(number => number.startsWith(prefix))
    .map(number => parseInt(number.slice(prefix.length), 10))
    .filter(number => !Number.isNaN(number))
    .reduce((max, number) => Math.max(max, number), 0);
  return `${prefix}${lastNumberToday + 1}`;
}

export function download(data, filename, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

function s3ObjectUrl(bucket, region, key) {
  const path = key.split('/').map(encodeURIComponent).join('/');
  // Buckets with dots break the virtual-hosted TLS certificate, so use path-style for those.
  return bucket.includes('.')
    ? `https://s3.${region}.amazonaws.com/${bucket}/${path}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
}

export async function storeInBucket(data, filename, type) {
  const timestamp = new Date().toISOString();
  const filenameWithTimestamp = `${timestamp}-${filename}`;
  const region = import.meta.env.VUE_APP_AWS_REGION;

  try {
    const { AwsClient } = await import('aws4fetch');
    const aws = new AwsClient({
      accessKeyId: import.meta.env.VUE_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VUE_APP_AWS_SECRET_ACCESS_KEY,
      region,
      service: 's3',
    });
    const url = s3ObjectUrl(import.meta.env.VUE_APP_BUCKET_NAME, region, `serverless-invoices/${filenameWithTimestamp}`);
    const res = await aws.fetch(url, {
      method: 'PUT',
      body: data,
      headers: { 'Content-Type': type },
    });
    if (!res.ok) {
      throw new Error(`S3 responded ${res.status}: ${await res.text()}`);
    }

    alert(i18next.t('invoices:backup_saved'));
    return filenameWithTimestamp;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    alert(i18next.t('invoices:backup_failed'));
    throw error;
  }
}
