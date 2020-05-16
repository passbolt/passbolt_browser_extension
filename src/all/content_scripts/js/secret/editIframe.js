/**
 * Secret edition/creation iframe control.
 *
 * It has for aim to control the secret edition/creation dialog iframe.
 *  - Add the iframe to the application page. The secretEditDialogPagemod
 *    will detect it and will control its DOM.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  /**
   * Insert the secret edition/creation iframe into the edit password dialog
   * provided by the application page.
   *
   * @param dialogCase {string} The case the component will be instantiated for.
   *  Can be create or edit.
   */
  var _insertIframe = function (dialogCase) {
    const iframeId = 'passbolt-iframe-secret-edition';
    const appendTo = '.js_form_secret_wrapper';
    const urlOptions = {'case' : dialogCase};
    const className = 'loading';
    passbolt.html.insertThemedIframe(iframeId, appendTo, className, urlOptions);
  };

  /*
   * Open the secret field control component when a password is created or edited.
   * @listens passbolt.plugin.resource_edition
   * @deprecated since v2.7 will be removed in v3.0
   */
  window.addEventListener("passbolt.plugin.resource_edition", function () {
    var editData = {
        armored: null,
        resourceId: null,
        secret: ''
      },
      dialogCase = 'create';

    // If a secret id is given that mean we're editing a password.
    if ($('#js_field_secret_id_0').val() != '') {
      dialogCase = 'edit';
      editData.resourceId = $('#js_field_resource_id').val();
      editData.armored = $('#js_field_secret_data_0').val();
      editData.secret = null;
    }

    passbolt.request('passbolt.edit-password.set-edited-password', editData)
      .then(function () {
        _insertIframe(dialogCase);
      });
  }, false);

  /*
   * Open the secret field control component when a password is created or edited.
   * @listens passbolt.plugin.resource_edition
   */
  window.addEventListener("passbolt.plugin.resource_edit", async function (event) {
    const data = event.detail;
    let resourceId;
    if (typeof data == 'string' && validator.isUUID(data)) {
      resourceId = data;
    }
    const editData = {
        armored: null,
        resourceId: resourceId,
        secret: resourceId ? null : ''
      };
    const dialogCase = resourceId ? 'edit' : 'create';
    await passbolt.request('passbolt.edit-password.set-edited-password', editData);
    _insertIframe(dialogCase);
  }, false);


});
// result must be structured-clonable data
undefined;
