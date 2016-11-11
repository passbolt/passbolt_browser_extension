/**
 * Bootstrap.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};

(function ($) {
  /**
   * Init the passbolt bootstrap.
   */
  var Bootstrap = function () {
    var promise,
      _this = this,
      isConfigured = false;

    // Add default classes relative to plugin.
    $('html')
      .removeClass('no-passboltplugin')
      .addClass('passboltplugin');

    // Check if the addon is configured
    passbolt.request('passbolt.addon.isConfigured')
      .then(function (response) {
        isConfigured = response;
        if (isConfigured === true) {
          $('html').addClass('passboltplugin-config')
            .removeClass('no-passboltplugin-config');

          // If configure but not on the trusted domain
          // display a feedback to the user.
          _this.checkDomain();
        } else {
          $('html').addClass('no-passboltplugin-config')
            .removeClass('passboltplugin-config');
          _this.onConfigurationMissing();
        }
      })

      // Init the version
      .then(function(){
        _this.initVersion();
      });

  };


  /**
   * Check if on the trusted domain.
   * @returns {promise}
   */
  Bootstrap.prototype.checkDomain = function () {
    var _this = this;
    return passbolt.request('passbolt.addon.checkDomain')
      .then(function (isTrustedDomain) {
        if (isTrustedDomain !== true) {
          return _this.onWrongDomain();
        }
      });
  };

  /**
   * When the domain is not the right one, but the plugin is already configured.
   * @returns {promise}
   */
  Bootstrap.prototype.onWrongDomain = function () {
    $('html').addClass('domain-unknown');
    var $renderSpace = $('.login.page .js_main-login-section'),
      publicRegistration = $('.login.page.public-registration').length > 0 ? true : false;

    // Get trusted domain setting.
    return passbolt.request('passbolt.addon.getDomain').then(
      function (trustedDomain) {
        // Get template.
        passbolt.helper.html.loadTemplate($renderSpace, './tpl/login/wrong-domain.ejs', 'html', {
          trustedDomain: trustedDomain,
          publicRegistration: publicRegistration
        });
      });
  };

  /**
   * When the plugin configuration is missing
   * @returns {promise}
   */
  Bootstrap.prototype.onConfigurationMissing = function () {
    var $renderSpace = $('.login.page .js_main-login-section'),
      publicRegistration = $('.login.page.public-registration').length > 0 ? true : false;

    return passbolt.helper.html.loadTemplate($renderSpace, './tpl/login/noconfig.ejs', 'html', {publicRegistration: publicRegistration});
  };

  /**
   * Initialize the plugin version
   * @returns {promise}
   */
  Bootstrap.prototype.initVersion = function () {
    // Get plugin version and add it in the footer.
    return passbolt.request('passbolt.addon.getVersion')
      .then(function (version) {
        var $versionElt = $('#version > a'),
          appVersion = $versionElt.attr('data-tooltip');
        $versionElt.attr('data-tooltip', (appVersion + ' / ' + version));
      });
  };

  // Boostrap passbolt.
  new Bootstrap();

})(jQuery);
