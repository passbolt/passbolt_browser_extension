/**
 * HTTP Request wrapper / utility.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const { defer } = require('sdk/core/promise');
var _Request = require("sdk/request").Request;

var Request = function() {};

/**
 * Wrapper for HTTP Get request
 * @param options
 * @returns {Promise|*}
 */
Request.get = function (options) {
  var deferred = defer();
  _Request({
    url: options.url,
    onComplete: function (data) {
      return deferred.resolve(data);
    }
  }).get();
  return deferred.promise;
};

/**
 * Wrapper for HTTP Post request
 * @param options
 * @returns {Promise|*}
 */
Request.post = function (options) {
  var deferred = defer();
  _Request({
    url: options.url,
    content : options.content,
    onComplete: function (data) {
      return deferred.resolve(data);
    }
  }).post();
  return deferred.promise;
};

exports.Request = Request;
