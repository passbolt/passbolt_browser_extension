/**
 * Bootstrap.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};

$(function () {

  /**
   * Init the passbolt bootstrap.
   */
  var Bootstrap = function () {
    var _this = this;
    this.isPluginIsconfigured = false;
    this.isTrustedDomain = false;
    this.trustedDomain = '';

    // Do not bootstrap on non passbolt app pages
    if($('html.passbolt.no-passboltplugin').length === 1) {
      // Check if the addon is configured
      this.loadConfiguration()
        // Boostrap common.
        .then(function () {
          _this.bootstrapCommon();
        })
        // Boostrap login page.
        .then(function () {
          _this.bootstrapLoginPage();
        });
    }
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
  Bootstrap.prototype.bootstrapCommon = function () {
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
   * are managed by the common bootstrap such as :
   * - Plugin configured but on the wrong domain. When the user tries to access
   *   another passbolt instance than the one he has configured the plugin for.
   * - Plugin not configured.
   */
  Bootstrap.prototype.bootstrapLoginPage = function () {
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
    } else {
      this.loginPageConfigurationMissing();
    }

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
      passboltDomain = window.location.href.replace(/(.*)(\/auth\/login(\/)?)$/, '$1'),
      browserName = passbolt.html.getBrowserName();

    passbolt.html.loadTemplate($renderSpace, 'login/wrongDomain.ejs', 'html', {
      trustedDomain: this.trustedDomain,
      publicRegistration: publicRegistration,
      passboltDomain: passboltDomain,
      browserName: browserName
    });
  };

  /**
   * On the login page, when the plugin configuration is missing.
   * @returns {promise}
   */
  Bootstrap.prototype.loginPageConfigurationMissing = function () {
    var $renderSpace = $('.login.page .js_main-login-section'),
      publicRegistration = $('.login.page.public-registration').length > 0 ? true : false,
      passboltDomain = window.location.href.replace(/(.*)(\/auth\/login(\/)?)$/, '$1'),
	  browserName = passbolt.html.getBrowserName();

    return passbolt.html.loadTemplate($renderSpace, 'login/noconfig.ejs', 'html', {
      publicRegistration: publicRegistration,
      passboltDomain: passboltDomain,
      browserName: browserName
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
});