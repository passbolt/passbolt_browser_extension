/**
 * Prompt the master password.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

(function () {

  // DOM Elements.
  var $masterPasswordField = null,
    $submitButton = null,
    $focusFirstField = null;

  /**
   * Initialize the master password dialog.
   */
  var init = function () {
    // Load the page template.
    loadTemplate()
    // Init the security token.
      .then(initSecurityToken)
      // Steal the focus.
      .then(stealFocus)
      // Init the event listeners.
      .then(initEventsListeners)
      // Mark the iframe container as ready.
      .then(function () {
        passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-master-password', 'loading');
        passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-master-password', 'ready');
      });
  };

  /**
   * Load the page template and initialize the variables relative to it.
   *
   * @returns {*|Promise.<T>|*}
   */
  var loadTemplate = function () {
    return passbolt.helper.html.loadTemplate('body', './tpl/master/masterPassword.ejs')
      .then(function () {
        $masterPasswordField = $('#js_master_password');
        $submitButton = $('#master-password-submit');
        $focusFirstField = $('#js_master_password_focus_first');
      });
  };

  /**
   * Init the security token.
   * @returns {Promise.<T>}
   */
  var initSecurityToken = function () {
    return passbolt.security.initSecurityToken('#js_master_password', '.security-token');
  };

  /**
   * Steal the focus wherever it is.
   * @returns {Promise.<T>}
   */
  var stealFocus = function () {
    var deferred = $.Deferred();

    // Ask the passbolt application to release the focus.
    passbolt.message.emit('passbolt.passbolt-page.remove-all-focuses');

    // We set the focus on the first focus field.
    var interval = setInterval(function () {
      $focusFirstField.focus();
      // If the focus has been set to the element, resolve the promise and
      // continue, otherwise try again.
      if ($focusFirstField.is(":focus")) {
        clearInterval(interval);
        deferred.resolve();
      }
    }, 10);

    return deferred;
  };

  /**
   * Init the events listeners.
   * The events can come from the following sources : addon, page or DOM.
   */
  var initEventsListeners = function () {
    $(document).on('click', '.js-dialog-close', closeButtonClicked);
    $submitButton.on('click', submitButtonClicked);
    $focusFirstField.on('keypress', focusFirstFieldKeypressed);
    $masterPasswordField.on('keypress', masterPasswordFieldKeypressed);
  };

  /**
   * Close the master password dialog
   */
  var cancelMasterPassword = function () {
    passbolt.message.emit('passbolt.master-password.cancel');
  };

  /**
   * Request the addon to remember the master password
   */
  var rememberMasterPassword = function (masterPassword, time) {
    time = time ? time : 300;
    passbolt.request('passbolt.user.rememberMasterPassword', masterPassword, time);
  };

  /**
   * Submit the master password to the addon code
   *
   * @param masterPassword {string} The master password to send to the addon code.
   */
  var submitMasterPassword = function (masterPassword) {
    $submitButton.addClass('processing');
    passbolt.request('passbolt.master-password.submit', masterPassword)
      .then(validAttemptHandler, wrongAttemptHandler);
  };

  /* ==================================================================================
   *  Addon events handlers
   * ================================================================================== */

  /**
   * Handles valid attempt.
   */
  var validAttemptHandler = function () {
    passbolt.message.emit('passbolt.master-password.close-dialog');
  };

  /**
   * Handles wrong attempt.
   */
  var wrongAttemptHandler = function (attempts) {
    // If less than 3 attempts, notify the user and let him try again.
    if (attempts < 3) {
      $('label[for="js_master_password"]')
        .html('Please enter a valid passphrase.')
        .addClass('error');
      $submitButton.removeClass('processing');
      $masterPasswordField.focus();
    }
    // Otherwise notify the user, and don't allow him to make another attempt.
    else {
      passbolt.helper.html.loadTemplate($('.js_dialog_content'), './tpl/master/master-password-failure.ejs');
    }
  };

  /* ==================================================================================
   *  DOM events handlers
   * ================================================================================== */

  /**
   * The close button has been clicked.
   * Close the dialog.
   *
   * @param ev
   */
  var closeButtonClicked = function (ev) {
    ev.preventDefault();
    cancelMasterPassword();
  };

  /**
   * The first focus field received a keypress event.
   * Handle the different scenario :
   *  - Escape pressed : close the dialog ;
   *  - Tab pressed : switch the focus to the master password field ;
   *  - Accepted key pressed : switch the focus to the master password and fill
   *    it with the entered character.
   *
   * @param ev
   */
  var focusFirstFieldKeypressed = function (ev) {
    // Prevent default.
    ev.preventDefault();
    ev.stopPropagation();

    // Get keycode.
    var keycode = ev.keyCode || ev.which,
    // Characters accepted. Should be printable, no control.
      char = String.fromCharCode(keycode),
      regex = /^[\u0020-\u007e\u00a0-\u00ff]*$/,
      valid = regex.test(char);

    // Escape
    if (keycode == 27) {
      cancelMasterPassword();
      return;
    }

    // If key pressed is not a control, or if tab.
    if (valid || keycode == 9) {
      // Give focus to field passphrase.
      $masterPasswordField.focus();
    }

    // If key pressed is not a control.
    // We enter the same value in the box.
    if (valid) {
      $masterPasswordField.val(char);
    }
  };

  /**
   * The submit button has been clicked :
   *  - Check if the user wants his master password to be remembered and
   *    notify the addon about this preference if yes.
   *  - Submit the master password to the addon.
   *
   * @param ev
   */
  var submitButtonClicked = function (ev) {
    var masterPassword = $masterPasswordField.val();

    // The user wants his master password to be remembered.
    if ($('#js_remember_master_password').is(':checked')) {
      rememberMasterPassword(masterPassword);
    }

    submitMasterPassword(masterPassword);
  };

  /**
   * Handle when the user presses a key on the master password field.
   * Handle the different scenario :
   *  - Escape pressed : close the dialog ;
   *  - Enter pressed : submit the form ;
   *
   * @param ev
   */
  var masterPasswordFieldKeypressed = function (ev) {
    // Get keycode.
    var keycode = ev.keyCode || ev.which;

    // The user presses enter.
    if (keycode == 13) {
      var masterPassword = $masterPasswordField.val();
      submitMasterPassword(masterPassword);
    }
    // The user presses escape.
    else if (keycode == 27) {
      cancelMasterPassword();
    }
  };

  // Init the master password dialog.
  init();

})();
