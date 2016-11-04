/**
 * Auth events.
 *
 * Used to handle the events related to authentication.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Auth = require('../model/auth').Auth;
var auth = new Auth();

var __ = require("sdk/l10n").get;
var Worker = require('../model/worker');

var listen = function (worker) {

  /*
   * Verify the server identity.
   *
   * @listens passbolt.auth.verify
   * @param requestId {int} The request identifier
   */
  worker.port.on('passbolt.auth.verify', function (requestId) {
    auth.verify().then(
      function success(msg) {
        worker.port.emit('passbolt.auth.verify.complete', requestId, 'SUCCESS', msg);
      },
      function error(error) {
        worker.port.emit('passbolt.auth.verify.complete', requestId, 'ERROR', error.message);
      }
    );
  });

  /*
   * Get the password server key for a given domain.
   *
   * @listens passbolt.auth.getServerKey
   * @param requestId {int} The request identifier
   * @param domain {string} The server's domain
   */
  worker.port.on('passbolt.auth.getServerKey', function (requestId, domain) {
    auth.getServerKey(domain).then(
      function success(msg) {
        worker.port.emit('passbolt.auth.getServerKey.complete', requestId, 'SUCCESS', msg);
      },
      function error(error) {
        worker.port.emit('passbolt.auth.getServerKey.complete', requestId, 'ERROR', error.message);
      }
    );
  });

  /*
   * Attempt to login the current user.
   *
   * @listens passbolt.auth.login
   * @param requestId {int} The request identifier
   * @param masterpassword {string} The master password to use for the authentication attempt.
   */
  worker.port.on('passbolt.auth.login', function (requestId, masterpassword) {
    Worker.get('Auth', worker.tab.id).port.emit('passbolt.auth.login.start', requestId, 'SUCCESS', __('Logging in'));
    auth.login(masterpassword).then(
      function success(referrer) {
        // init the app pagemod
        var app = require('../app');
        app.pageMods.PassboltApp.init();

        // redirect
        var msg = __('You are now logged in!');
        Worker.get('Auth', worker.tab.id).port.emit('passbolt.auth.login.complete', requestId, 'SUCCESS', msg, referrer);
      },
      function error(error) {
        Worker.get('Auth', worker.tab.id).port.emit('passbolt.auth.login.complete', requestId, 'ERROR', error.message);
      }
    );
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
