/**
 * Auth events.
 *
 * Used to handle the events related to authentication.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var GpgAuth = require('../model/gpgauth').GpgAuth;
var Worker = require('../model/worker');
var AuthController = require('../controller/authController').AuthController;

var listen = function (worker) {

  /*
   * Verify the server identity.
   *
   * @listens passbolt.auth.verify
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.verify', function (requestId) {
    var auth = new AuthController(worker, requestId);
    auth.verify();
  });

  /*
   * Get the password server key for a given domain.
   *
   * @listens passbolt.auth.getServerKey
   * @param requestId {uuid} The request identifier
   * @param domain {string} The server's domain
   */
  worker.port.on('passbolt.auth.getServerKey', function (requestId, domain) {
    var gpgauth = new GpgAuth();
    gpgauth.getServerKey(domain).then(
      function success(msg) {
        worker.port.emit(requestId, 'SUCCESS', msg);
      },
      function error(error) {
        worker.port.emit(requestId, 'ERROR', error.message);
      }
    );
  });

  /*
   * Attempt to login the current user.
   *
   * @listens passbolt.auth.login
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase to decryt the private key
   * @param remember {string} whether to remember the passphrase
   *   (bool) false|undefined if should not remember
   *   (integer) -1 if should remember for the session
   *   (integer) duration in seconds to specify a specific duration
   * @param redirect {string} The uri to redirect the user after login
   */
  worker.port.on('passbolt.auth.login', function (requestId, passphrase, remember, redirect) {
    var auth = new AuthController(worker, requestId);
    auth.login(passphrase, remember, redirect);
  });

  /*
   * Ask the login page to add a css class to an HTML Element.
   *
   * @listens passbolt.auth.add-class
   * @param selector {string} The HTML Element selector
   * @param cssClass {string} The class(es) to add to the html element
   */
  worker.port.on('passbolt.auth.add-class', function (selector, cssClass) {
    Worker.get('Auth', worker.tab.id).port.emit('passbolt.auth.add-class', selector, cssClass);
  });

  /*
   * Ask the login page to remove a css class from an HTML Element.
   *
   * @listens passbolt.auth.remove-class
   * @param selector {string} The HTML Element selector
   * @param cssClass {string} The class(es) to remove from the html element
   */
  worker.port.on('passbolt.auth.remove-class', function (selector, cssClass) {
    Worker.get('Auth', worker.tab.id).port.emit('passbolt.auth.remove-class', selector, cssClass);
  });

};

exports.listen = listen;
