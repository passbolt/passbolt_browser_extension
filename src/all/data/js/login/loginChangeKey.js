/**
 * Login form.
 *
 * @copyright (c) 2020 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  let $changeConfirm = null,
    $changeSubmit = null;

  /**
   * Initialize the master password dialog.
   */
  const init = function () {
    // Load the page template.
    loadTemplate()
      .then(initEventsListeners)
      // Mark the iframe container as ready.
      .then(function () {
        passbolt.message.emit('passbolt.auth.remove-class', '#passbolt-iframe-login-form', 'loading');
        passbolt.message.emit('passbolt.auth.add-class', '#passbolt-iframe-login-form', 'ready');
      }, function(error) {
        console.error(error);
        console.error('Something went wrong when initializing loginChangeKey.js');
      });
  };

  /**
   * Load the page template and initialize the constiables relative to it.
   * @returns {Promise}
   */
  const loadTemplate = function () {
    return passbolt.html.loadTemplate('body', 'login/changeKey.ejs', 'html',
      {})
      .then(function success() {
        $changeConfirm = $('#js_server_key_change_confirm');
        $changeSubmit = $('#js_server_key_change_submit');
      });
  };

  /**
   * Init the events listeners.
   * The events can come from the following sources : addon, page or DOM.
   */
  const initEventsListeners = function () {
    $changeConfirm.on('click', onChangeConfirm);
    $changeSubmit.on('click', onLoginSubmit);
  };

  const onChangeConfirm = function() {
    $changeSubmit.toggleClass('disabled');
  }

  const onLoginSubmit = function() {
    if($changeSubmit.hasClass('disabled')) {
      // do nothing
    } else {
      passbolt.request('passbolt.auth.replace-server-key').then(
        function success(domain) {
          passbolt.html.loadTemplate('body', 'login/changeKeySuccess.ejs','html',
            {domain: domain}
          );
        },
        function error(error) {
          passbolt.html.loadTemplate('body', 'login/changeKeyOops.ejs', 'html',
            {message: error.message}
          );
        }
      );
    }
  }

  // Init the login form.
  init();

});
