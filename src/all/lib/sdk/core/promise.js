/**
 * Promise Chrome Wrapper
 * Allow using promise in chrome almost like firefox sdk
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * A promise is created and return along with the methods to change its state.
 * @returns {{resolve: resolve, reject: reject, promise: *}}
 */
var defer = function () {
  var pReject, pResolve,
    promise = new Promise(function (resolve, reject) {
      pResolve = resolve;
      pReject = reject;
    });

  return {
    resolve: function () {
      pResolve.apply(promise, arguments);
    },
    reject: function () {
      pReject.apply(promise, arguments);
    },
    promise: promise
  }
};
exports.defer = defer;

/**
 * Return the chrome Promise object.
 */
exports.Promise = Promise;