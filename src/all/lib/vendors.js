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
 * Warning: Custom built vendor - not tracked with package.json
 */
window.urldecode =require('./vendors/phpjs').urldecode;
window.stripslashes = require('./vendors/phpjs').stripslashes;
window.htmlspecialchars = require('./vendors/phpjs').htmlspecialchars;
window.in_array = require('./vendors/phpjs').in_array;

/**
 * Other libraries
 */
window.XRegExp = require('./vendors/xregexp-all');
window.Validator = require('./vendors/validator');
window._ = require('./vendors/underscore-min');
window.jsonQ = require('./vendors/jsonQ');

/**
 * Crypto libraries
 */
window.storage = require('./sdk/node-localstorage').localStorage;
window.openpgp = require('./vendors/openpgp');
window.jsSHA = require('./vendors/sha');
