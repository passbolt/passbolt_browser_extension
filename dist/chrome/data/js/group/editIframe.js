/**
 * Group edit iframe control.
 *
 * It has for aim to control the group edit iframe.
 *  - Add the iframe to the application page. The editGroupDialogPagemod
 *    will detect it and will control its DOM.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

(function () {

    /**
     * Insert the edit group iframe into the edit group dialog provided
     * by the application page.
     */
    var _insertIframes = function () {
        var iframeUrl;
        var iframeId;

        // The component managing the autocomplete field.
        iframeId = 'passbolt-iframe-group-edit';
        if(typeof chrome !== 'undefined') {
            iframeUrl = chrome.runtime.getURL('data/' + iframeId +'.html');
        } else {
            iframeUrl = 'about:blank';
        }
        iframeUrl += '?passbolt=' + iframeId;
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
        if(typeof chrome !== 'undefined') {
            iframeUrl = chrome.runtime.getURL('data/' + iframeId +'.html');
        } else {
            iframeUrl = 'about:blank';
        }
        iframeUrl += '?passbolt=' + iframeId;
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
     * Open the secret share control component when a password is shared.
     * passbolt.plugin.resource_share
     */
    window.addEventListener("passbolt.plugin.group_edit", function (event) {
        var data = event.detail;

        // Initialize the process.
        passbolt.request('passbolt.app.group-edit-init', {
            //groupId: data.groupId
        }).then(function () {
            _insertIframes();
        });
    }, false);

})();
