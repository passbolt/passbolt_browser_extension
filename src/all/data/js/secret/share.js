/**
 * Share a secret.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  // The user settings.
  let settings = {};

  // The resources to share.
  let resources = [];

  // The share changes.
  let shareChanges = [];

  // Is the current user owner of the resources
  let isOwner = false;

  // The current search for aros timeout reference.
  let currentSearchTimeout = null;

  // DOM Elements (jQuery objects).
  let $permissions,
    $goToEdit,
    $goToShare,
    $searchInput,
    $autocompleteWrapper,
    $autocompleteContent,
    $feedbacks,
    $save,
    $cancel,
    $close;

  // The latest search aros result.
  let searchArosResult = [];

  /**
   * Initialize the dialog.
   */
  const init = async function () {
    await loadSettings();
    await getResources();
    shareChanges = new ShareChanges(resources);
    isOwner = shareChanges.isOriginalResourcesOwner();
    await loadTemplate();
    await loadPermissions();
    await initSecurityToken();
    initEventsListeners();
    passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-password-share', 'ready');
  };

  /**
   * Submit changes.
   * @return {Promise}
   */
  const submitChanges = async function() {
    return passbolt.request('passbolt.share.submit', shareChanges._changes)
      .then(null, (error) => {
        console.log('error', error);
      });
  };

  /**
   * Close the share dialog.
   */
  const close = async function() {
    return passbolt.message.emit('passbolt.share.close');
  };

  /**
   * Load the application settings
   * @return {Promise}
   */
  const loadSettings = async function() {
    settings = await passbolt.request('passbolt.config.readAll', ['user.settings.trustedDomain']);
  };

  /**
   * Get the resources to share.
   * @return {Promise}
   */
  const getResources = async function() {
    const resourcesIds = await passbolt.request('passbolt.share.get-resources-ids');
    // console.log('resourcesIds', resourcesIds);
    resources = await passbolt.request('passbolt.share.get-resources', resourcesIds);
    // console.log('resources', resources);
  };

  /**
   * Load the page template and initialize the variables relative to it.
   * @return {Promise}
   */
  const loadTemplate = async function () {
    const bulk = resources.length > 1;
    // console.log(resources, bulk);
    await passbolt.html.loadTemplate('body', 'resource/shareDialog.ejs', 'html', {resources, bulk, isOwner});
    $goToEdit = $('.share-password-dialog #js-share-go-to-edit');
    $goToShare = $('.share-password-dialog #js-share-go-to-share');
    $permissions = $('.share-password-dialog #js-share-edit-list ul');
    $searchInput = $('.share-password-dialog #js-search-aros-input');
    $autocompleteWrapper = $('.share-password-dialog #js-search-aro-autocomplete');
    $autocompleteContent = $('.share-password-dialog .autocomplete-content');
    $feedbacks = $('.share-password-dialog #js-share-feedbacks');
    $save = $('.share-password-dialog #js-share-save');
    $cancel = $('.share-password-dialog #js-share-cancel');
    $close = $('.share-password-dialog .js-dialog-close');
    if (!isOwner) {
      showOnlyOwnerCanShareFeedback();
    }
  };

  /**
   * Load the confirm leave dialog
   * @return {Promise}
   */
  const loadConfirmLeaveTemplate = async function() {
    let $confirmDialog, $confirmDialogWrapper;
    await passbolt.html.loadTemplate('body', 'dialog/confirmLeaveDialog.ejs', 'append');
    $confirmDialog = $('.dialog.confirm');
    $confirmDialogWrapper = $confirmDialog.parent();
    $('.js-dialog-close, .js-dialog-cancel', $confirmDialog).on('click', () => $confirmDialogWrapper.remove());
    $('.js-dialog-confirm', $confirmDialog).on('click', () => passbolt.message.emit('passbolt.share.go-to-edit'));
  };

  /**
   * Load the list of permissions
   */
  const loadPermissions = async function() {
    const arosPermissions = shareChanges.aggregatePermissionsByAro();
    for (var aroId in arosPermissions) {
      await insertAroPermissions(arosPermissions[aroId]);
    }
  };

  /**
   * Insert an aro permissions in the list
   * @param {object} aroPermissions The permission to insert
   * {
   *  id: {string}, // The aro id
   *  aro: {object},
   *  type: int,
   *  permissions: array<object>
   * }
   */
  const insertAroPermissions = async function(aroPermissions) {
    const domain = settings['user.settings.trustedDomain'];
    await passbolt.html.loadTemplate($permissions, 'resource/shareAroPermissionsItem.ejs', 'append', {domain, aroPermissions, isOwner});
  };

  /**
   * Init the security token.
   * @return {Promise}
   */
  const initSecurityToken = function () {
    return passbolt.security.initSecurityToken('#js-search-aros-input', '.security-token');
  };

  /**
   * Init the events listeners.
   * The events can come from the following sources : addon, page or DOM.
   */
  const initEventsListeners = function () {
    $goToEdit.on('click', event => handleGoToEdit());
    $goToShare.on('click', event => handleGoToShare());
    $permissions.on('change', 'select', event => handleAroPermissionChange(event));
    $permissions.on('click', '.js-share-delete-button', event => handleDeleteAroPermission(event));
    $searchInput.bind('input', () => handleSearchArosChange());
    $autocompleteContent.on('click', 'li', event => handleAddAroPermissions(event));
    $save.on('click', () => submitChanges());
    $cancel.on('click', () => close());
    $close.on('click', () => close());
    $permissions.on('mouseover', '.tooltip-alt', event => handleAroPermissionsTooltipPosition(event));
  };

  /**
   * Go to edit dialog.
   */
  const handleGoToEdit = function() {
    if (!shareChanges._changes.length) {
      return passbolt.message.emit('passbolt.share.go-to-edit');
    } else {
      loadConfirmLeaveTemplate();
    }
  };

  /**
   * Go to share dialog (refresh).
   */
  const handleGoToShare = function() {
    return passbolt.message.emit('passbolt.share.go-to-share');
  };

  /**
   * Handle aro permission change
   * @param {DomEvent} event
   */
  const handleAroPermissionChange = function (event) {
    const aroId = $(event.currentTarget).parents('li').attr('id');
    const type = parseInt($(event.currentTarget).val());
    shareChanges.updateAroPermissions(aroId, type);
    markAroPermissionsAsChange(aroId);
    validateChanges();
  };

  /**
   * Handle aro permission delete
   * @param {DomEvent} event
   */
  const handleDeleteAroPermission = function (event) {
    const aroId = $(event.currentTarget).parents('li').attr('id');
    shareChanges.deleteAroPermissions(aroId);
    validateChanges();
    $(`#${aroId}`, $permissions).remove();
  };

  /**
   * Handle search aros change.
   */
  const handleSearchArosChange = function () {
    const keywords = $searchInput.val();

    // Cancel any previous search timeout.
    if (currentSearchTimeout != null) {
      clearTimeout(currentSearchTimeout);
    }

    // Empty search reset the autocomplete component.
    if (keywords.trim() == '') {
      resetSearchAros();
      return;
    }

    // Throttle the search, so the user has time to enter the complete sentence he wants to search.
    currentSearchTimeout = setTimeout(() => {
      $autocompleteContent.empty().addClass('loading');
      $autocompleteWrapper.removeClass('hidden');
      passbolt.request('passbolt.share.search-aros', keywords)
        .then(aros => updateAutocompleteContent(aros));
    }, 300);
  };

  /**
   * Handle add aro permissions.
   * @param {DomEvent} event
   */
  const handleAddAroPermissions = function(event) {
    const aroId = $(event.currentTarget).attr('id');
    const aro = searchArosResult.find(aro => aro.id == aroId);
    resetSearchAros();
    const aroPermissions = shareChanges.addAroPermissions(aro);
    insertAroPermissions(aroPermissions)
      .then(() => markAroPermissionsAsChange(aroId))
      .then(() => scrollToLatestAroPermissions())
      .then(() => validateChanges());
  };

  /**
   * Handle the aro permissions tooltip.
   * As the tooltip is associated to an element in a overflow div, the tooltip text has to be moved to be aligned.
   * @param {DomEvent} event
   */
  const handleAroPermissionsTooltipPosition = function(event) {
    const $tooltip = $(event.currentTarget);
    const position = $tooltip[0].getBoundingClientRect();
    $('.tooltip-text', $tooltip).css('top', `${position.top}px`);
  };

  /**
   * Scroll to the latest aro permissions
   */
  const scrollToLatestAroPermissions = function() {
    $permissions.animate({scrollTop: $permissions[0].scrollHeight}, 500);
  };

  /**
   * Mark/Unmark an aro permissions row as updated.
   * @param {string} aroId The aro permissions row id.
   */
  const markAroPermissionsAsChange = function(aroId) {
    if (shareChanges.hasChanges(aroId)) {
      $(`#${aroId}`).addClass('permission-updated');
    } else {
      $(`#${aroId}`).removeClass('permission-updated');
    }
  };

  /**
   * Reset the search aros.
   */
  const resetSearchAros = function () {
    $searchInput.val('');
    $autocompleteWrapper.addClass('hidden').removeClass('ready');
    $autocompleteContent.empty();
  };

  /**
   * Update the autocomplete component with the aros returned by the service.
   * @param {array} aros
   * @return {Promise}
   */
  const updateAutocompleteContent = function (aros) {
    const excludedArosId = Object.keys(shareChanges._aros);
    searchArosResult = aros.filter(aro => excludedArosId.indexOf(aro.id) == -1);
    const data = {
      domain: settings['user.settings.trustedDomain'],
      aros: searchArosResult
    };
    $autocompleteContent.empty().removeClass('loading');
    $autocompleteWrapper.removeClass('hidden').addClass('ready');
    return passbolt.html.loadTemplate($autocompleteContent, 'resource/shareAutocomplete.ejs', 'append', data);
  };

  /**
   * Validate the permissions changes.
   */
  const validateChanges = function() {
    const resourcesWithNoOwner = shareChanges.getResourcesWithNoOwner();
    if (resourcesWithNoOwner.length) {
      showMissingOwnerFeedback();
      disableSaveAction();
      return;
    }
    if (!shareChanges._changes.length) {
      hideFeedback();
      disableSaveAction();
      return;
    }
    showApplyFeedback();
    enableSaveAction();
  };

  /**
   * Enable the save action
   */
  const enableSaveAction = function() {
    $save
      .removeClass('disabled')
      .prop('disabled', null);
  };

  /**
   * Disable the save action
   */
  const disableSaveAction = function() {
    $save
      .addClass('disabled')
      .prop('disabled', 'disabled');
  };

  /**
   * Display the missing owner feedback
   */
  const showMissingOwnerFeedback = function() {
    const plural = resources.length > 1;
    let text = `The password${plural?'s':''} must have a owner.`;
    $feedbacks.text(text);
    $feedbacks.addClass('error').removeClass('warning hidden');
  };

  /**
   * Display the only owner can share feedback
   */
  const showOnlyOwnerCanShareFeedback = function() {
    let text = 'Only the owner of a password can share it.';
    $feedbacks.text(text);
    $feedbacks.addClass('warning').removeClass('hidden');
  };

  /**
   * Display the apply feedback
   */
  const showApplyFeedback = function() {
    const text = 'You need to save to apply the changes.';
    $feedbacks.text(text);
    $feedbacks.addClass('warning').removeClass('error hidden');
  };

  /**
   * Hide any feedback
   */
  const hideFeedback = function() {
    $feedbacks.addClass('hidden');
  };

  init();
});
