/**
 * Prompt the master password.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  // DOM Elements.
  var $masterPasswordField = null,
    $submitButton = null,
    $focusFirstField = null;

  /**
   * Initialize the master password dialog.
   */
  var init = function () {
    // Load the page template.
    passbolt.request('passbolt.site.settings.plugins.rememberMe')
      .then(function(options) {
        return loadTemplate(options);
      })
      // Init the security token.
      .then(initSecurityToken)
      // Steal the focus.
      .then(stealFocus)
      .then(function () {
        // Init the event listeners.
        // Mark the iframe container as ready.
        initEventsListeners();
        passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-master-password', 'loading');
        passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-master-password', 'ready');
      })
      .catch(function () {
        console.error('Something went wrong when initializing masterPassword.js');
      });
  };

  /**
   * Load the page template and initialize the variables relative to it.
   * @returns {Promise}
   */
  var loadTemplate = function (options) {
    var tpl = 'master/masterPassword.ejs';
    if (options === null) {
      tpl = 'master/masterPasswordSimple.ejs';
    }
    return passbolt.html.loadTemplate('body', tpl, 'html', {'options': options})
      .then(function () {
        $masterPasswordField = $('#js_master_password');
        $submitButton = $('#master-password-submit');
        $focusFirstField = $('#js_master_password_focus_first');
      });
  };

  /**
   * Init the security token.
   * @returns {Promise}
   */
  var initSecurityToken = function () {
    return passbolt.security.initSecurityToken('#js_master_password', '.security-token');
  };

  /**
   * Steal the focus wherever it is.
   * @returns {Promise}
   */
  var stealFocus = function () {
    return new Promise(function(resolve, reject) {
      // Ask the passbolt application to release the focus.
      passbolt.message.emit('passbolt.passbolt-page.remove-all-focuses');

      // We set the focus on the first focus field.
      var interval = setInterval(function () {
        $focusFirstField.focus();
        // If the focus has been set to the element, resolve the promise and
        // continue, otherwise try again.
        if ($focusFirstField.is(":focus")) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
  };

  /**
   * Init the events listeners.
   * The events can come from the following sources : addon, page or DOM.
   */
  var initEventsListeners = function () {
    $(document).on('click', '.js-dialog-close', closeButtonClicked);
    $submitButton.on('click', submitButtonClicked);
    $focusFirstField.on('keypress', focusFirstFieldKeypressed);
    $focusFirstField.on('keydown', focusFirstFieldKeydown);
    $masterPasswordField.on('keypress', masterPasswordFieldKeypressed);
    $masterPasswordField.on('keydown', masterPasswordFieldKeyDown);
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
  var rememberMasterPassword = function (masterPassword, duration) {
    duration = duration ? duration : 300;
    if (isNaN(duration)) {
      duration = 300;
    }
    passbolt.request('passbolt.user.rememberMasterPassword', masterPassword, duration);
  };

  /* ==================================================================================
   *  Addon events handlers
   * ================================================================================== */

  /**
   * Handles valid attempt.
   *  - Check if the user wants their master password to be remembered and
   *    notify the addon about this preference if yes.
   *  - Close the dialog
   */
  var validAttemptHandler = function () {
    // The user wants their master password to be remembered.
    if ($('#js_remember_master_password').is(':checked')) {
      var duration = parseInt($('#js_remember_master_password_duration').val());
      rememberMasterPassword($masterPasswordField.val(), duration);
    }
    passbolt.message.emit('passbolt.master-password.close-dialog');
  };

  /**
   * Handles wrong attempt.
   * @param attempts {int} The number of attempts done already
   */
  var wrongAttemptHandler = function (attempts) {
    // If less than 3 attempts, notify the user and let him try again.
    if (attempts < 3) {
      $('label[for="js_master_password"]')
        .text('Please enter a valid passphrase.')
        .addClass('error');
      $submitButton.removeClass('processing');
      $masterPasswordField.focus();
    }
    // Otherwise notify the user, and don't allow him to make another attempt.
    else {
      passbolt.html.loadTemplate($('.js_dialog_content'), 'master/masterPasswordFailure.ejs');
    }
  };

  /* ==================================================================================
   *  DOM events handlers
   * ================================================================================== */

  /**
   * The close button has been clicked.
   * Close the dialog.
   * @param ev {HTMLEvent} The event which occurred
   */
  var closeButtonClicked = function (ev) {
    ev.preventDefault();
    cancelMasterPassword();
  };

  /**
   * The first focus field received a keydown event.
   * Handle the tab scenario that cannot be treated by the keypress event
   * handler mainly because of the chrome browser default behavior. The tab
   * key is not treated by the keypress event.
   * If tab is pressed, the master password field should get the focus.
   */
  var focusFirstFieldKeydown = function(ev) {
    // Get keycode.
    var keycode = ev.keyCode || ev.which;

    // Escape
    if (keycode == 27) {
      ev.preventDefault();
      ev.stopPropagation();
      cancelMasterPassword();
      return;
    }

    // Tab.
    if (keycode == 9) {
      ev.preventDefault();
      ev.stopPropagation();
      // Give focus to field passphrase.
      $masterPasswordField.focus();
    }
  };

  /**
   * The first focus field received a keypress event.
   * Handle the different scenario :
   *  - Escape pressed : close the dialog ;
   *  - Tab pressed :  ;
   *  - Accepted key pressed : switch the focus to the master password and fill
   *    it with the entered character.
   * @param ev {HTMLEvent} The event which occurred
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

    // Tab
    if (keycode == 9) {
      return;
    }

    // If key pressed is not a control.
    if (valid) {
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
   *  - Submit the master password to the addon for validation
   */
  var submitButtonClicked = function () {
    $submitButton.addClass('processing');
    passbolt.request('passbolt.master-password.submit', $masterPasswordField.val())
      .then(validAttemptHandler, wrongAttemptHandler);
  };

  /**
   * Handle when the user presses a key on the master password field.
   * Handle the different scenario :
   *  - Escape pressed : close the dialog ;
   *  - Enter pressed : submit the form ;
   * @param ev {HTMLEvent} The event which occurred
   */
  var masterPasswordFieldKeypressed = function (ev) {
    // Get keycode.
    var keycode = ev.keyCode || ev.which;

    // The user presses enter.
    if (keycode == 13) {
      submitButtonClicked();
    }
    // The user presses escape.
    else if (keycode == 27) {
      cancelMasterPassword();
    }
  };

  /**
   * Handle when the user presses a key on the master password field.
   * Handle the different scenario :
   *  - Escape pressed : close the dialog ;
   * @param ev {HTMLEvent} The event which occurred
   */
  var masterPasswordFieldKeyDown = function (ev) {
    // Get keycode.
    var keycode = ev.keyCode || ev.which;

    // The user presses escape.
    if (keycode == 27) {
      ev.preventDefault();
      ev.stopPropagation();
      cancelMasterPassword();
    }
  };

  // Init the master password dialog.
  init();

});
