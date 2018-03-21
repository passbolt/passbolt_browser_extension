/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

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
window.Validator.isUtf8 = require('./utils/validatorRules').isUtf8;
window.Validator.isUtf8Extended = require('./utils/validatorRules').isUtf8Extended;
window._ = require('underscore/underscore-min');
window.kdxweb = require('kdbxweb/dist/kdbxweb');
window.PapaParse = require('papaparse/papaparse');


/**
 * Crypto libraries
 */
window.openpgp = require('openpgp/dist/openpgp');
window.jsSHA = require('jssha/src/sha');
