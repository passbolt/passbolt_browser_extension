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

  const iframeId = 'passbolt-iframe-password-share';

  /**
   * Insert the share iframe dialog.
   * @private
   */
  const _insertShareIframe = function() {
    const className = 'passbolt-plugin-dialog';
    const appendTo = '#container';
    return passbolt.html.insertThemedIframe(iframeId, appendTo, className);
  };

  /*
   * Open the password(s) share component.
   */
  window.addEventListener("passbolt.plugin.resources_share", function (event) {
    const data = event.detail;
    const resourcesIds = Object.values(data.resourcesIds);
    passbolt.request('passbolt.app.share-init', resourcesIds)
      .then(() => _insertShareIframe())
      .then(() => $('.edit-password-dialog').remove());
  }, false);

  /**
   * @deprecated since v2.4.0 will be removed in v3.0
   * replaced by the bulk share event "passbolt.plugin.resources_share"
   */
  window.addEventListener("passbolt.plugin.resource_share", function (event) {
    const data = event.detail;
    const resourceId = data.resourceId;
    // Remove the dialog inserted by the app-js.
    // And insert the plugin version
    $('.share-password-dialog').remove();
    passbolt.request('passbolt.app.share-init', [resourceId])
      .then(() => _insertShareIframe())
      .then(() => $('.edit-password-dialog').remove());
  }, false);

  /*
   * The share is completed with success.
   */
  passbolt.message.on('passbolt.share.complete', function () {
    $(`#${iframeId}`).remove();
    passbolt.message.emitToPage('passbolt.share.complete');
    passbolt.message.emitToPage('passbolt_notify', {
      status: 'success',
      title: 'app_share_share_success'
    });
  });

  /*
   * Close the share iframe
   */
  passbolt.message.on('passbolt.share.close', function () {
    $(`#${iframeId}`).remove();
  });

  /*
   * Go to edit dialog
   */
  passbolt.message.on('passbolt.share.go-to-edit', function () {
    $(`#${iframeId}`).remove();
    passbolt.message.emitToPage('passbolt.share.go-to-edit');
  });

});
undefined; // result must be structured-clonable data