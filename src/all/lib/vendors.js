/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
window.Validator = require('./vendors/validator');
window._ = require('./vendors/underscore-min');
window.fetch = require('./vendors/window').fetch;
window.FormData = require('./vendors/window').FormData;
window.urldecode =require('./vendors/phpjs').urldecode;
window.stripslashes = require('./vendors/phpjs').stripslashes;
window.htmlspecialchars = require('./vendors/phpjs').htmlspecialchars;
window.in_array = require('./vendors/phpjs').in_array;
window.storage = require('./vendors/node-localstorage').localStorage;
window.openpgp = require('./vendors/openpgp');
window.XRegExp = require('./vendors/xregexp').XRegExp;
window.jsSHA = require('./vendors/sha');
window.randomBytes = require('./vendors/crypto').randomBytes;
window.jsonQ = require('./vendors/jsonQ').jsonQ;
