/**
 * Bootstrap.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.bootstrap = passbolt.bootstrap || {};

(function ($) {

  /**
   * When the domain is not the right one, but the plugin is already configured.
   */
  passbolt.bootstrap.onWrongDomain = function () {
    $('html').addClass('domain-unknown');

    var $renderSpace = $('.login.page .js_main-login-section'),
      publicRegistration = $('.login.page.public-registration').length > 0 ? true : false;

    // Get trusted domain setting.
    passbolt.request('passbolt.addon.getDomain').then(
      function success(trustedDomain) {
        // Get template.
        passbolt.helper.html.loadTemplate($renderSpace, './tpl/login/wrong-domain.ejs', 'html', {
          trustedDomain: trustedDomain,
          publicRegistration: publicRegistration
        });
      });
  };

  // Get plugin version and add it in the footer.
  passbolt.request('passbolt.addon.getVersion')
    .then(function (version) {
      var $versionElt = $('#version > a');
      var appVersion = $versionElt.attr('data-tooltip');
      $versionElt.attr('data-tooltip', (appVersion + ' / ' + version));
    });

  // check if the plugin is configured
  passbolt.request('passbolt.addon.isConfigured')
    .then(function (response) {
      if (response !== true) {
        $('html')
          .addClass('no-passboltplugin-config')
          .removeClass('passboltplugin-config');
      } else {
        $('html')
          .addClass('passboltplugin-config')
          .removeClass('no-passboltplugin-config');
      }
    });

  // Add classes relative to plugin.
  $('html')
    .removeClass('no-passboltplugin')
    .addClass('passboltplugin');

  // check if it is a passbolt app instance on the login page
  if ($('html.passbolt .login.page').length) {
    // If passbolt is configured.
    passbolt.request('passbolt.addon.isConfigured')
      .then(function (response) {
        if (response === true) {
          // If domain is right.
          passbolt.request('passbolt.addon.checkDomain').then(
            function success(response) {
              // Domain not right, we redirect to wrong domain page.
              if (response !== true) {
                passbolt.bootstrap.onWrongDomain();
                return;
              }

              // Domain is right, we go to login.
              passbolt.request('passbolt.bootstrap.login').then(
                function success(refresh) {
                  if (refresh) {
                    location.reload();
                  }
                }
              );
            }
          );
        }
      });
  }

  // check if it is a passbolt app instance on the debug page
  if ($('html.passbolt .debug.page').length) {
    passbolt.request('passbolt.bootstrap.debug');
  }

})(jQuery);
