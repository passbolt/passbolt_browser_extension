/**
 * Debug page.
 *
 * Note for Mozilla addon reviewers:
 * These are debug events only available when the application is on Debug mode
 * and one of the passbolt application pages is loaded. They are used to
 * access debug tools needed by the passbolt developers.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.debug = passbolt.debug || {};

$(function () {

  // If the Debug Common is already defined, return.
  if (passbolt.debug.DebugCommon) {
    return;
  }

  /**
   * Init the passbolt debug.
   */
  var DebugCommon = function () {
    // Initialize the debug meta.
    this.initMeta();
    this.initEventsListeners();
  };

  /**
   * Initialize the debug meta.
   * Insert in the window meta the debug meta.
   */
  DebugCommon.prototype.initMeta = function() {
    var meta = {};
    return passbolt.request('passbolt.addon.get-url')
      .then(function(addonUrl) {
        meta['addon-url'] = addonUrl;
      })
      .then(function() {
        for(var name in meta) {
          var metaName = 'data-passbolt-' + name;
          $('head').attr(metaName, meta[name]);
        }
      });
  };

  /**
   * Init the debug common event listeners.
   */
  DebugCommon.prototype.initEventsListeners = function() {
    var self = this;
    window.addEventListener('passbolt.addon.debug.open_tab', function() {
      self.openTab();
    });
  };

  /**
   * Open a new Tab.
   * We implemented this function as it to have a unique interface whatever browsers used to test the extension.
   * Moreover with FF54 & geckodriver 0.19 it's not possible anymore to open a new tab.
   *
   * @param url {string} The url to open in the new tab.
   */
  DebugCommon.prototype.openTab = function (url) {
    passbolt.message.emit('passbolt.debug.open-tab', url);
  };

  // Init the addon debug.
  passbolt.debug.DebugCommon = DebugCommon;
  new DebugCommon();

});
undefined;
