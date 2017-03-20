/**
 * Autocomplete form in edit group.
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

(function ($) {
    // Autocomplete item template.
    var itemTpl = null,
        // Empty result template.
        emptyTpl = null,
        // The array of users retrieved from the back-end.
        currentUsers = {};

    /**
     * Initialize the autocomplete result component.
     */
    var init = function () {
        // Load required settings.
        loadSettings()
        // Load the page template.
            .then(loadTemplate)
            // Init the event listeners.
            .then(initEventsListeners);
    };

    /**
     * Load the settings required by the edit group autocomplete.
     * @return {promise}
     */
    var loadSettings = function () {
        return passbolt.request('passbolt.config.readAll', ['user.settings.trustedDomain'])
            .then(function (response) {
                settings = response;
            });
    };

    /**
     * Load the page template and initialize the variables relative to it.
     * @returns {promise}
     */
    var loadTemplate = function () {
        return passbolt.helper.html.loadTemplate('body', './tpl/group/editAutocomplete.ejs')
            .then(function () {
                return passbolt.helper.html.getTemplate('./tpl/group/editAutocompleteItem.ejs');
            }).then(function (data) {
                itemTpl = data;
                return passbolt.helper.html.getTemplate('./tpl/group/editAutocompleteItemEmpty.ejs');
            }).then(function (data) {
                emptyTpl = data;
            });
    };

    /**
     * Init the events listeners.
     * The events can come from the following sources : addon, page or DOM.
     */
    var initEventsListeners = function () {
        $(document).on('click', 'li:has(.user)', onSelectUser);
        passbolt.message.on('passbolt.group.edit-autocomplete.loading', loadingHandler);
        passbolt.message.on('passbolt.group.edit-autocomplete.load-users', loadUsersHandler);
        passbolt.message.on('passbolt.group.edit-autocomplete.reset', resetHandler);
    };

    /**
     * Resize the iframe.
     * @param cssClasses {array} The css classes applied to the page.
     */
    var resize = function (cssClasses) {
        // If the resolution is too low, the iframe should not be scrollable.
        if (cssClasses.indexOf('fourfour') == -1) {
            // Resize the iframe container regarding the iframe content.
            passbolt.helper.html.resizeIframe('#passbolt-iframe-group-edit-autocomplete', {
                width: '100%'
            });
        }
        // In desktop.
        else {
            passbolt.helper.html.resizeIframe('#passbolt-iframe-group-edit-autocomplete', {
                width: '100%'
            });
        }
    };

    /**
     * Reset the component.
     */
    var reset = function () {
        currentUsers = {};
        $('ul').empty();
    };

    /**
     * Load a list of users.
     * @param users {array} The list of users
     */
    var load = function (users) {
        // Load the users in the list.
        for (var i in users) {
            currentUsers[users[i].User.id] = users[i];
            var html = new EJS({text: itemTpl}).render({settings: settings, user: users[i]});
            $('ul').append(html);
        }
        // If no user found.
        if (!users.length) {
            var html = new EJS({text: emptyTpl}).render();
            $('ul').append(html);
        }
        // Resize the autocomplete iframe.
        resize(['five']);
    };

    /**
     * Change the state of the component.
     * Mark the iframe with the state to allow other external components to work with.
     * @param state {string} The state to switch to. Can be : loading, loaded, hidden
     */
    var setState = function (state) {
        switch (state) {
            case 'loading':
                $('body').removeClass('hidden loaded').addClass('loading');
                passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-group-edit-autocomplete', 'hidden');
                passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-group-edit-autocomplete', 'loaded');
                passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-group-edit-autocomplete', 'loading');
                $('.autocomplete-content').removeClass('loaded').addClass('loading');
                break;
            case 'loaded':
                $('body').removeClass('loading').addClass('loaded');
                passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-group-edit-autocomplete', 'loading');
                passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-group-edit-autocomplete', 'loaded');
                $('.autocomplete-content').removeClass('loading').addClass('loaded');
                break;
            case 'hidden':
                $('body').removeClass('loading loaded').addClass('hidden');
                passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-group-edit-autocomplete', 'loaded');
                passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-group-edit-autocomplete', 'loading');
                passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-group-edit-autocomplete', 'hidden');
                $('.autocomplete-content').removeClass('loading loaded');
                break;
        }
    };

    /* ==================================================================================
     *  Addon events handlers
     * ================================================================================== */

    /**
     * Handle the loading event.
     */
    var resetHandler = function () {
        reset();
        setState('hidden');
    };

    /**
     * Handle the loading event.
     */
    var loadingHandler = function () {
        reset();
        setState('loading');
    };

    /**
     * Handler the load users event.
     * @param users {array} The list of users to load
     */
    var loadUsersHandler = function (users) {
        load(users);
        setState('loaded');
    };

    /*
     * The application window has been resized.
     * @listens passbolt.master-password.close-dialog
     */
    passbolt.message.on('passbolt.app.window-resized', function (cssClasses) {
        resize(cssClasses);
    });

    /* ==================================================================================
     *  DOM events handlers
     * ================================================================================== */

    /**
     * A user is selected.
     * @param ev {HTMLEvent} The event which occurred
     */
    var onSelectUser = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        // Notify the share worker regarding the selected user.
        passbolt.message.emit('passbolt.group.edit-autocomplete.user-selected', currentUsers[this.id]);
        setState('hidden');
    };

    // Init the autocomplete results list component.
    init();

})(jQuery);
