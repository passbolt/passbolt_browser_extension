/**
 * Auth events.
 *
 * Used to handle the events related to authentication.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const AuthController = require('../controller/authController').AuthController;
const GpgAuth = require('../model/gpgauth').GpgAuth;
const User = require('../model/user').User;
const Worker = require('../model/worker');

const listen = function (worker) {
  /*
   * Check if the user is logged in.
   *
   * @listens passbolt.auth.is-logged-in
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.is-logged-in', async function (requestId) {
    const user = User.getInstance();

    try {
      await user.isLoggedIn();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Logout.
   *
   * @listens passbolt.auth.logout
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.logout', async function (requestId) {
    const auth = new GpgAuth();

    try {
      await auth.logout();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR');
    }
  });

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
