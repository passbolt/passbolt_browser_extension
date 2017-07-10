/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Validator = require('./vendors/validator');
var _ = require('./vendors/underscore-min');
var fetch = require('./vendors/window').fetch;
var FormData = require('./vendors/window').FormData;
const { urldecode, stripslashes, htmlspecialchars, in_array } = require('./vendors/phpjs');
var openpgp = require('./vendors/openpgp');
var XRegExp = require('./vendors/xregexp').XRegExp;
var jsSHA = require('./vendors/sha');
var randomBytes = require('./vendors/crypto').randomBytes;
var jsonQ = require('./vendors/jsonQ').jsonQ;
var storage = require('./vendors/node-localstorage').localStorage;
