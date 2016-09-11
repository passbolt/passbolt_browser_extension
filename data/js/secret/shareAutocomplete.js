/**
 * Autocomplete form in share a resource.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

(function () {

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
    // Load the page template.
    loadTemplate()
    // Init the event listeners.
      .then(initEventsListeners);
  };

  /**
   * Load the page template and initialize the variables relative to it.
   * @returns {*|Promise.<T>|*}
   */
  var loadTemplate = function () {
    return passbolt.helper.html.loadTemplate('body', './tpl/resource/shareAutocomplete.ejs')
      .then(function () {
        return passbolt.helper.html.getTemplate('./tpl/resource/shareAutocompleteItem.ejs');
      }).then(function (data) {
        itemTpl = data;
        return passbolt.helper.html.getTemplate('./tpl/resource/share-autocomplete-item_empty.ejs');
      }).then(function (data) {
        emptyTpl = data;
      });
  };

  /**
   * Init the events listeners.
   * The events can come from the following sources : addon, page or DOM.
   */
  var initEventsListeners = function () {
    $(document).on('click', 'li', onSelect);
    passbolt.message.on('passbolt.share-autocomplete.loading', loadingHandler);
    passbolt.message.on('passbolt.share-autocomplete.load-users', loadUsersHandler);
  };

  /**
   * Check if the component is in the given state
   * @param state The state to check
   */
  var stateIs = function (state) {
    // @todo The DOM as state store ...
    return $('.autocomplete-content').hasClass(state);
  };

  /**
   * Resize the iframe.
   */
  var resize = function (cssClasses) {
    // If the resolution is too low, the iframe should not be scrollable.
    if (cssClasses.indexOf('fourfour') == -1) {
      // Resize the iframe container regarding the iframe content.
      passbolt.helper.html.resizeIframe('#passbolt-iframe-password-share-autocomplete', {
        width: '100%'
      });
    }
    // In desktop.
    else {
      // If there are less than 3 users to display, the iframe should fit the content.
      if (currentUsers.length < 3) {
        // Resize the iframe container regarding the iframe content.
        passbolt.helper.html.resizeIframe('#passbolt-iframe-password-share-autocomplete', {
          width: '100%'
        });
      }
      else {
        // Resize the iframe container, reset the height and use the default css.
        passbolt.helper.html.resizeIframe('#passbolt-iframe-password-share-autocomplete', {
          width: '100%',
          height: ''
        });
      }
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
   * @param users
   */
  var load = function (users) {
    // Load the users in the list.
    for (var i in users) {
      currentUsers[users[i].User.id] = users[i];
      var html = new EJS({text: itemTpl}).render({user: users[i]});
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
   * @param state
   */
  var setState = function (state) {
    switch (state) {
      case 'loading':
        $('body').removeClass('hidden loaded').addClass('loading');
        passbolt.message.emitOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'hidden');
        passbolt.message.emitOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
        passbolt.message.emitOn('App', 'passbolt.html_helper.add_class', '#passbolt-iframe-password-share-autocomplete', 'loading');
        $('.autocomplete-content').removeClass('loaded').addClass('loading');
        break;
      case 'loaded':
        $('body').removeClass('loading').addClass('loaded');
        passbolt.message.emitOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loading');
        passbolt.message.emitOn('App', 'passbolt.html_helper.add_class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
        $('.autocomplete-content').removeClass('loading').addClass('loaded');
        break;
      case 'hidden':
        $('body').removeClass('loading loaded').addClass('hidden');
        passbolt.message.emitOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
        passbolt.message.emitOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loading');
        passbolt.message.emitOn('App', 'passbolt.html_helper.add_class', '#passbolt-iframe-password-share-autocomplete', 'hidden');
        $('.autocomplete-content').removeClass('loading loaded');
        break;
    }
  };

  /* ==================================================================================
   *  Addon events handlers
   * ================================================================================== */

  var loadingHandler = function () {
    reset();
    setState('loading');
  };

  var loadUsersHandler = function (users) {
    load(users);
    setState('loaded');
  };

  // The application window has been resized.
  passbolt.message.on('passbolt.html_helper.app_window_resized', function (cssClasses) {
    resize(cssClasses);
  });

  /* ==================================================================================
   *  DOM events handlers
   * ================================================================================== */

  // Listen when a user is selected in the list.
  var onSelect = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    // Notify the share worker regarding the selected user.
    //passbolt.message.emit('passbolt.share-autocomplete.user-selected', currentUsers[this.id]);
    passbolt.message.emit('passbolt.share-autocomplete.user-selected', currentUsers[this.id]);
    setState('hidden');
  };

  // Init the autocomplete results list component.
  init();

})();
