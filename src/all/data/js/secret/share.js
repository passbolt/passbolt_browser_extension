/**
 * Share a secret.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  // The current search timeout reference.
  var currentSearchTimeout = null,
  // The password to edit, it is retrieved by sending a request to the addon-code.
    sharedPassword = null,
  // DOM Elements.
    $autocomplete = null;

  /**
   * Initialize the share password component.
   */
  var init = function () {
    // Load the page template.
    loadTemplate()
    // Get the shared password.
      .then(getSharedPassword)
      // Init the security token.
      .then(initSecurityToken)
      .then(function () {
        // Init the event listeners.
        initEventsListeners();
        // Mark the iframe container as ready.
        passbolt.message.emit('passbolt.passbolt-page.remove-class', '#passbolt-iframe-password-share', 'loading');
        passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-password-share', 'ready');
      }, function() {
        console.error('Something went wrong when initializing share.js');
      });
  };

  /**
   * Load the page template and initialize the variables relative to it.
   * @returns {Promise}
   */
  var loadTemplate = function () {
    return passbolt.html.loadTemplate('body', 'resource/share.ejs')
      .then(function () {
        $autocomplete = $('#js_perm_create_form_aro_auto_cplt');

        // Resize the iframe container regarding the iframe content.
        passbolt.html.resizeIframe('#passbolt-iframe-password-share', {
          width: '100%'
        });
      });
  };

  /**
   * Get the currently edited password.
   * It must have been stored before launching the password share dialog.
   * @returns {Promise}
   */
  var getSharedPassword = function () {
    return passbolt.request('passbolt.share.get-shared-password')
      .then(function (data) {
        sharedPassword = data;
      });
  };

  /**
   * Init the security token.
   * @returns {Promise}
   */
  var initSecurityToken = function () {
    return passbolt.security.initSecurityToken('#js_perm_create_form_aro_auto_cplt', '.security-token');
  };

  /**
   * Init the events listeners.
   * The events can come from the following sources : addon, page or DOM.
   */
  var initEventsListeners = function () {
    $autocomplete.bind('input', autocompleteFieldChanged);
    passbolt.message.on('passbolt.share.reset', resetHandler);
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
      passbolt.message.emit('passbolt.share.search-users', keywords);
    }, 300);
  };


  // Init the autocomplete search field component.
  init();

});
