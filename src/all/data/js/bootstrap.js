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
    var _this = this;
    this.isPluginIsconfigured = false;
    this.isTrustedDomain = false;
    this.trustedDomain = '';

    // Check if the addon is configured
    this.loadConfiguration()
      // Boostrap common.
      .then(function () {
        _this.boostrapCommon();
      })
      // Boostrap login page.
      .then(function () {
        _this.boostrapLoginPage();
      });
  };

  /**
   * Load the bootsrap configuration.
   * @returns {Promise}
   */
  Bootstrap.prototype.loadConfiguration = function () {
    var _this = this;

    return Promise.all([
      passbolt.request('passbolt.addon.isConfigured'),
      passbolt.request('passbolt.addon.checkDomain'),
      passbolt.request('passbolt.addon.getDomain')
    ]).then(function (data) {
      _this.isPluginIsconfigured = data[0];
      _this.isTrustedDomain = data[1];
      _this.trustedDomain = data[2];
    });
  };

  /**
   * Bootstrap all pages from all domain.
   */
  Bootstrap.prototype.boostrapCommon = function () {
    $('html').removeClass('no-passboltplugin')
      .addClass('passboltplugin');

    if (this.isPluginIsconfigured) {
      $('html').addClass('passboltplugin-config')
        .removeClass('no-passboltplugin-config');
    } else {
      $('html').addClass('no-passboltplugin-config')
        .removeClass('passboltplugin-config');
    }
  };

  /**
   * Bootstrap the login page.
   * The login process is mainly managed by the authPageMod, but some cases
   * are managed by the common boostrap such as :
   * - Plugin configured but on the wrong domain. When the user tries to access
   *   another passbolt instance than the one he has configured the plugin for.
   * - Plugin not configured.
   */
  Bootstrap.prototype.boostrapLoginPage = function () {
    // If not on the login page.
    if (!$('.passbolt .login.page').length) {
      return;
    }

    // If the plugin is not configured.
    if (this.isPluginIsconfigured) {
      // If not on a trusted domain.
      if (!this.isTrustedDomain) {
        this.loginPageWrongDomain();
      }
    }
    else {
      this.loginPageConfigurationMissing();
    }

    // Init the version component.
    this.initVersion();
  };

  /**
   * On the login page, when the domain is not the right one, but the plugin is already configured.
   * @returns {promise}
   */
  Bootstrap.prototype.loginPageWrongDomain = function () {
    $('html').addClass('domain-unknown');
    var $renderSpace = $('.login.page .js_main-login-section'),
      publicRegistration = $('.login.page.public-registration').length > 0 ? true : false,
      passboltDomain = window.location.href.replace(/(.*)(\/auth\/login(\/)?)$/, '$1');

    // Get template.
    passbolt.helper.html.loadTemplate($renderSpace, './tpl/login/wrong-domain.ejs', 'html', {
      trustedDomain: this.trustedDomain,
      publicRegistration: publicRegistration,
      passboltDomain: passboltDomain
    });
  };

  /**
   * On the login page, when the plugin configuration is missing.
   * @returns {promise}
   */
  Bootstrap.prototype.loginPageConfigurationMissing = function () {
    var $renderSpace = $('.login.page .js_main-login-section'),
      publicRegistration = $('.login.page.public-registration').length > 0 ? true : false,
        passboltDomain = window.location.href.replace(/(.*)(\/auth\/login(\/)?)$/, '$1');

    return passbolt.helper.html.loadTemplate($renderSpace, './tpl/login/noconfig.ejs', 'html', {
      publicRegistration: publicRegistration,
      passboltDomain: passboltDomain
    });
  };

  /**
   * Initialize the plugin version section.
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
