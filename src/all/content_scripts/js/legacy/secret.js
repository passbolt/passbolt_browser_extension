/**
 * Secret edition/creation iframe control.
 *
 * It has for aim to provide legacy support for old version of the
 * appjs that were addeing the iframe to the application page.
 *
 * @copyright (c) 2020 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {
  const legacyEventToNewEvent = (type, data) => {
    data = data || {};
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, data);
    document.documentElement.dispatchEvent(event);
  };

  const openDialog = async (resourceId) => {
    // Initialize/Update manually the resources local storage prior to version v2.11.0. The storage is required
    // by the new implementation of the add/update resources operations.
    // There are issues with some scenarios prior to v2.11.0, by instance:
    // 1. storage has been updated;
    // 2. another user share a resource with the current user;
    // 3. the current user reload the grid by click on all items (appjs API request);
    // 4. the user try to edit a resource that is not in the local storage.
    const { resources } = await browser.storage.local.get(["resources"]);
    if (!resources || !Array.isArray(resources)) {
      passbolt.request('passbolt.resources.update-local-storage');
    }

    if (!resourceId) {
      legacyEventToNewEvent('passbolt.plugin.resources.open-create-dialog');
      $('.create-password-dialog').remove();
    } else {
      legacyEventToNewEvent('passbolt.plugin.resources.open-edit-dialog', {id: resourceId});
      $('.edit-password-dialog').remove();
    }
  };

  /*
   * Open the secret field control component when a password is created or edited.
   * @listens passbolt.plugin.resource_edition
   * @deprecated since v2.7 will be removed in v3.0
   */
  window.addEventListener("passbolt.plugin.resource_edition", function () {
    let resourceId;
    if ($('#js_field_secret_id_0').val() !== '') {
      let data = $('#js_field_resource_id').val();
      if (typeof data == 'string' && validator.isUUID(data)) {
        resourceId = data;
      }
    }
    openDialog(resourceId);
  }, false);

  /*
   * Open the secret field control component when a password is created or edited.
   * @listens passbolt.plugin.resource_edition
   * @deprecated since v2.13 will be removed in v3.0
   */
  window.addEventListener("passbolt.plugin.resource_edit", async function (event) {
    const data = event.detail;
    let resourceId;
    if (typeof data == 'string' && validator.isUUID(data)) {
      resourceId = data;
    }
    openDialog(resourceId);

  }, false);

});

undefined;
