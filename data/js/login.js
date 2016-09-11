/**
 * Login page.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.login = passbolt.login || {};

(function () {

  var passphraseIframeId = 'passbolt-iframe-login-form';

  /* ==================================================================================
   *  View Events Listeners
   * ================================================================================== */

  /**
   * When the plugin configuration is missing
   */
  passbolt.login.onConfigurationMissing = function () {
    var $renderSpace = $('.login.page .js_main-login-section'),
      publicRegistration = $('.login.page.public-registration').length > 0 ? true : false;

    return passbolt.helper.html.loadTemplate($renderSpace, './tpl/login/noconfig.ejs', 'html', {publicRegistration: publicRegistration});
  };

  /**
   * Starts with server key check
   */
  passbolt.login.onStep0Start = function () {
    var $renderSpace = $('.login.page .js_main-login-section'),
      tplData = {serverKeyId: 'fetching...'};

    passbolt.helper.html.loadTemplate($renderSpace, './tpl/login/stage0.ejs', 'html', tplData)
      .then(function () {
        // Display information about the state of login
        // e.g. that we're going to check for the server key first
        passbolt.request('passbolt.keyring.server.get')
          .then(function (serverKeyInfo) {
            // Display server key in the box.
            $('#serverkey_id').text(serverKeyInfo.keyId.toUpperCase());

            // Starts checking server key.
            passbolt.login.onStep0CheckServerKey();
          })
          .then(null, function () {
            // Display error message.
            $('.plugin-check.gpg').removeClass('notice').addClass('error');
            $('.plugin-check.gpg .message').text('Error: Could not find server key');
            passbolt.helper.html.loadTemplate('.login.form', './tpl/login/feedback-login-oops.ejs');
          });
      });
  };

  /**
   * Server key check
   */
  passbolt.login.onStep0CheckServerKey = function () {

    passbolt.request('passbolt.auth.verify').then(
      function success(msg) {
        $('.plugin-check.gpg')
          .removeClass('notice')
          .addClass('success')
          .html('<p class="message">' + msg + '<p>');

        $('html').addClass('server-verified');
        passbolt.login.onStep1RequestPassphrase();
      },
      function error(msg) {
        $('.plugin-check.gpg')
          .removeClass('notice')
          .addClass('error')
          .html('<p class="message">' + msg + '<p>');

        $('html').addClass('server-not-verified');

        // Special case to handle if the user doesn't exist on server.
        if (msg.indexOf('no user associated') != -1) {
          $('html').addClass('server-no-user');
          passbolt.helper.html.loadTemplate('.login.form', './tpl/login/feedback-login-no-user.ejs');
        }
        // All other cases.
        else {
          passbolt.helper.html.loadTemplate('.login.form', './tpl/login/feedback-login-oops.ejs');
        }
      }
    );
  };

  /**
   * Insert the passphrase dialog
   */
  passbolt.login.onStep1RequestPassphrase = function () {

    // Inject the passphrase dialog iframe into the web page DOM.
    var $iframe = $('<iframe/>', {
      id: passphraseIframeId,
      src: 'about:blank?passbolt=' + passphraseIframeId,
      frameBorder: 0
    });
    $('.login.form').empty().append($iframe);

    // See passboltAuthPagemod and login-form for the logic
    // inside the iframe
  };

  /* ==================================================================================
   *  Add-on Code Events Listeners
   * ================================================================================== */

  // GPGAuth is complete
  passbolt.message.on('passbolt.auth.login.complete', function (token, status, message, referrer) {
    if (status === 'SUCCESS') {
      $('html').addClass('loaded').removeClass('loading');
      window.top.location.href = referrer;
    } else if (status === 'ERROR') {
      var tplData = {message: message};
      passbolt.helper.html.loadTemplate('.login.form', './tpl/login/feedback-login-error.ejs', 'html', tplData);
    }
  });

  // Passphrase have been captured and verified
  passbolt.message.on('passbolt.auth.login.start', function (token, status, message) {
    $('html').addClass('loading').removeClass('loaded');
    // remove the iframe and tell the user we're logging in
    var tplData = {message: message};
    passbolt.helper.html.loadTemplate('.login.form', './tpl/login/feedback-passphrase-ok.ejs', 'html', tplData);
  });

  /* ==================================================================================
   *  Content script init
   * ================================================================================== */

  /**
   * Check if the addon says we are ready for login
   */
  passbolt.login.init = function () {

    if (self.options.ready === true) {
      passbolt.login.onStep0Start();
    } else {
      passbolt.login.onConfigurationMissing();
    }
  };

  passbolt.login.init();

})();
