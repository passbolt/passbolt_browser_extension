/**
 * Share a secret.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  // The user settings.
  let settings = {};

  // The share changes.
  let shareChanges = [];

  // The current search for aros timeout reference.
  let currentSearchTimeout = null;

  // DOM Elements (jQuery objects).
  let $permissions,
    $searchInput,
    $autocompleteWrapper,
    $autocompleteContent,
    $feedbacks,
    $save;

  // The latest search aros result.
  let searchArosResult = [];

  /**
   * Initialize the dialog.
   */
  const init = async function () {
    await loadSettings();
    const resourcesIds = await passbolt.request('passbolt.share.get-resources-ids');
    const resourcesPromise = passbolt.request('passbolt.share.get-resources', resourcesIds);
    await loadTemplate(resourcesIds);
    initSecurityToken();
    const resources = await resourcesPromise;
    updateTitle(resources);
    shareChanges = new ShareChanges(resources);
    const canEdit = shareChanges.isOriginalResourcesOwner();
    loadPermissions(canEdit);
    showForm(canEdit);
    passbolt.message.emit('passbolt.passbolt-page.add-class', '#passbolt-iframe-password-share', 'ready');
  };

  /**
   * Submit changes.
   * @return {Promise}
   */
  const submitChanges = async function() {
    return passbolt.request('passbolt.share.submit', shareChanges._changes)
      .then(null, (error) => {
        console.error('error', error);
        close();
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
   * Load the page template and initialize the variables relative to it.
   * @param {array} resourcesIds The list of resources ids to share.
   * @return {Promise}
   */
  const loadTemplate = async function (resourcesIds) {
    const resourcesCount = resourcesIds.length;
    await passbolt.html.loadTemplate('body', 'resource/shareDialog.ejs', 'html', {resourcesCount});
    $permissions = $('.share-password-dialog #js-share-edit-list ul');
    $feedbacks = $('.share-password-dialog #js-share-feedbacks');
    $save = $('.share-password-dialog #js-share-save');
    $('.share-password-dialog #js-share-go-to-edit').on('click', () => handleGoToEdit());
    $('.share-password-dialog #js-share-go-to-share').on('click', () => handleGoToShare());
    $('.share-password-dialog #js-share-cancel').on('click', () => close());
    $('.share-password-dialog .js-dialog-close').on('click', () => close());
    $save.on('click', () => submitChanges());
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
   * @param {boolean} canEdit Does the current user can edit the permissions
   */
  const loadPermissions = async function(canEdit) {
    $('.processing-wrapper').hide();
    const arosPermissions = shareChanges.aggregatePermissionsByAro();
    for (var aroId in arosPermissions) {
      await insertAroPermissions(arosPermissions[aroId], canEdit);
    }
    $permissions.on('change', 'select', event => handleAroPermissionChange(event));
    $permissions.on('click', '.js-share-delete-button', event => handleDeleteAroPermission(event));
    $permissions.on('mouseover', '.tooltip-alt', event => handleAroPermissionsTooltipPosition(event));
  };

  /**
   * Show form
   * @param {boolean} canEdit Does the current user can edit the permissions
   */
  const showForm = function(canEdit) {
    if (canEdit) {
      $('#js-share-form-content-add').show();
      $searchInput = $('.share-password-dialog #js-search-aros-input');
      $autocompleteWrapper = $('.share-password-dialog #js-search-aro-autocomplete');
      $autocompleteContent = $('.share-password-dialog .autocomplete-content');
      $searchInput.bind('input', () => handleSearchArosChange());
      $autocompleteContent.on('click', 'li', event => handleAddAroPermissions(event));
    } else {
      let text = 'Only the owner of a password can share it.';
      $feedbacks.text(text);
      $feedbacks.addClass('warning').removeClass('hidden');
    }
  };

  /**
   * Update title
   * @param {array} resources List of edited resources
   */
  const updateTitle = async function (resources) {
    if (resources.length > 1) {
      await passbolt.html.loadTemplate('.share-password-dialog h2', 'resource/shareBulkTitleTooltip.ejs', 'append', {resources});
    } else {
      $('.share-password-dialog h2 .dialog-header-subtitle').text(resources[0].name);
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
  const insertAroPermissions = async function(aroPermissions, canEdit) {
    const domain = settings['user.settings.trustedDomain'];
    await passbolt.html.loadTemplate($permissions, 'resource/shareAroPermissionsItem.ejs', 'append', {domain, aroPermissions, canEdit});
  };

  /**
   * Init the security token.
   * @return {Promise}
   */
  const initSecurityToken = function () {
    return passbolt.security.initSecurityToken('#js-search-aros-input', '.security-token');
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
    currentSearchTimeout = setTimeout(async () => {
      $autocompleteContent.empty().addClass('loading');
      $autocompleteWrapper.removeClass('hidden');
      const aros = await passbolt.request('passbolt.share.search-aros', keywords);
      updateAutocompleteContent(aros);
    }, 300);
  };

  /**
   * Handle add aro permissions.
   * @param {DomEvent} event
   */
  const handleAddAroPermissions = async function(event) {
    const aroId = $(event.currentTarget).attr('id');
    const aro = searchArosResult.find(aro => aro.id == aroId);
    resetSearchAros();
    const aroPermissions = shareChanges.addAroPermissions(aro);
    const canEdit = shareChanges.isOriginalResourcesOwner();
    await insertAroPermissions(aroPermissions, canEdit);
    markAroPermissionsAsChange(aroId);
    scrollToLatestAroPermissions();
    validateChanges();
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
    $save.removeClass('disabled')
      .prop('disabled', null);
  };

  /**
   * Disable the save action
   */
  const disableSaveAction = function() {
    $save.addClass('disabled')
      .prop('disabled', 'disabled');
  };

  /**
   * Display the missing owner feedback
   */
  const showMissingOwnerFeedback = function() {
    const plural = shareChanges._resources.length > 1;
    let text = `The password${plural?'s':''} must have a owner.`;
    $feedbacks.text(text);
    $feedbacks.addClass('error').removeClass('warning hidden');
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
