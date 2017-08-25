/**
 * Share a secret.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

    // The current search timeout reference.
    var currentSearchTimeout = null,
        // DOM Elements.
        $autocomplete = null,
        autocompleteFieldSelector = '#js_group_edit_form_auto_cplt';

    /**
     * Initialize the share password component.
     */
    var init = function () {
        // Load the page template.
        loadTemplate()
        // Get the shared password.
            //.then(getSharedPassword)
            // Init the security token.
            .then(initSecurityToken)
            // Init the event listeners.
            .then(initEventsListeners)
            // Mark the iframe container as ready.
            .then(function () {
                passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-group-edit', 'loading');
                passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-group-edit', 'ready');
            });
    };

    /**
     * Load the page template and initialize the variables relative to it.
     * @returns {Promise}
     */
    var loadTemplate = function () {
        return passbolt.html.loadTemplate('body', 'group/edit.ejs')
            .then(function () {
                $autocomplete = $(autocompleteFieldSelector);

                // Resize the iframe container regarding the iframe content.
                passbolt.html.resizeIframe('#passbolt-iframe-group-edit', {
                    width: '100%'
                });
            });
    };

    /**
     * Init the security token.
     * @returns {Promise}
     */
    var initSecurityToken = function () {
        return passbolt.security.initSecurityToken(autocompleteFieldSelector, '.security-token');
    };

    /**
     * Init the events listeners.
     * The events can come from the following sources : addon, page or DOM.
     */
    var initEventsListeners = function () {
        $autocomplete.bind('input', autocompleteFieldChanged);
        passbolt.message.on('passbolt.group.edit.reset', resetHandler);
    };

    /* ==================================================================================
     *  Addon events handlers
     * ================================================================================== */

    /**
     * Reset the autocomplete search field.
     */
    var resetHandler = function () {
        $autocomplete.val('');
    };

    /* ==================================================================================
     *  DOM events handlers
     * ================================================================================== */

    /**
     * When the autocomplete search field change.
     */
    var autocompleteFieldChanged = function () {
        var keywords = $(this).val();
        // If a search has been already scheduled, delete it.
        if (currentSearchTimeout != null) {
            clearTimeout(currentSearchTimeout);
        }
        // Postpone the search to avoid a request on each very closed input.
        currentSearchTimeout = setTimeout(function () {
            // Search user.
            passbolt.message.emit('passbolt.group.edit.search-users', keywords);
        }, 300);
    };

    // Init the autocomplete search field component.
    init();

});
