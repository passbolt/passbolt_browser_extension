/**
 * Passbolt import key setup step.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  /*
   * Step settings.
   */
  var step = {
    id: 'import_key',
    elts: {
      browseButton: '#js_setup_import_key_browse',
      keyAscii: '#js_setup_import_key_text',
      errorFeedback: '#KeyErrorMessage',
      createButton: '#js_setup_goto_define_key'
    },
    options: {
      infoTemplate: null,
      // The workflow name is useful to know if we should check
      // whether the key exist on the server, or whether it doesn't exist.
      // install case: the key fingerprint is not supposed to exist.
      // recover case: the key fingerprint is supposed to exist.
      workflow: 'install'
    },
    data: {}
  };

  /**
   * Implements init().
   * @returns {promise}
   */
  step.init = function () {
    return new Promise(function(resolve, reject) {
      resolve()
    });
  };

  /**
   * Implements start().
   */
  step.start = function () {
    // If info template is provided, display it.
    // We use this space to display side information to the user.
    if (step.options.infoTemplate != undefined && step.options.infoTemplate != null) {
      passbolt.html.loadTemplate($('#js_step_content .sideInfo'), 'data/tpl/setup/' + step.options.infoTemplate);
    }

    // Bind the go back to create a new key button.
    step.elts.$createButton.click(function (ev) {
      ev.preventDefault();
      passbolt.setup.switchToStep('define_key');
    });

    // When the textarea displaying the key to import is filled.
    step.elts.$keyAscii.on('input change', step.onKeyInputChange);

    // Bind the browse filepicker button.
    step.elts.$browseButton.click(step.onBrowseClick);
  };

  /**
   * Implements submit().
   * @returns {promise}
   */
  step.submit = function () {
    passbolt.setup.setActionState('submit', 'processing');

    var key = $('#js_setup_import_key_text').val();
    step.data.privateKeyArmored = key;

    step.elts.$errorFeedback.addClass('hidden');

    return step.extractKeyInfo()
      .then(step.validatePrivateKey)
      .then(step.setPrivateKey)
      .then(step.extractPublicKey)
      .then(function (publicKeyArmored) {
        passbolt.setup.set('key.publicKeyArmored', publicKeyArmored);
      })
      .then(null, function (error) {
        step.onError(error);
      });
  };

  /**
   * Implements cancel().
   * @returns {promise}
   */
  step.cancel = function () {
    return new Promise(function(resolve, reject) {
      passbolt.setup.setActionState('cancel', 'processing');
      resolve()
    });
  };

  /* ==================================================================================
   *  Content code events.
   * ================================================================================== */

  step.onBrowseClick = function () {
    step.browseKey()
      .then(function (data) {
        step.elts.$keyAscii.val(data).change();
        step.elts.$errorFeedback.addClass('hidden');
      });
  };

  step.onKeyInputChange = function () {
    if ($.trim($(this).val()) == '') {
      passbolt.setup.setActionState('submit', 'disabled');
    } else {
      passbolt.setup.setActionState('submit', 'enabled');
    }
  };

  step.onError = function (errorMessage) {
    step.elts.$errorFeedback
      .removeClass('hidden')
      .html(errorMessage);
    passbolt.setup.setActionState('submit', 'enabled');
  };

  /* ==================================================================================
   *  Business functions
   * ================================================================================== */

  /**
   * Browse key and return content of the key selected.
   * @returns {promise}
   */
  step.browseKey = function () {
    // return passbolt.request('passbolt.file.prompt')
    return passbolt.file.get()
      .then(function (data) {
          step.data.privateKeyArmored = data;
          return data;
        },
        function error(error) {
          step.onError(error);
        });
  };

  /**
   * Extract key info from private key.
   * @returns Promise
   */
  step.extractKeyInfo = function () {
    return new Promise(function(resolve, reject) {
      var armoredPrivateKey = step.data.privateKeyArmored;

      passbolt.request('passbolt.keyring.public.info', armoredPrivateKey)
        .then(function (keyInfo) {
          step.data.privateKeyInfo = keyInfo;
          if (keyInfo.private === true) {
            resolve();
          } else {
            reject('This key is not a valid private key');
          }
        }, function(error) {
          reject(error);
        });

    });
  };

  /**
   * Check that the key doesn't already exist on server.
   * @return Promise
   */
  step.checkKeyDontExistRemotely = function () {
    return new Promise(function(resolve, reject) {
      var armoredPrivateKey = step.data.privateKeyArmored;
      passbolt.request('passbolt.setup.checkKeyExistRemotely', step.data.privateKeyInfo.fingerprint)
        .then(function () {
          reject('This key is already used by another user');
        })
        .then(null, function () {
          resolve(armoredPrivateKey);
        });
    });
  };

  /**
   * Check that the key exists on server.
   * @return Promise
   */
  step.checkKeyExistRemotely = function () {
    return new Promise(function(resolve, reject) {
      var armoredPrivateKey = step.data.privateKeyArmored;
      passbolt.request('passbolt.setup.checkKeyExistRemotely', step.data.privateKeyInfo.fingerprint)
        .then(function () {
          resolve(armoredPrivateKey);
        })
        .then(null, function () {
          reject('This key doesn\'t match any account.');
        });
    });
  };

  /**
   * Check key existence depending on the workflow.
   *  - install case: check that the key doesn't exist remotely.
   *  - recover case: check that the key exist remotely.
   * @return {promise}
   */
  step.validatePrivateKey = function () {
    if (step.options.workflow == 'install') {
      return step.checkKeyDontExistRemotely()
    }
    else if (step.options.workflow == 'recover') {
      return step.checkKeyExistRemotely()
    }
  };

  /**
   * Set the private key in the setup info.
   * @return {promise}
   */
  step.setPrivateKey = function () {
    var armoredPrivateKey = step.data.privateKeyArmored;

    return passbolt.request('passbolt.setup.set', 'key.privateKeyArmored', armoredPrivateKey)
      .then(function () {
        step.data.privateKeyArmored = armoredPrivateKey;
        return armoredPrivateKey;
      });
  };

  /**
   * Extract public key.
   * @return {promise}
   */
  step.extractPublicKey = function () {
    var armoredPrivateKey = step.data.privateKeyArmored;

    return passbolt.request('passbolt.keyring.public.extract', armoredPrivateKey)
      .then(function (publicKeyArmored) {
        step.data.publicKeyArmored = publicKeyArmored;
        return publicKeyArmored;
      });
  };

  passbolt.setup.steps[step.id] = step;

})(passbolt);
