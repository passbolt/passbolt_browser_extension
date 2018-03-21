/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
/**
 * Fetch polyfill
 *
 * Chrome window.fetch suppresses custom headers such as X-GPGAuth-* in CORS context
 * See. https://developers.google.com/web/updates/2015/03/introduction-to-fetch
 *
 * If a request is made for a resource on another origin which returns the CORs headers, then the type is cors.
 * cors and basic responses are almost identical except that a cors response restricts the headers you can view
 * to `Cache-Control`, `Content-Language`, `Content-Type`, `Expires`, `Last-Modified`, and `Pragma`.
 *
 */
window.fetch = require('./vendors/fetch').fetch;
window.FormData = require('./vendors/fetch').FormData;

/**
 * Php compatibility helpers
 */
window.urldecode = require('locutus/php/url/urldecode');
window.stripslashes = require('locutus/php/strings/stripslashes');
window.htmlspecialchars = require('locutus/php/strings/htmlspecialchars');
window.in_array = require('locutus/php/array/in_array');

/**
 * Other libraries
 */
window.XRegExp = require('xregexp/xregexp-all');
window.Validator = require('validator/validator');
window.Validator.isUtf8 = require('../../all/background_page/utils/validatorRules').isUtf8;
window.Validator.isUtf8Extended = require('../../all/background_page/utils/validatorRules').isUtf8Extended;
window._ = require('underscore/underscore-min');
window.kdxweb = require('kdbxweb/dist/kdbxweb');
window.PapaParse = require('papaparse/papaparse');

/**
 * Crypto libraries
 */
window.openpgp = require('openpgp/dist/openpgp');
window.jsSHA = require('jssha/src/sha');
