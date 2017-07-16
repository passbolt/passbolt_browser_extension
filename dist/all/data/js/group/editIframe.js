/**
 * Group edit iframe control.
 *
 * It has for aim to control the group edit iframe.
 *  - Add the iframe to the application page. The editGroupDialogPagemod
 *    will detect it and will control its DOM.
 *
 * @copyright (c) 2015-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

(function () {

    /**
     * Insert the edit group iframe into the edit group dialog provided
     * by the application page.
     */
    var _insertIframes = function () {
        // The component managing the autocomplete field.
				var iframeId = 'passbolt-iframe-group-edit';
        var iframeUrl = chrome.runtime.getURL('data/' + iframeId +'.html') + '?passbolt=' + iframeId;
        var $iframeShare = $('<iframe/>', {
            id: iframeId,
            src: iframeUrl,
            class: 'loading',
            frameBorder: 0,
            marginwidth: 0,
            marginheight: 0,
            hspace: 0,
            vspace: 0
        });
        $iframeShare.prependTo('.js_plugin_group_edit_wrapper');

        // The component managing the autocomplete result list.
        iframeId = 'passbolt-iframe-group-edit-autocomplete';
			 	iframeUrl = chrome.runtime.getURL('data/' + iframeId +'.html') + '?passbolt=' + iframeId;
        var $iframeAutocomplete = $('<iframe/>', {
            id: iframeId,
            src: iframeUrl,
            class: 'hidden',
            frameBorder: 0,
            marginwidth: 0,
            marginheight: 0,
            hspace: 0,
            vspace: 0
        });
        $iframeAutocomplete.appendTo($('#passbolt-group-edit-autocomplete-wrapper', '.js_plugin_group_edit_wrapper'));
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
        passbolt.request('passbolt.group.edit.init', {
            groupId: groupId
        }).then(function () {
            if (canAddGroupUsers == true) {
                _insertIframes();
            }
        });
    }, false);

})();
