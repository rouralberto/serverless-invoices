/* eslint-disable */
import dayjs from 'dayjs';

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function range(end, start = 0, step = 1) {
  const arr = [];
  for (let i = start; i < end; i += step) {
    arr.push(i);
  }
  return arr;
}

/**
 * Returns a subset of the object based on a map of keys
 *
 * @param obj
 * @param map
 */
export function pick(obj, map) {
  const pickedKeys = Object.keys(obj)
    .filter(field => Object.hasOwn(map, field));
  const objSubset = {};
  pickedKeys.forEach((key) => {
    objSubset[map[key]] = obj[key];
  });
  return objSubset;
}


export function validate(requiredFields, input) {
  const errors = {};

  for (let [key, value] of Object.entries(requiredFields)) {
    if (Array.isArray(input[key])) {
      input[key].forEach((subInput, index) => {
        for (let [subKey, subValue] of Object.entries(value)) {
          const error = validateField(subInput, subKey, subValue);
          if (error) {
            errors[`${key}.${index}.${subKey}`] = error;
          }
        }
      });
    } else {
      const error = validateField(input, key, value);
      if (error) {
        errors[key] = error;
      }
    }
  }

  return { errors };
}

export function validateField(input, field, label) {
  if (!Object.hasOwn(input, field) || input[field] === null || input[field].length === 0) {
    return [`${label} is required`];
  }
  return null;
}

const ORM_FLAGS = ['$id', '$isNew', '$isDirty'];

/**
 * Removes ORM bookkeeping flags at any depth. Data saved by the old Vuex ORM
 * still carries them on nested records, and `$isDirty` would shadow the
 * pinia-orm model method of the same name.
 */
export function stripOrmFlags(value) {
  if (Array.isArray(value)) {
    return value.map(stripOrmFlags);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !ORM_FLAGS.includes(key))
      .map(([key, val]) => [key, stripOrmFlags(val)]));
  }
  return value;
}

/**
 * Returns a plain copy of a model that is safe to persist: no reactive proxies
 * (IndexedDB can't clone them) and no ORM bookkeeping flags.
 */
export function toStorable(obj) {
  return stripOrmFlags(JSON.parse(JSON.stringify(obj)));
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
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob) // IE10+
  {
    window.navigator.msSaveOrOpenBlob(file, filename);
  } else { // Others
    var a = document.createElement('a'),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

export async function storeInBucket (data, filename, type) {
  const timestamp = new Date().toISOString();
  const filenameWithTimestamp = `${timestamp}-${filename}`;

  try {
    // The S3 SDK is large and only needed for backups, so load it on demand.
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const s3 = new S3Client({
      region: import.meta.env.VUE_APP_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VUE_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VUE_APP_AWS_SECRET_ACCESS_KEY,
      },
    });

    await s3.send(new PutObjectCommand({
      Bucket: import.meta.env.VUE_APP_BUCKET_NAME,
      Key: `serverless-invoices/${filenameWithTimestamp}`,
      Body: data,
      ContentType: type
    }));

    alert('Backup successfully saved!');
    return filenameWithTimestamp;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    alert('Failed to upload file to S3. Please try again.');
    throw error;
  }
}
