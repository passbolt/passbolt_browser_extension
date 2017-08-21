/**
 * Autocomplete form in share a resource.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  // Autocomplete item template.
  var itemTpl = null,
  // Empty result template.
    emptyTpl = null,
  // The array of acos displayed.
    _aros = {};

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
   * Load the settings required by the share autocomplete.
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
    return passbolt.html.loadTemplate('body', 'resource/shareAutocomplete.ejs')
      .then(function () {
        return passbolt.html.getTemplate('resource/shareAutocompleteItem.ejs');
      }).then(function (data) {
        itemTpl = data;
        return passbolt.html.getTemplate('resource/shareAutocompleteItemEmpty.ejs');
      }).then(function (data) {
        emptyTpl = data;
      });
  };

  /**
   * Init the events listeners.
   * The events can come from the following sources : addon, page or DOM.
   */
  var initEventsListeners = function () {
    $(document).on('click', 'li', onSelectAro);
    passbolt.message.on('passbolt.share-autocomplete.loading', loadingHandler);
    passbolt.message.on('passbolt.share-autocomplete.load-users', loadUsersHandler);
    passbolt.message.on('passbolt.share-autocomplete.reset', resetHandler);
  };

  /**
   * Resize the iframe.
   * @param cssClasses {array} The css classes applied to the page.
   */
  var resize = function (cssClasses) {
    // If the resolution is too low, the iframe should not be scrollable.
    if (cssClasses.indexOf('fourfour') == -1) {
      // Resize the iframe container regarding the iframe content.
      passbolt.html.resizeIframe('#passbolt-iframe-password-share-autocomplete', {
        width: '100%'
      });
    }
    // In desktop.
    else {
      passbolt.html.resizeIframe('#passbolt-iframe-password-share-autocomplete', {
        width: '100%'
      });
    }
  };

  /**
   * Reset the component.
   */
  var reset = function () {
    _aros = {};
    $('ul').empty();
  };

  /**
   * Load a list of aros (users & groups).
   * @param aros {array} The list of aros (users & groups) to display
   */
  var load = function (aros) {
    for (var i in aros) {
      var aro = aros[i],
        data = {};

      // If the aro is a user.
      if (aro.User && aro.Profile) {
        data = {
          id: aro.User.id,
          thumbnail_url: settings['user.settings.trustedDomain'] + '/' +  aro.Profile.Avatar.url.small,
          label: aro.Profile.first_name + ' ' + aro.Profile.last_name +' (' + aro.Gpgkey.key_id + ')',
          secondaryLabel: aro.User.username,
          cssClass: 'user'
        };
        _aros[aro.User.id] = aro;
      }
      // If the aro is a group.
      else if (aro.Group) {
        data = {
          id: aro.Group.id,
          thumbnail_url: settings['user.settings.trustedDomain'] + '/img/avatar/group_default.png',
          label: aro.Group.name,
          secondaryLabel: aro.Group.user_count + ' Member' + (aro.Group.user_count>1?'s':''),
          cssClass: 'group'
        };
        _aros[aro.Group.id] = aro;
      }

      var html = itemTpl.call(this, data);
      $('ul').append(html);
    }

    // If no user found.
    if (!aros.length) {
      var html = emptyTpl.call(this);
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
        passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-password-share-autocomplete', 'hidden');
        passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
        passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-password-share-autocomplete', 'loading');
        $('.autocomplete-content').removeClass('loaded').addClass('loading');
        break;
      case 'loaded':
        $('body').removeClass('loading').addClass('loaded');
        passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-password-share-autocomplete', 'loading');
        passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
        $('.autocomplete-content').removeClass('loading').addClass('loaded');
        break;
      case 'hidden':
        $('body').removeClass('loading loaded').addClass('hidden');
        passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
        passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-password-share-autocomplete', 'loading');
        passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-password-share-autocomplete', 'hidden');
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
  var onSelectAro = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    // Notify the share worker regarding the selected aro.
    passbolt.message.emit('passbolt.share-autocomplete.aro-selected', _aros[this.id]);
    setState('hidden');
  };

  // Init the autocomplete results list component.
  init();

});
