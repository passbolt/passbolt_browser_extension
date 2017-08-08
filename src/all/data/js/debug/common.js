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
  };

  /**
   * Initialize the debug meta.
   * Insert in the window meta the debug meta.
   */
  DebugCommon.prototype.initMeta = function() {
    var meta = {};
    return passbolt.request('passbolt.addon.getUrl')
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

  // Init the addon debug.
  passbolt.debug.DebugCommon = DebugCommon;
  new DebugCommon();

});
