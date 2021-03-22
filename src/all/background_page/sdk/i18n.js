const i18next = require('i18next');
const HttpApi = require('i18next-http-backend');

/**
 * The supported languages
 * @type {string[]}
 */
const supportedLanguages = [
  'en-US',
];

/**
 * The fallback language.
 * @type {string}
 */
const fallbackLanguage = 'en-US';

/**
 * Get the language to use to translate the application
 * @returns {string|string}
 */
function getLanguage() {
  let language = navigator.language;

  if (isSupportedLanguage(language)) {
    return language;
  }

  const similarLanguage = findSimilarLanguage(language);
  if (similarLanguage) {
    return similarLanguage;
  }

  return fallbackLanguage;
}

/**
 * Check if the given langauge is supported
 * @param {string} language The language to test
 * @returns {boolean}
 */
function isSupportedLanguage(language) {
  return supportedLanguages.includes(language);
}

/**
 * Find the first similar language
 * By instance if en-US is supported but not en-UK, then en-US will be a similar language of en-UK
 * @param {string} language The language to find a similar one
 * @returns {string}
 */
function findSimilarLanguage(language) {
  const nonExplicitLanguage = language.split('-')[0];
  return supportedLanguages.find(supportedLanguage => nonExplicitLanguage === supportedLanguage.split('-')[0]);
}

// Initialize i18n with the browser default language.
const language = getLanguage();
i18next
  .use(HttpApi)
  .init({
    lng: language,
    load: 'currentOnly',
    react: {
      useSuspense: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    supportedLngs: supportedLanguages,
    fallbackLng: false,
    ns: ['common'],
    defaultNS: 'common',
    keySeparator: false, // don't use the dot for separator of nested json object
    nsSeparator: false, // allowed ':' in key to avoid namespace separator
    debug: true,
  });

exports.i18n = i18next;
