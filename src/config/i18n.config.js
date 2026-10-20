import i18next from 'i18next';
import dayjs from 'dayjs/esm';

export const LANGUAGES = [
  { name: 'English', code: 'en' },
  { name: 'French', code: 'fr' },
  { name: 'Italian', code: 'it' },
  { name: 'Estonian', code: 'et' },
  { name: 'Persian', code: 'fa' },
  { name: 'Spanish', code: 'es' },
  { name: 'Bangla', code: 'bn' },
  { name: 'German', code: 'de' },
  { name: 'Português - BR', code: 'pt_br' },
  { name: 'Indonesian', code: 'id' },
  { name: 'Korean', code: 'kr' },
];

// Same key the previous language detector used, so saved choices carry over.
const STORAGE_KEY = 'i18nextLng';
// Our codes that differ from the BCP 47 tags browsers and Intl use.
const BCP47 = { pt_br: 'pt-BR', kr: 'ko' };

// One file per language, each with a section per namespace (component).
const bundles = import.meta.glob('../locales/*.json', { import: 'default' });

// Month names in formatted dates (English is built into dayjs). The ESM builds share one dayjs instance.
const dayjsLocales = {
  fr: () => import('dayjs/esm/locale/fr'),
  it: () => import('dayjs/esm/locale/it'),
  et: () => import('dayjs/esm/locale/et'),
  fa: () => import('dayjs/esm/locale/fa'),
  es: () => import('dayjs/esm/locale/es'),
  bn: () => import('dayjs/esm/locale/bn'),
  de: () => import('dayjs/esm/locale/de'),
  pt_br: () => import('dayjs/esm/locale/pt-br'),
  id: () => import('dayjs/esm/locale/id'),
  kr: () => import('dayjs/esm/locale/ko'),
};

/**
 * Locale tag for Intl APIs (dates, relative times, month names).
 */
export function intlLocale(code = i18next.language) {
  return BCP47[code] || code;
}

function toSupportedCode(tag) {
  if (!tag) {
    return null;
  }
  const normalized = tag.toLowerCase().replace('-', '_');
  const aliases = Object.fromEntries(Object.entries(BCP47).map(([code, bcp]) => [bcp.toLowerCase().replace('-', '_'), code]));
  return [normalized, normalized.split('_')[0]]
    .map(candidate => aliases[candidate] || candidate)
    .find(candidate => LANGUAGES.some(lang => lang.code === candidate)) || null;
}

function detectLanguage() {
  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (e.g. privacy settings); fall through to the browser language.
  }
  const query = new URLSearchParams(window.location.search).get('lang');
  return [query, stored, ...navigator.languages].map(toSupportedCode).find(Boolean) || 'en';
}

async function loadBundle(code) {
  const resources = await bundles[`../locales/${code}.json`]();
  Object.entries(resources).forEach(([ns, translations]) => {
    i18next.addResourceBundle(code, ns, translations, true, true);
  });
}

export async function setLanguage(code) {
  if (!i18next.hasResourceBundle(code, 'invoices')) {
    await loadBundle(code);
  }
  dayjs.locale(dayjsLocales[code] ? (await dayjsLocales[code]()).default : 'en');
  await i18next.changeLanguage(code);
  document.documentElement.lang = intlLocale(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Not being able to remember the choice is fine.
  }
}

export const initialized = i18next
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {},
    partialBundledLanguages: true,
    interpolation: { escapeValue: false }, // Vue already escapes output.
  })
  .then(() => loadBundle('en'))
  .then(() => setLanguage(detectLanguage()));

export default i18next;
