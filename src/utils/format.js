import dayjs from 'dayjs/esm';
import customParseFormat from 'dayjs/esm/plugin/customParseFormat';
import { intlLocale } from '@/config/i18n.config';

dayjs.extend(customParseFormat);

export function formatDate(val, toFormat = 'D MMM YYYY', fromFormat = 'YYYY-MM-DDTHH:mm:ssZ') {
  if (val) {
    return dayjs(String(val), fromFormat)
      .format(toFormat);
  }
}

const RELATIVE_UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

/**
 * "3 days ago", "a minute ago", ... in the current UI language.
 */
export function fromNow(val, locale = intlLocale()) {
  if (!val) {
    return undefined;
  }
  const seconds = (new Date(val).getTime() - Date.now()) / 1000;
  const [unit, size] = RELATIVE_UNITS.find(([, unitSize]) => Math.abs(seconds) >= unitSize) || RELATIVE_UNITS.at(-1);
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(seconds / size), unit);
}

export function formatCurrency(val, digits = 2) {
  if (val !== null) {
    let x = parseFloat(val);
    if (Number.isNaN(x)) {
      return '';
    }
    const decimalLimiter = 10 ** digits;
    x = Math.round((x + Number.EPSILON) * decimalLimiter) / decimalLimiter;
    const parts = x.toFixed(digits).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  }
}
