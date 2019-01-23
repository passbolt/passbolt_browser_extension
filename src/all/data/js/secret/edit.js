/**
 * Edit a secret.
 *
 * @copyright (c) 2017 Passbolt SARL, 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  // The dialog can be open in create or in edit mode.
  // In edit mode the secret needs to be decrypted to be edited.
  var dialogCase = 'create',
    initialSecretPlaceholder = null,
  // The password to edit, it is retrieved by sending a request to the addon-code.
    editedPassword = null,
  // When the validation has already been called once
    validationCalled = false,
  // DOM Elements.
    $secret = null,
    $secretClear = null,
    $viewSecretButton = null,
    $secretStrength = null,
    $generateSecretButton = null,
    $feedback = null;

  /**
   * Initialize the secret add/edit component.
   */
  const init = async function () {
    try {
      await loadTemplate();
      await updateSecurityToken();
      await getEditedPassword();
      await updateSecretStrength();
      await onDialogReady();
    } catch (error) {
      onError(error);
    }
  };

  /**
   * Error handler.
   * @param error {string} The error message
   */
  const onError = function (error) {
    // @todo Display a feedback to the user.
    if (error && (error.message != 'UserAbortsOperationError' || error.message != 'InvalidMasterPasswordError')) {
      console.error(error);
    }
  };

  /**
   * Update the security token
   * @returns {Promise|*}
   */
  const updateSecurityToken = function () {
    return passbolt.security.initSecurityToken('#js_secret', '.security-token')
  };

  /**
   * Load the page template and initialize the variables relative to it.
   * @returns {Promise}
   */
  const loadTemplate = async function () {
    await passbolt.html.loadTemplate('body', 'secret/edit.ejs');
    $secret = $('#js_secret');
    $secretClear = $('#js_secret_clear');
    $viewSecretButton = $('#js_secret_view');
    $secretStrength = $('#js_secret_strength');
    $generateSecretButton = $('#js_secret_generate');
    $feedback = $('#js_field_password_feedback');
    initialSecretPlaceholder = $secret.attr('placeholder');
  };

  /**
   * Get the currently edited secret.
   * It must have been stored before launching the secret add/edit dialog.
   * @returns {Promise}
   */
  const getEditedPassword = async function () {
    editedPassword = await passbolt.request('passbolt.edit-password.get-edited-password');
  };

  /**
   * onDialogReady
   * Init the events listeners.
   */
  const onDialogReady = function () {
    // Is the dialog opened to edit a password, or to add a new one.
    dialogCase = window.location.href.indexOf('case=edit') !== -1 ? 'edit' : 'create';
    if (dialogCase === 'edit') {
      // Mark it as encrypted here.
      secretStateChangeHandler('encrypted');
    }

    // Init the event listeners.
    $secret.on('input change', secretFieldUpdatedHandler);
    $secret.on('keydown', secretFieldKeydownHandler);
    $secretClear.on('input', secretClearFieldUpdatedHandler);
    $secret.on('focus', secretFieldFocusedHandler);
    $generateSecretButton.on('click', generateSecretButtonClickedHandler);
    $viewSecretButton.on('click', viewSecretButtonClickedHandler);
    passbolt.message.on('passbolt.secret-edit.validate-success', validateSuccessHandler);
    passbolt.message.on('passbolt.secret-edit.validate-error', validateErrorHandler);
    passbolt.message.on('passbolt.secret-edit.focus', onSecretFocusHandler);

    // Mark the iframe container as ready.
    passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-secret-edition', 'loading');
    passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-secret-edition', 'ready');
  };

  /**
   * Is the secret decrypted?
   * @returns {boolean}
   */
  const isDecrypted = function () {
    return editedPassword.secret != null;
  };

  /**
   * Show in clear / obfuscate the secret.
   */
  const toggleViewSecret = function () {
    if ($secret.hasClass('hidden')) {
      $secret.removeClass('hidden');
      $secretClear.addClass('hidden');
      $viewSecretButton.removeClass('selected');
    } else {
      $secret.addClass('hidden');
      $secretClear.removeClass('hidden');
      $secretClear.val($secret.val());
      $viewSecretButton.addClass('selected');
    }
  };

  /**
   * Update the secret strength component.
   */
  const updateSecretStrength = async function () {
    const secret = editedPassword.secret || '';
    const strength = secretComplexity.strength(secret);
    const tplData = {
      strengthId: secretComplexity.STRENGTH[strength].id,
      strengthLabel: secretComplexity.STRENGTH[strength].label
    };

    try {
      await passbolt.html.loadTemplate($secretStrength, 'secret/strength.ejs', 'html', tplData);
      // Add class on the top container.
      const containerClasses = $secretStrength.attr('class').split(' ');
      if (containerClasses.length > 1) {
        $secretStrength.removeClass(containerClasses.pop());
      }
      $secretStrength.addClass(secretComplexity.STRENGTH[strength].id);
    } catch (error) {
      onError(error);
    }
  };

  /**
   * The secret is still encrypted, decrypt it.
   */
  const decryptSecret = async function () {
    // If a decryption is already happening, don't trigger it twice.
    if ($secret.hasClass("decrypting")) {
      return;
    }
    $secret.addClass("decrypting");
    $secret.attr("placeholder", "decrypting...");
    passbolt.message.emit('passbolt.passbolt-page.loading');

    // Retrieve the secret message.
    try {
      editedPassword.secret = await passbolt.request('passbolt.secret-edit.decrypt');
      secretStateChangeHandler('decrypted');
      updateSecretStrength();
      await passbolt.request('passbolt.edit-password.set-edited-password', editedPassword);
    } catch (error) {
      $secret.attr("placeholder", initialSecretPlaceholder);
      onError(error);
    } finally {
      $secret.removeClass("decrypting");
      passbolt.message.emit('passbolt.passbolt-page.loading_complete');
    }
  };

  /* ==================================================================================
   *  Addon events handlers
   * ================================================================================== */

  /**
   * When the addon-code orders the secret field to be focused.
   */
  const onSecretFocusHandler = function () {
    $secret.focus();
  };

  /* ==================================================================================
   *  DOM events handlers
   * ================================================================================== */

  /**
   * When the user explicitly wants to view the secret.
   * @param ev {HTMLEvent} The event which occurred
   */
  const viewSecretButtonClickedHandler = async function (ev) {
    ev.preventDefault();

    // The operation requires the secret to be decrypted.
    if (isDecrypted()) {
      toggleViewSecret();
    }
    // If not decrypted, decrypt it before displaying it.
    else {
      // If click on the non decrypted state, we remove the  focus. We do that
      // because the focus will be needed by the passphrase dialog.
      $(this).blur();
      await decryptSecret();
      toggleViewSecret();
    }
  };

  /**
   * When the secret is updated.
   */
  const secretFieldUpdatedHandler = function () {
    // Because change is triggered even if input has been triggered previously
    // (1. user changes the input (input triggered); 2. users moves the focus (change triggered);)
    // Isolate the input binding and trigger change manually to avoid the double change call is useless.
    if ($secret.val() == editedPassword.secret) {
      return;
    }

    // If the secret is encrypted, decrypt it first.
    if (!isDecrypted()) {
      decryptSecret();
      return;
    }

    // Notify the application regarding the change.
    passbolt.message.emit('passbolt.secret-edit.secret-updated');

    // Update the interface.
    editedPassword.secret = $secret.val();
    $secretClear.val(editedPassword.secret);
    updateSecretStrength();
    passbolt.request('passbolt.edit-password.set-edited-password', editedPassword);

    // If the secret has been validated once, validate it again.
    // Validate the field.
    if (validationCalled) {
      passbolt.request('passbolt.secret-edit.validate');
    }
  };

  /**
   * When a user click on the secret/password field.
   */
  const secretFieldFocusedHandler = function () {
    if (!isDecrypted()) {
      // If click on the non decrypted state, we remove the  focus. We do that
      // because the focus will be needed by the passphrase dialog.
      $secret.blur();

      // Launch decryption.
      decryptSecret();
    }
  };

  /**
   * When the clear secret is updated.
   */
  const secretClearFieldUpdatedHandler = function () {
    $secret.val($secretClear.val())
      .trigger('change');
  };

  /**
   * When the generate a new secret button is clicked.
   * @param ev {HTMLEvent} The event which occurred
   */
  const generateSecretButtonClickedHandler = function (ev) {
    ev.preventDefault();

    if ($(this).attr('disabled') == 'disabled') {
      return false;
    }

    $secret.val(secretComplexity.generate())
      .trigger('change');
  };

  /**
   * When tab is pressed in secret field, inform app, so it can put the focus on the next field.
   * @param ev {HTMLEvent} The event which occurred
   */
  const secretFieldKeydownHandler = function (ev) {
    if (!isDecrypted()) {
      ev.preventDefault();
      return false;
    }
    var code = ev.keyCode || ev.which;
    // Backtab key.
    if (code == '9' && ev.shiftKey) {
      // If click on the non decrypted state, we remove the  focus. We do that
      // because the focus will be needed by the passphrase dialog.
      $secret.blur();
      passbolt.message.emit('passbolt.secret-edit.back-tab-pressed');
    }
    // Tab key.
    else if (code == '9') {
      // If click on the non decrypted state, we remove the  focus. We do that
      // because the focus will be needed by the passphrase dialog.
      $secret.blur();
      passbolt.message.emit('passbolt.secret-edit.tab-pressed');
    }
  };

  /**
   * Handle secret validation success.
   */
  const validateSuccessHandler = function () {
    $secret.removeClass('error');
    $secretClear.removeClass('error');

    // Hide the error feedback.
    $feedback.hide();

    // Resize the iframe to fit the content.
    passbolt.html.resizeIframe('#passbolt-iframe-secret-edition', {
      width: '100%'
    });

    // Mark as already validated.
    validationCalled = true;
  };

  /**
   * Handle secret validation error.
   * @param message {string} The error message
   * @param validationErrors {array} The detailed error by fields.
   */
  const validateErrorHandler = function (message, validationErrors) {
    var error = '';

    $secret.addClass('error');
    $secretClear.addClass('error');

    // Display the error feedback.
    for (var i in validationErrors) {
      for (var fieldName in validationErrors[i])
        error += validationErrors[i][fieldName] + ' ';
    }
    $feedback.text(error).show();

    // Resize the iframe to fit the content.
    passbolt.html.resizeIframe('#passbolt-iframe-secret-edition', {
      width: '100%'
    });

    // Mark as already validated.
    validationCalled = true;
  };

  /**
   * The secret state has change. Handle the change, and update the components
   * that are affected by this change.
   *
   * In case of encrypted secret :
   *  - The generate a random secret button should be disabled;
   *  - The secret field should display a placeholder to notify the user about
   *    the secret state;
   *
   * In case of decrypted secret :
   *  - The generate a random secret button should be enabled;
   *  - The secret field should use the default behavior to display the
   *    secret.
   *
   * @param state {string} The state to switch to. Can be : encrypted or decrypted
   */
  const secretStateChangeHandler = function (state) {
    if (state === 'encrypted') {
      $secret.attr('placeholder', 'click here to unlock')
        .parent().addClass('has-encrypted-secret');

      $generateSecretButton
        .addClass('disabled')
        .attr('disabled', 'disabled');
    }
    else if (state === 'decrypted') {
      $secret
        .val(editedPassword.secret)
        .attr('placeholder', initialSecretPlaceholder)
        .focus()
        .trigger('change')
        .removeClass('decrypting')
        .parent().removeClass('has-encrypted-secret');

      $generateSecretButton
        .removeClass('disabled')
        .removeAttr('disabled');
    }
  };

  // Init the secret add/edit dialog.
  init();

});
