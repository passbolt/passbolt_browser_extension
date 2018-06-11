/**
 * Secret share iframe control.
 *
 * It has for aim to control the secret share dialog iframe.
 *  - Add the iframe to the application page. The secretShareDialogPagemod
 *    will detect it and will control its DOM.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  /**
   * Insert the secret share iframe into the share password dialog provided
   * by the application page.
   */
  var _insertIframes = function () {
    // The component managing the autocomplete field.
    var iframeId = 'passbolt-iframe-password-share';
    var className = 'loading';
    var prependTo = '.js_plugin_share_wrapper';
    passbolt.html.insertThemedIframe(iframeId, prependTo, className, undefined, 'prepend');

    // The component managing the autocomplete result list.
    iframeId = 'passbolt-iframe-password-share-autocomplete';
		className = 'hidden';
		var style = 'margin-top:-12px';
		var appendTo = $('#passbolt-password-share-autocomplete-wrapper', '.js_plugin_share_wrapper');
    passbolt.html.insertThemedIframe(iframeId, appendTo, className, undefined, 'append', style);
  };

  /*
   * Open the secret share control component when a password is shared.
   * passbolt.plugin.resource_share
   */
  window.addEventListener("passbolt.plugin.resource_share", function (event) {
    var data = event.detail;

    // Initialize the process.
    passbolt.request('passbolt.app.share-password-init', {
      resourceId: data.resourceId,
      armored: data.armored
    }).then(function () {
      _insertIframes();
    });
  }, false);

});
undefined; // result must be structured-clonable data