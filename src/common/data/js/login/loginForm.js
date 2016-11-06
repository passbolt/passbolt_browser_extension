/**
 * Login form.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

(function () {

  var $loginSubmit = null,
    $username = null,
    $masterPassword = null,
    $loginMessage = null;

  /**
   * Initialize the master password dialog.
   */
  var init = function () {
    // Load the page template.
    loadTemplate()
    // Init the security token.
      .then(initSecurityToken)
      // Steal the focus
      .then(getUser)
      // Init the event listeners.
      .then(initEventsListeners)
      // Mark the iframe container as ready.
      .then(function () {
        passbolt.message.emit('passbolt.auth.remove-class', '#passbolt-iframe-login-form', 'loading');
        passbolt.message.emit('passbolt.auth.add-class', '#passbolt-iframe-login-form', 'ready');
      });
  };

  /**
   * Load the page template and initialize the variables relative to it.
   * @returns {promise}
   */
  var loadTemplate = function () {
    return passbolt.helper.html.loadTemplate('body', './tpl/login/form.ejs')
      .then(function success() {
        $loginSubmit = $('#loginSubmit');
        $username = $('#UserUsername');
        $masterPassword = $('#js_master_password');
        $loginMessage = $('#loginMessage');
      });
  };

  /**
   * Init the security token.
   * @returns {promise}
   */
  var initSecurityToken = function () {
    return passbolt.security.initSecurityToken('#js_master_password', '.security-token');
  };

  /**
   * Get the user configured in the addon.
   * @returns {promise}
   */
  var getUser = function () {
    return passbolt.request('passbolt.user.get').then(
      function success(user) {
        // the user should always exist at this point
        $username.val(user.username);
      }
    );
  };

  /**
   * Init the events listeners.
   * The events can come from the following sources : addon, page or DOM.
   */
  var initEventsListeners = function () {
    $loginSubmit.on('click', onLoginSubmit);
    $masterPassword.on('keypress', onMasterPasswordKeypressed);
  };

  /**
   * Passphrase invalid, notify the user.
   * @param msg {string} The error message
   */
  var invalidPassphrase = function (msg) {
    $loginSubmit.removeClass('disabled').removeClass('processing');
    $loginMessage.addClass('error').text(msg);
  };

  /**
   * Login the user
   */
  var login = function (masterPassword) {
    passbolt.request('passbolt.auth.login', masterPassword);
  };

  /**
   * Try to login the user.
   * @param masterPassword {string} The user passphrase
   */
  var loginAttempt = function (masterPassword) {
    if ($loginSubmit.hasClass('processing')) {
      return;
    }

    $('html').removeClass('loaded').addClass('loading');
    $loginMessage.text('Please wait...');
    $loginSubmit.addClass('disabled').addClass('processing');

    // Check the passphrase.
    passbolt.request('passbolt.keyring.private.checkpassphrase', masterPassword).then(
      // If the passphrase is valid, login the user.
      function success() {
        login(masterPassword);
      },
      // If the passphrase is invalid, display an error feedback.
      function fail(msg) {
        invalidPassphrase(msg);
      }
    );
  };

  /* ==================================================================================
   *  DOM events handlers
   * ================================================================================== */

  /**
   * The login form has been submited.
   * Try to login the user.
   *
   * @param ev
   */
  var onLoginSubmit = function () {
    if ($loginSubmit.hasClass('processing')) {
      return false;
    }

    loginAttempt($masterPassword.val());
    return false;
  };

  /**
   * Handle when the user presses a key on the master password field.
   * Handle the scenario :
   *  - Enter pressed : submit the form ;

   * @param ev {HTMLEvent} The event which occurred
   */
  var onMasterPasswordKeypressed = function (ev) {
    if ($loginSubmit.hasClass('processing')) {
      return false;
    }

    // Get keycode.
    var keycode = ev.keyCode || ev.which;

    // The user presses enter.
    if (keycode == 13) {
      loginAttempt($masterPassword.val());
    }
  };

  // Init the login form.
  init();

})();
