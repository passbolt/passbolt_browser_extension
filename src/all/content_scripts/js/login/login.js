/**
 * Login page.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.login = passbolt.login || {};

$(function () {

  var passphraseIframeId = 'passbolt-iframe-login-form';

  /* ==================================================================================
   *  View Events Listeners
   * ================================================================================== */

  /**
   * Starts with server key check.
   */
  passbolt.login.onStep0Start = function () {
    var $renderSpace = $('.login.page .js_main-login-section'),
        browserName = passbolt.html.getBrowserName();
        tplData = {
          serverKeyId: 'fetching...',
          browserName: browserName
        };

    passbolt.html.loadTemplate($renderSpace, 'login/stage0.ejs', 'html', tplData)
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
          .catch(function () {
            // Display error message.
            $('.plugin-check.gpg').removeClass('notice').addClass('error');
            $('.plugin-check.gpg .message').text('Error: Could not find server key');
            passbolt.html.loadTemplate('.login.form', 'login/feedbackLoginOops.ejs');
          });
      });
  };

  /**
   * Server key check.
   */
  passbolt.login.onStep0CheckServerKey = async function () {
    passbolt.login.onStep1RequestPassphrase();

    try {
      const result = await passbolt.request('passbolt.auth.verify');
      passbolt.login.handleVerifySuccess(result);
    } catch (error) {
      passbolt.login.handleVerifyError(error);
    }
  };

  /**
   * Handle when the verify is a success
   * @param {string} msg The success message
   */
  passbolt.login.handleVerifySuccess = function(msg) {
    $('.plugin-check.gpg')
      .removeClass('notice')
      .addClass('success');

    passbolt.html.loadTemplate('.plugin-check.gpg', 'login/message.ejs', 'html', {message: msg});

    $('html').addClass('server-verified');
  };

  /**
   * Handle when the verify fail.
   * @param {object} error The error message
   */
  passbolt.login.handleVerifyError = function(error) {
    $('.plugin-check.gpg')
      .removeClass('notice')
      .addClass('error');

    passbolt.html.loadTemplate('.plugin-check.gpg', 'login/message.ejs', 'html', {message: error.message});
    $('html').addClass('server-not-verified');

    if (error.name === "KeyIsExpired") {
      // Nothing to do
    } else if (error.name === "ServerKeyChanged") {
      passbolt.login.onStep0ChangeKey();
    } else if (error.message.indexOf('no user associated') != -1) {
      // Special case to handle if the user doesn't exist on server.
      $('html').addClass('server-no-user');
      var passboltDomain = window.location.href.replace(/(.*)(\/auth\/login)(.*)$/, '$1');
      passbolt.html.loadTemplate('.login.form', 'login/feedbackLoginNoUser.ejs', 'html', {
        passboltDomain: passboltDomain
      });
    }
    // All other cases.
    else {
      passbolt.html.loadTemplate('.login.form', 'login/feedbackLoginOops.ejs');
    }
  };

  /**
   * Insert the passphrase dialog iframe.
   */
  passbolt.login.onStep0ChangeKey = function () {
    // Inject the change key dialog iframe into the web page DOM.
    // piggy back on login form page mod / port
    const iframeId = 'passbolt-iframe-login-change-key';
    const port = passphraseIframeId;
    const className = 'loading';
    const appendTo = '.login.form';
    const style = 'width:330px;height:250px;';
    $(appendTo).empty();
    passbolt.html.insertIframe(iframeId, appendTo, className, null, null, style, port);
  };

  /**
   * Insert the passphrase dialog iframe.
   */
  passbolt.login.onStep1RequestPassphrase = function () {
    // Inject the passphrase dialog iframe into the web page DOM.
    // See passboltAuthPagemod and login-form for the logic inside the iframe
    const iframeId = passphraseIframeId;
    const className = 'loading';
    const appendTo = '.login.form';
    const params = new URLSearchParams(window.location.search.substring(1));
    const redirect = params.get('redirect');

    $(appendTo).empty();
    passbolt.html.insertIframe(iframeId, appendTo, className, {redirect});
  };

  /* ==================================================================================
   *  Add-on Code Events Listeners
   * ================================================================================== */

  // Add a css class to an html element
  passbolt.message.on('passbolt.auth.add-class', function (selector, cssClass) {
    $(selector).addClass(cssClass);
  });

  // Remove a css class to an html element
  passbolt.message.on('passbolt.auth.remove-class', function (selector, cssClass) {
    $(selector).removeClass(cssClass);
  });

  // GPGAuth is completed with success
  passbolt.message.on('passbolt.auth.login-success', function (message, redirect) {
    $('html').addClass('loaded').removeClass('loading');
    window.location.replace(redirect);
  });

  // GPGAuth failed
  passbolt.message.on('passbolt.auth.login-failed', function (message) {
    var tplData = {message: message};
    passbolt.html.loadTemplate('.login.form', 'login/feedbackLoginError.ejs', 'html', tplData);
  });

  // Passphrase have been captured and verified
  passbolt.message.on('passbolt.auth.login-processing', function (message) {
    $('html').addClass('loading').removeClass('loaded');
    // remove the iframe and tell the user we're logging in
    var tplData = {message: message};
    passbolt.html.loadTemplate('.login.form', 'login/feedbackPassphraseOk.ejs', 'html', tplData);
  });

  /* ==================================================================================
   *  Content script init
   * ================================================================================== */

  /**
   * Initialize the login.
   */
  passbolt.login.init = function () {
    passbolt.login.onStep0Start();
  };

  passbolt.login.init();
});
undefined; // result must be structured-clonable data
