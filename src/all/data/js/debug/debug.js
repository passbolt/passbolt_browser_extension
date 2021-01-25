/**
 * Debug page.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
$(function () {

  // shortcut for selectors
  var $myKeyAscii = $('#myKeyAscii'),
    $serverKeyAscii = $('#serverKeyAscii'),
    $domain = $('#baseUrl'),
    $firstname = $('#ProfileFirstName'),
    $lastname = $('#ProfileLastName'),
    $username = $('#UserUsername'),
    $userid = $('#UserId'),
    $securityTokenCode = $('#securityTokenCode'),
    $securityTokenColor = $('#securityTokenColor'),
    $securityTokenTextColor = $('#securityTokenTextColor');

  /**
   * Uppercase the first letter
   * @returns {string}
   */
  String.prototype.ucfirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  /**
   * initialize the debug page.
   */
  var init = function () {
    // Init the user section
    initUserSection()
      .then(initKeysSection)
      .then(initLocalStorageSection)
      .then(initLogsSection)
      .then(function () {
        initEventListeners();
        initTestProfilesSection();
        $('.config.page').addClass('ready');
      },function() {
        console.error('Something went wrong when initializing the the setup page.');
      });
  };

  /**
   * Initialize the user section
   */
  var initUserSection = function () {
    return new Promise(function(resolve, reject) {
      passbolt.request('passbolt.user.get')
        .then(function (user) {
          updateUserForm(user);
          resolve();
        }, function(error) {
          // no user, no problem
          resolve();
        })
    });
  };

  /**
   * Initialize the key section
   */
  var initKeysSection = function () {
    var p1 = new Promise(function(resolve, reject) {
      // Retrieve the user private key.
      passbolt.request('passbolt.keyring.private.get')
        .then(function (keyInfo) {
          updateKeyInfo(keyInfo, 'client');
          resolve();
        }, function(error) {
          // no private key, no problem
          resolve();
        });
    });
    var p2 = new Promise(function(resolve, reject) {
      // Retrieve the server public key.
      passbolt.request('passbolt.keyring.server.get')
      // Update the server key information.
        .then(function (keyInfo) {
          updateKeyInfo(keyInfo, 'server');
          resolve();
        }, function(error) {
          // no private key, no problem
          resolve();
        });
    });
    return Promise.all([p1, p2]);
  };

  /**
   * Init the local storage section.
   */
  var initLocalStorageSection = function () {
    return passbolt.request('passbolt.debug.config.readAll')
      .then(function (data) {
        $('#localStorage').html(JSON.stringify(data, undefined, 2));
      });
  };

  /**
   * Init the logs section.
   */
  var initLogsSection = function () {
    return passbolt.request('passbolt.debug.log.readAll')
      .then(function (data) {
        var logs = data.reduce(function(sum, log) {
          sum.push(log.created + ' [' + log.level + '] ' + log.message);
          return sum;
        }, []);
        $('#logsContent').html(JSON.stringify(logs, undefined, 2));
      });
  };

  /**
   * Init event listeners.
   */
  var initEventListeners = function () {
    $('#js_save_conf').on('click', onSaveUserSettings);
    $('#myKeyFilepicker').on('click', onBrowsePrivateKeyFile);
    $('#serverKeyFilepicker').on('click', onBrowseServerPublicKeyFile);
    $('#saveKey').on('click', onSaveUserKeyClick);
    $('#saveServerKey').on('click', onSaveServerKeyClick);
    $('#js_flush_conf').on('click', onFlushConfClick);
    $('#initAppPagemod').on('click', onInitAppPagemodClick);
    $('#simulateToolbarIcon').on('click', onSimulateToolbarIconClick);
    $('#saveTestProfile').on('click', onTestProfileSave);
    window.addEventListener('passbolt.debug.settings.set', onSetDebugSettings);
  };

  /**
   * Update the user form.
   * @param user {array} User information
   */
  var updateUserForm = function (user) {
    $firstname.val(user.firstname);
    $lastname.val(user.lastname);
    $username.val(user.username);
    $userid.val(user.id);
    $domain.val(user.settings.domain);
    $securityTokenColor.val(user.settings.securityToken.color);
    $securityTokenTextColor.val(user.settings.securityToken.textcolor);
    $securityTokenCode.val(user.settings.securityToken.code);
  };

  /**
   * Update the key information.
   * @param keyInfo {array} The key info
   * @param keyType {string} The key type. Can be: client, server.
   */
  var updateKeyInfo = function (keyInfo, keyType) {
    // No key provided
    if (!keyInfo) {
      feedbackHtml('There is no private key available please upload one.', 'error');
      return;
    }

    // The HTMLElement container.
    var $keyInfoContainer = $('#privkeyinfo'),
      $keyField = $myKeyAscii;
    if (keyType == 'server') {
      $keyInfoContainer = $('#pubkeyinfo-server');
      $keyField = $serverKeyAscii;
    }

    // Format and insert the key uid.
    var uid = '';
    for (var i in keyInfo.userIds) {
      uid += keyInfo.userIds[i].name + ' &lt;' + keyInfo.userIds[i].email + '&gt;';
    }
    $('.uid', $keyInfoContainer).html(uid);

    // Insert the other information
    $('.fingerprint', $keyInfoContainer).html(keyInfo.fingerprint);
    $('.algorithm', $keyInfoContainer).html(keyInfo.algorithm);
    $('.created', $keyInfoContainer).html(keyInfo.created);
    $('.expires', $keyInfoContainer).html(keyInfo.expires);
    $keyField.val(keyInfo.key);
  };

  /**
   * Helper to build feedback message
   * @param message {string} The message to display.
   * @param messageType {string} The message type
   * @returns {string}
   */
  var feedbackHtml = function (message, messageType) {
    return '<div class="message ' + messageType + '"><strong>' + messageType.ucfirst() + ':</strong> ' + message + '</div>';
  };

  /**
   *
   * @returns {*}
   */
  var initTestProfilesSection = function () {
    for (var i in passbolt.debug.profiles) {
      var profile = passbolt.debug.profiles[i];
      $('#TestProfile').append('<option value="' + profile['username'] + '">' + profile['username'] + '</option>');
    }
  };

  /* ==================================================================================
   *  Business/
   * ================================================================================== */

  /**
   * Save the user settings.
   * @param user {array} The user info
   * @returns {Promise}
   */
  var saveUserSettings = function (user) {
    return passbolt.request('passbolt.user.set', user).then(
      function () {
        $('.user.feedback').html(feedbackHtml('User and settings have been saved!', 'success'));
      },
      function (msg) {
        $('.user.feedback').html(feedbackHtml(msg, 'error'));
      }
    );
  };

  /**
   * Extract the user settings form information
   * @return {array}
   */
  var extractFormUserSettings = function () {
    var user = {};
    user.firstname = $firstname.val();
    user.lastname = $lastname.val();
    user.username = $username.val();
    user.id = $userid.val();
    user.settings = {};
    user.settings.securityToken = {
      code: $securityTokenCode.val(),
      color: $securityTokenColor.val(),
      textcolor: $securityTokenTextColor.val()
    };
    user.settings.domain = $domain.val();
    return user;
  };

  /* ==================================================================================
   *  Events handlers.
   * ================================================================================== */

  /**
   * Handle save user settings button click.
   */
  var onSaveUserSettings = function () {
    var user = extractFormUserSettings();
    saveUserSettings(user);
  };

  /**
   * Handle browse private key file button click.
   */
  var onBrowsePrivateKeyFile = function () {
    passbolt.file.get()
      .then(function (key) {
        $myKeyAscii.val(key);
      });
  };

  /**
   * Handle browse server public key file button click.
   */
  var onBrowseServerPublicKeyFile = function () {
    // passbolt.request('passbolt.file.prompt')
    passbolt.file.get()
      .then(function (key) {
        $serverKeyAscii.val(key);
      });
  };

  /**
   * Handle save user key button click
   */
  var onSaveUserKeyClick = function () {
    var key = $myKeyAscii.val();
    passbolt.request('passbolt.keyring.private.import', key)
      .then(function () {
        $('.my.key-import.feedback')
          .html(feedbackHtml('The key has been imported succesfully.', 'success'));
        return initKeysSection();
      }, function (error) {
        $('.my.key-import.feedback')
          .html(feedbackHtml('something went wrong during the import: ' + error, 'error'));
      });
  };

  /**
   * Handle save server key button click
   */
  var onSaveServerKeyClick = function () {
    var serverKey = $serverKeyAscii.val();
    passbolt.request('passbolt.keyring.server.import', serverKey)
      .then(function () {
        $('.server.key-import.feedback')
          .html(feedbackHtml('The key has been imported successfully.', 'success'));
        return initKeysSection();
      }, function (error) {
        $('.server.key-import.feedback')
          .html(feedbackHtml('something went wrong during the import: ' + error, 'error'));
      });
  };

  /**
   * Handle flush conf button click
   */
  var onFlushConfClick = function () {
    passbolt.message.emit('passbolt.debug.config.flush');
  };

  /**
   * Handle init app pagemod button click
   */
  var onInitAppPagemodClick = function () {
    passbolt.message.emit('passbolt.debug.appPagemod.init');
  };

  /**
   * Handle init app pagemod button click
   */
  var onSimulateToolbarIconClick = function () {
    passbolt.message.emit('passbolt.debug.simulateToolbarIconClick');
  };

  /**
   * Handle set debug settings event.
   * Selenium use it to fill the debug page faster.
   */
  var onSetDebugSettings = function () {
    $('body').removeClass('debug-data-set');

    // Retrieve data that have been injected in the js_auto_settings field.
    var json = $('#js_auto_settings').val();
    if (json != '') {
      // Decode the data : base64 & json
      json = atob(json);
      var conf = JSON.parse(json),
        user = {
          firstname: conf.ProfileFirstName,
          lastname: conf.ProfileLastName,
          username: conf.UserUsername,
          id: conf.UserId,
          settings: {
            domain: conf.baseUrl,
            securityToken: {
              color: conf.securityTokenColor,
              textcolor: conf.securityTokenTextColor,
              code: conf.securityTokenCode
            }
          }
        };
      updateUserForm(user);
      $myKeyAscii.val(conf.myKeyAscii);
      $serverKeyAscii.val(conf.serverKeyAscii);
    }

    $('body').addClass('debug-data-set');
  };

  /**
   * Handle test profile selection.
   */
  var onTestProfileSave = function () {
    var profileName = $('#TestProfile').val();
    if (profileName == '') {
      return;
    }

    var profile = passbolt.debug.profiles[profileName];
    updateUserForm(profile);
    $myKeyAscii.val(profile.privateKey);
    $serverKeyAscii.val(profile.publicKey);
    $('#js_save_conf').trigger('click');
    $('#saveKey').trigger('click');
    $('#saveServerKey').trigger('click');
  };

  // Init the debug page.
  init();
});
