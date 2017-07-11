/**
 * Login page.
 *
 * @copyright (c) 2017 Passbolt SARL
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
   * Starts with server key check.
   */
  passbolt.login.onStep0Start = function () {
    var $renderSpace = $('.login.page .js_main-login-section'),
        browserName = passbolt.html.getBrowserName();
        tplData = {
          serverKeyId: 'fetching...',
          browserName: browserName
        };

    passbolt.html.loadTemplate($renderSpace, 'data/tpl/login/stage0.ejs', 'html', tplData)
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
            passbolt.html.loadTemplate('.login.form', 'data/tpl/login/feedback-login-oops.ejs');
          });
      });
  };

  /**
   * Server key check.
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
          passbolt.html.loadTemplate('.login.form', 'data/tpl/login/feedback-login-no-user.ejs');
        }
        // All other cases.
        else {
          passbolt.html.loadTemplate('.login.form', 'data/tpl/login/feedback-login-oops.ejs');
        }
      }
    );
  };

  /**
   * Insert the passphrase dialog.
   */
  passbolt.login.onStep1RequestPassphrase = function () {
    var iframeUrl;
    var iframeId = passphraseIframeId;
    if(typeof chrome !== 'undefined') {
      iframeUrl = chrome.runtime.getURL('data/' + iframeId + '.html');
    } else {
      iframeUrl = 'about:blank';
    }
    iframeUrl += '?passbolt=' + iframeId;

    // Inject the passphrase dialog iframe into the web page DOM.
    var $iframe = $('<iframe/>', {
      id: iframeId,
      src: iframeUrl,
      frameBorder: 0,
      class: 'loading'
    });
    $('.login.form').empty().append($iframe);

    // See passboltAuthPagemod and login-form for the logic
    // inside the iframe
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
  passbolt.message.on('passbolt.auth.login-success', function (message, referrer) {
    $('html').addClass('loaded').removeClass('loading');
    window.top.location.href = referrer;
  });

  // GPGAuth failed
  passbolt.message.on('passbolt.auth.login-failed', function (message) {
    var tplData = {message: message};
    passbolt.html.loadTemplate('.login.form', 'data/tpl/login/feedback-login-error.ejs', 'html', tplData);
  });

  // Passphrase have been captured and verified
  passbolt.message.on('passbolt.auth.login-processing', function (message) {
    $('html').addClass('loading').removeClass('loaded');
    // remove the iframe and tell the user we're logging in
    var tplData = {message: message};
    passbolt.html.loadTemplate('.login.form', 'data/tpl/login/feedback-passphrase-ok.ejs', 'html', tplData);
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

})();
