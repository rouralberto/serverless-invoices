import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

export function formatDate(val, toFormat = 'D MMM YYYY', fromFormat = 'YYYY-MM-DDTHH:mm:ssZ') {
  if (val) {
    return dayjs(String(val), fromFormat)
      .format(toFormat);
  }
}

export function fromNow(val) {
  if (val) {
    return dayjs(val).fromNow();
  }
}
