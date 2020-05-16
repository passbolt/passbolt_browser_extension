/**
 * Group edit iframe control.
 *
 * It has for aim to control the group edit iframe.
 *  - Add the iframe to the application page. The editGroupDialogPagemod
 *    will detect it and will control its DOM.
 *
 * @copyright (c) 2018 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  /**
   * Insert the edit group iframe into the edit group dialog provided
   * by the application page.
   */
  var _insertIframes = function () {
    // The component managing the autocomplete field.
    var iframeId = 'passbolt-iframe-group-edit';
    var prependTo = '.js_plugin_group_edit_wrapper';
    var urlOptions = {};
    var className = 'loading';
    var insertMode = 'prepend';
    passbolt.html.insertThemedIframe(iframeId, prependTo, className, urlOptions, insertMode);

    // The component managing the autocomplete result list.
    iframeId = 'passbolt-iframe-group-edit-autocomplete';
    var appendTo = $('#passbolt-group-edit-autocomplete-wrapper', '.js_plugin_group_edit_wrapper');
    var style = 'margin-top:-12px'; // compensate for iframe padding (not present in styleguide)
    className = 'hidden';
    insertMode = 'append';
    passbolt.html.insertThemedIframe(iframeId, appendTo, className, urlOptions, insertMode, style);
  };

  /*
   * Open the user field control component when a group is edited.
   * passbolt.plugin.group_edit
   */
  window.addEventListener("passbolt.plugin.group_edit", function (event) {
    var data = event.detail,
      groupId = data.groupId,
      canAddGroupUsers = data.canAddGroupUsers;

    // Initialize the process.
    passbolt.request('passbolt.group.edit.init', {groupId: groupId})
      .then(function () {
        if (canAddGroupUsers === true) {
          _insertIframes();
        }
      });
  }, false);

});
// result must be structured-clonable data
undefined;
