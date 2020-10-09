/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
const Worker = require('../model/worker');
const {User} = require('../model/user');
const {Group} = require('../model/group');
const {GroupForm} = require('../model/groupForm');
const {Keyring} = require('../model/keyring');
const {Crypto} = require('../model/crypto');
const {UserService} = require('../service/user');

const {GroupModel} = require('../model/group/groupModel');
const {GroupEntity} = require('../model/entity/group/groupEntity');
const {GroupDeleteTransferEntity} = require('../model/entity/group/transfer/groupDeleteTransfer');

const passphraseController = require('../controller/passphrase/passphraseController');
const progressController = require('../controller/progress/progressController');

const {InvalidMasterPasswordError} = require('../error/invalidMasterPasswordError');
const {UserAbortsOperationError} = require('../error/userAbortsOperationError');

var listen = function (worker) {

  /*
   * Find all the groups
   *
   * @listens passbolt.groups.find-all
   * @param requestId {uuid} The request identifier
   * @param options {object} The options to apply to the find
   */
  worker.port.on('passbolt.groups.find-all', async function (requestId, options) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const groupModel = new GroupModel(clientOptions);
      const {contains, filters, orders} = options;
      const groupsCollection = await groupModel.findAll(contains, filters, orders);
      worker.port.emit(requestId, 'SUCCESS', groupsCollection);
    } catch (error) {
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /* ==================================================================================
   *  CRUD
   * ================================================================================== */
  /*
   * Create a groups
   *
   * @listens passbolt.groups.create
   * @param requestId {uuid} The request identifier
   * @param groupDto {Object} The group object, example:
   *  {name: 'group name', groups_users: [{user_id: <UUID>, is_admin: <boolean>}]}
   */
  worker.port.on('passbolt.groups.create', async function (requestId, groupDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const groupModel = new GroupModel(clientOptions);
      const groupEntity = new GroupEntity(groupDto);
      const newGroup = await groupModel.create(groupEntity);
      worker.port.emit(requestId, 'SUCCESS', newGroup);
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * Delete a Group - dry run
   *
   * @param {string} requestId The request identifier uuid
   * @param {string} groupId The user uuid
   * @param {object} [transferDto] optional data ownership transfer
   * example: {owners: [{aco_foreign_key: <UUID>, id: <UUID>}]}
   */
  worker.port.on('passbolt.groups.delete-dry-run', async function (requestId, groupId, transferDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const groupModel = new GroupModel(clientOptions);
      const transferEntity = transferDto ? new GroupDeleteTransferEntity(transferDto) : null;
      await groupModel.deleteDryRun(groupId, transferEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * Delete a Group
   *
   * @param {string} requestId The request identifier uuid
   * @param {string} groupId The group uuid
   * @param {object} [transferDto] optional data ownership transfer
   * example: {owners: [{aco_foreign_key: <UUID>, id: <UUID>}]}
   */
  worker.port.on('passbolt.groups.delete', async function (requestId, groupId, transferDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const groupModel = new GroupModel(clientOptions);
      const transferEntity = transferDto ? new GroupDeleteTransferEntity(transferDto) : null;
      await groupModel.delete(groupId, transferEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  // =====================================================================
  // DEPRECATED - older group edition screens
  // =====================================================================
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

    if (groupId !== '') {
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
    const autocompleteWorker = Worker.get('GroupEditAutocomplete', worker.tab.id);

    // The users that have already been added to the share list should be
    // excluded from the search.
    const groupForm = new GroupForm(worker.tab.id);
    let excludedUsers = [];

    // If no keywords provided, hide the autocomplete component.
    if (!keywords) {
      autocompleteWorker.port.emit('passbolt.group.edit-autocomplete.reset');
    }
    // Otherwise, search the users who match the keywords,
    // and display them in the autocomplete component.
    else {
      autocompleteWorker.port.emit('passbolt.group.edit-autocomplete.loading');

      // Get existing users.
      const groupUsers = groupForm.get('currentGroup.GroupUser');
      excludedUsers = _.pluck(groupUsers, 'user_id');

      // Search available users.
      const currentUser = User.getInstance();
      UserService.searchUsers(currentUser, {keywords, excludedUsers})
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
      await progressController.close(worker);
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

    await progressController.open(worker, 'Creating group ...', 2);
    progressController.update(worker, 1);
    const groupSaved = await group.save(groupJson);
    progressController.update(worker, 2);
    await progressController.close(worker);

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
    await progressController.open(worker, 'Updating group ...', 2);
    progressController.update(worker, 1);
    const groupSaved = await groupSavedPromised;
    progressController.update(worker, 2);
    await progressController.close(worker);

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
    const crypto = new Crypto(keyring);
    let progressGoals = 100;
    let progress = 0;
    let privateKey;
    const group = new Group();
    const dryRunPromise = group.save(groupJson, groupId, true);
    const keyringSyncPromise = keyring.sync();

    // Passphrase required to decrypt a secret before sharing it.
    // Get the passphrase if needed and decrypt secret key
    try {
      const passphrase = await passphraseController.get(worker);
      privateKey = await crypto.getAndDecryptPrivateKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }

    await progressController.open(worker, 'Updating group ...', progressGoals);
    const dryRunResult = await dryRunPromise;
    await keyringSyncPromise;

    progress += 2; // Keyring sync + dryrun
    progressGoals = dryRunResult['dry-run']['SecretsNeeded'].length + dryRunResult['dry-run']['Secrets'].length + progress;
    progressController.updateGoals(worker, progressGoals);
    progressController.update(worker, progress++);

    groupJson['Secrets'] = await encryptSaveGroupSecrets(
      dryRunResult,
      privateKey,
      () => progressController.update(worker, progress++),
      message => { return index => progressController.update(worker, progress, message.replace('%0', parseInt(index) + 1)) }
    );
    const groupSaved = await group.save(groupJson, groupId);
    await progressController.close(worker);

    return groupSaved;
  };

  /**
   * Encrypt the secrets needed by a save group operation
   *
   * @param {object} dryRunResult the group response returned from a dry-run call.
   * @param {openpgp.key.Key} privateKey the decrypted private key
   * @param {function} completeCallback
   * @param {function} startCallback
   */
  const encryptSaveGroupSecrets = async function (dryRunResult, privateKey, completeCallback, startCallback) {
    if (dryRunResult['dry-run'] === undefined || dryRunResult['dry-run'] === 0 || dryRunResult['dry-run']['SecretsNeeded'] === 0) {
      return;
    }

    const crypto = new Crypto();
    const secretsNeeded = dryRunResult['dry-run']['SecretsNeeded'];
    const secretsOrigin = dryRunResult['dry-run']['Secrets'];

    // Decrypt all the secrets.
    const messagesOriginEncrypted = secretsOrigin.reduce((result, item) => [...result, item.Secret[0].data], []);
    const messagesOriginDecrypted = await crypto.decryptAll(messagesOriginEncrypted, privateKey, completeCallback, startCallback(`Decrypting %0/${secretsOrigin.length}`));
    secretsOrigin.forEach((secret, i) => secret['Secret'][0].dataDecrypted = messagesOriginDecrypted[i]);

    // Encrypt all the secrets for the new users.
    const encryptAllData = secretsNeeded.map(secretNeeded => {
      const secretOrigin = secretsOrigin.find(secretOrigin => secretNeeded.Secret.resource_id === secretOrigin.Secret[0].resource_id);
      return {userId: secretNeeded['Secret'].user_id, message: secretOrigin.Secret[0].dataDecrypted}
    });
    const messagesNeeededEncrypted = await crypto.encryptAll(encryptAllData, privateKey, completeCallback, startCallback('Encrypting %0/' + secretsNeeded.length));
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
    const groupForm = new GroupForm(worker.tab.id);
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
   * Pull the groups from the API and update the local storage.
   *
   * @listens passbolt.groups.update-local-storage
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.groups.update-local-storage', async function (requestId) {
    try {
      let groupModel = new GroupModel(await User.getInstance().getApiClientOptions());
      await groupModel.updateLocalStorage();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });
};
exports.listen = listen;
