/* eslint-disable */
import dayjs from 'dayjs';
import AWS from 'aws-sdk';

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
    .filter(field => map.hasOwnProperty(field));
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
  if (!input.hasOwnProperty(field) || input[field] === null || input[field].length === 0) {
    return [`${label} is required`];
  }
  return null;
}

export function removeVuexORMFlags(obj) {
  delete obj.$id;
  delete obj.$isNew;
  delete obj.$isDirty;
}

export function generateInvoiceNumber(invoices) {
  const date = dayjs()
    .format('YYYYMMDD');
  const number = invoices.length + 1;
  return `${date}-${number}`;
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

  const awsOptions = {
    region: process.env.VUE_APP_AWS_REGION,
    accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VUE_APP_AWS_SECRET_ACCESS_KEY,
  };

  const s3 = new AWS.S3(awsOptions);

  try {
    await s3.putObject({
      Bucket: process.env.VUE_APP_BUCKET_NAME,
      Key: `serverless-invoices/${filenameWithTimestamp}`,
      Body: data,
      ContentType: type
    }).promise();

    alert('Backup successfully saved!');
    return filenameWithTimestamp;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    alert('Failed to upload file to S3. Please try again.');
    throw error;
  }
}
