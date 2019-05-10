/**
 * Group Listeners
 *
 * Used for handling groups / group edits
 *
 * @copyright (c) 2017-2018 Passbolt SARL, 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Worker = require('../model/worker');
var User = require('../model/user').User;
var Group = require('../model/group').Group;
var GroupForm = require('../model/groupForm').GroupForm;
var InvalidMasterPasswordError = require('../error/invalidMasterPasswordError').InvalidMasterPasswordError;
var Keyring = require('../model/keyring').Keyring;
var Crypto = require('../model/crypto').Crypto;
var masterPasswordController = require('../controller/masterPasswordController');
var progressDialogController = require('../controller/progressDialogController');
var UserAbortsOperationError = require('../error/userAbortsOperationError').UserAbortsOperationError;

var listen = function (worker) {
  /*
   * Initialize the group edit process.
   *
   * If groupId is provided, will load the group info from the server and inform App, which will in turn inform the client.
   *
   * @listens passbolt.app.group-edit-init
   * @param groupId {uuid} The group id, null if creation
   */
  worker.port.on('passbolt.group.edit.init', function (requestId, data) {
    var groupId = data.groupId,
      groupForm = new GroupForm(worker.tab.id);

    if (groupId != '') {
      var group = new Group();
      group.findById(groupId)
        .then(
          function success(group) {
            groupForm.init('edit', group);
            var appWorker = Worker.get('App', worker.tab.id);
            appWorker.port.emit('passbolt.group.edit.group_loaded', group);
          },
          function error(errorResponse) {
            // TO DO.
          }
        );
    }
    else {
      groupForm.init('create');
    }

    worker.port.emit(requestId, 'SUCCESS');
  });

  /*
   * Search users that could be added to a group.
   * Once the search has been completed, send the users to the autocomplete
   * worker.
   *
   * @listens passbolt.group.search-users
   * @param keywords {string} The keywords to search
   */
  worker.port.on('passbolt.group.edit.search-users', function (keywords) {
    var //sharedPassword = TabStorage.get(worker.tab.id, 'sharedPassword'),
      user = User.getInstance(),
      autocompleteWorker = Worker.get('GroupEditAutocomplete', worker.tab.id),
    // The users that have already been added to the share list should be
    // excluded from the search.
      groupForm = new GroupForm(worker.tab.id),
      excludedUsers = [];

    // If no keywords provided, hide the autocomplete component.
    if (!keywords) {
      autocompleteWorker.port.emit('passbolt.group.edit-autocomplete.reset');
    }
    // Otherwise, search the users who match the keywords,
    // and display them in the autocomplete component.
    else {
      autocompleteWorker.port.emit('passbolt.group.edit-autocomplete.loading');

      // Get existing users.
      var groupUsers = groupForm.get('currentGroup.GroupUser');
      excludedUsers = _.pluck(groupUsers, 'user_id');

      // Search available users.
      user.searchUsers(keywords, excludedUsers)
        .then(function (users) {
          autocompleteWorker.port.emit('passbolt.group.edit-autocomplete.load-users', users);
        }, function (e) {
          console.error(e);
        });
    }
  });

  /*
   * Saves / update a group.
   * Receives the instruction from the app that the group is ready to be saved.
   * The plugin already knows the list of groupUsers, which is stored in
   * the local storage by the groupForm model.
   *
   * @listens passbolt.group.edit.save
   * @param group {object} a group object, with name only.
   */
  worker.port.on('passbolt.group.edit.save', async function (requestId, groupToSave) {
    const groupForm = new GroupForm(worker.tab.id);
    groupForm.set('currentGroup.Group.name', groupToSave.name);
    const groupJson = groupForm.getPostJson();
    const groupId = groupForm.get().currentGroup.Group.id;
    let groupSaved;

    try {
      if (groupForm.isCreating()) {
        groupSaved = await createGroup(worker, groupJson)
      } else if (!groupForm.hasNewUsers()) {
        groupSaved = await updateGroup(worker, groupId, groupJson);
      } else {
        groupSaved = await updateGroupWithNewUsers(worker, groupId, groupJson);
      }
      worker.port.emit(requestId, 'SUCCESS', groupSaved);
    } catch (error) {
      if (error instanceof InvalidMasterPasswordError || error instanceof UserAbortsOperationError) {
        // The save operation has been aborted.
      } else if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    } finally {
      progressDialogController.close(worker);
    }
  });

  /**
   * Create a group.
   * @param worker {object} The worker associated with the progress dialog.
   * @param groupJson {object} The form data
   * @return {object} The API result
   */
  const createGroup = async function(worker, groupJson) {
    const group = new Group();

    await progressDialogController.open(worker, 'Creating group ...', 2);
    progressDialogController.update(worker, 1);
    const groupSaved = await group.save(groupJson);
    progressDialogController.update(worker, 2);
    progressDialogController.close(worker);

    return groupSaved;
  };

  /**
   * Update a group.
   * @param worker {object} The worker associated with the progress dialog.
   * @param groupId {string} The group id
   * @param groupJson {object} The form data
   * @return {object} The API result
   */
  const updateGroup = async function(worker, groupId, groupJson) {
    const group = new Group();

    const groupSavedPromised = group.save(groupJson, groupId);
    await progressDialogController.open(worker, 'Updating group ...', 2);
    progressDialogController.update(worker, 1);
    const groupSaved = await groupSavedPromised;
    progressDialogController.update(worker, 2);
    progressDialogController.close(worker);

    return groupSaved;
  };

  /**
   * Update a group with new users.
   * @param worker {object} The worker associated with the progress dialog.
   * @param groupId {string} The group id
   * @param groupJson {object } The form data
   * @return {object} The API result
   */
  const updateGroupWithNewUsers = async function(worker, groupId, groupJson) {
    const keyring = new Keyring();
    let progressGoals = 100;
    let progress = 0;
    const group = new Group();

    const dryRunPromise = group.save(groupJson, groupId, true);
    const keyringSyncPromise = keyring.sync();
    const masterPassword = await masterPasswordController.get(worker);
    await progressDialogController.open(worker, 'Updating group ...', progressGoals);
    const dryRunResult = await dryRunPromise;
    await keyringSyncPromise;

    progress += 2; // Keyring sync + dryrun
    progressGoals = dryRunResult['dry-run']['SecretsNeeded'].length + dryRunResult['dry-run']['Secrets'].length + progress;
    progressDialogController.updateGoals(worker, progressGoals);
    progressDialogController.update(worker, progress++);

    groupJson['Secrets'] = await encryptSaveGroupSecrets(
      dryRunResult,
      masterPassword,
      () => progressDialogController.update(worker, progress++),
      message => { return index => progressDialogController.update(worker, progress, message.replace('%0', parseInt(index) + 1)) }
    );
    const groupSaved = await group.save(groupJson, groupId);
    progressDialogController.close(worker);

    return groupSaved;
  };

  /**
   * Encrypt the secrets needed by a save group operation
   * @param dryRunResult {object} the group response returned from a dry-run call.
   * @param masterPassword {string} the private key master password
   */
  const encryptSaveGroupSecrets = async function (dryRunResult, masterPassword, completeCallback, startCallback) {
    if (dryRunResult['dry-run'] == undefined || dryRunResult['dry-run'] == 0 || dryRunResult['dry-run']['SecretsNeeded'] == 0) {
      return;
    }

    const crypto = new Crypto();
    const secretsNeeded = dryRunResult['dry-run']['SecretsNeeded'];
    const secretsOrigin = dryRunResult['dry-run']['Secrets'];

    // Decrypt all the secrets.
    const messagesOriginEncrypted = secretsOrigin.reduce((result, item) => [...result, item.Secret[0].data], []);
    const messagesOriginDecrypted = await crypto.decryptAll(messagesOriginEncrypted, masterPassword, completeCallback, startCallback(`Decrypting %0/${secretsOrigin.length}`));
    secretsOrigin.forEach((secret, i) => secret['Secret'][0].dataDecrypted = messagesOriginDecrypted[i]);

    // Encrypt all the secrets for the new users.
    const encryptAllData = secretsNeeded.map(secretNeeded => {
      const secretOrigin = secretsOrigin.find(secretOrigin => secretNeeded.Secret.resource_id == secretOrigin.Secret[0].resource_id);
      return {userId: secretNeeded['Secret'].user_id, message: secretOrigin.Secret[0].dataDecrypted}
    });
    const messagesNeeededEncrypted = await crypto.encryptAll(encryptAllData, completeCallback, startCallback('Encrypting %0/' + secretsNeeded.length));
    messagesNeeededEncrypted.forEach((messageEncrypted, i) => secretsNeeded[i].Secret.data = messageEncrypted);

    return secretsNeeded;
  };

  /*
   * A groupUser has been temporary deleted.
   * Remove it from the list of group users, it added
   * previously.
   *
   * @listens passbolt.group.edit.remove-group_user
   * @param groupUser {string} The groupUser that has been removed.
   */
  worker.port.on('passbolt.group.edit.remove-group_user', function (requestId, groupUser) {
    var groupForm = new GroupForm(worker.tab.id);
    groupForm.deleteGroupUser(groupUser).then(
      function (groupUser) {
        worker.port.emit(requestId, 'SUCCESS', groupUser);
      },
      function (error) {
        worker.port.emit(requestId, 'ERROR', error);
      }
    );
  });

  /*
   * A groupUser has been temporary deleted.
   * Remove it from the list of group users, it added
   * previously.
   *
   * @listens passbolt.group.edit.remove-group_user
   * @param groupUser {string} The groupUser that has been removed.
   */
  worker.port.on('passbolt.group.edit.edit-group_user', function (requestId, groupUser) {
    var groupForm = new GroupForm(worker.tab.id),
      appWorker = Worker.get('App', worker.tab.id);

    groupForm.updateGroupUser(groupUser).then(
      function (groupUser) {
        worker.port.emit(requestId, 'SUCCESS', groupUser);
      },
      function (error) {
        worker.port.emit(requestId, 'ERROR', error);
      }
    );
  });

  /*
   * A groupUser has been modified in the groupUsers list.
   *
   * @listens passbolt.group.edit.get_group_users_change_list
   */
  worker.port.on('passbolt.group.edit.get_group_users_change_list', function (requestId) {
    var groupForm = new GroupForm(worker.tab.id),
      changeList = groupForm.getGroupUsersChangeList();
    worker.port.emit(requestId, 'SUCCESS', changeList);
  });

  /*
   * Find all the groups
   *
   * @listens passbolt.groups.find-all
   * @param requestId {uuid} The request identifier
   * @param options {object} The options to apply to the find
   */
  worker.port.on('passbolt.groups.find-all', async function (requestId, options) {
    try {
      const groups = await Group.findAll(options);
      worker.port.emit(requestId, 'SUCCESS', groups);
    } catch (error) {
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });
};
exports.listen = listen;
