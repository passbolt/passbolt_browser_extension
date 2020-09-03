/**
 * React Application events
 *
 * Used to handle the events related to main react application iframe.
 * Capture events from the background page that have an impact on the react-app iframe
 * Also capture events from the Appjs supported by the react app
 *
 * @copyright (c) 2020 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
// Validation helper
validator = validator || {};
validator.isArrayOfUuid = function (items) {
  if (!items || !Array.isArray(items)) {
    return false;
  }
  try {
    items.forEach(item => {
      if (!validator.isUUID(item)) {
        throw new TypeError();
      }
    });
  } catch(error) {
    return false;
  }
  return true;
};

/* ==================================================================================
 * Resources related events from APPJS
 * ================================================================================== */

// Insert the resource create dialog.
window.addEventListener('passbolt.plugin.resources.open-create-dialog', async function (event) {
  if (event.detail.folderParentId && !validator.isUUID(event.detail.folderParentId)) {
    throw new TypeError('Invalid Appjs request. Request to create resource inside a folder should contain a valid folder ID.');
  }
  await showReactApp();
  passbolt.message.emit('passbolt.app.resources.open-create-dialog', event.detail.folderParentId);
});

// Insert the resource edit dialog.
window.addEventListener('passbolt.plugin.resources.open-edit-dialog', async function (event) {
  if (event.detail.id && !validator.isUUID(event.detail.id)) {
    throw new TypeError('Invalid Appjs request. Edit resource request should contain a valid folder ID.');
  }
  await showReactApp();
  passbolt.message.emit('passbolt.app.resources.open-edit-dialog', event.detail.id);
});

/* ==================================================================================
 * Folder related events from APPJS
 * ================================================================================== */

// Find all the folders
window.addEventListener('passbolt.storage.folders.get', async function (event) {
  const requestId = event.detail[0];
  const { folders } = await browser.storage.local.get(["folders"]);
  if (folders && Array.isArray(folders)) {
    passbolt.message.emitToPage(requestId, { status: "SUCCESS", body: folders });
  } else {
    passbolt.message.emitToPage(requestId, { status: "ERROR", error: { message: "The folders local storage is not initialized." } });
  }
});

// Update the folders local storage.
window.addEventListener('passbolt.plugin.folders.update-local-storage', async function (event) {
  const requestId = event.detail[0];
  try {
    await passbolt.request('passbolt.app.folders.update-local-storage');
    passbolt.message.emitToPage(requestId, { status: 'SUCCESS' });
  } catch (error) {
    passbolt.message.emitToPage(requestId, { status: 'ERROR', body: error });
  }
});

// Insert the folder create dialog.
window.addEventListener('passbolt.plugin.folders.open-create-dialog', async function (event) {
  if (event.detail.folderId && !validator.isUUID(event.detail.folderParentId)) {
    throw new TypeError('Invalid Appjs request. Folder create request should contain a valid folder ID.');
  }
  await showReactApp();
  passbolt.message.emit('passbolt.app.folders.open-create-dialog', event.detail.folderParentId);
});

// Insert the folder rename dialog.
window.addEventListener('passbolt.plugin.folders.open-rename-dialog', async function (event) {
  if (!event.detail || !event.detail.folderId || !validator.isUUID(event.detail.folderId)) {
    throw new TypeError('Invalid Appjs request. Folder rename request should contain a valid folder ID.');
  }
  await showReactApp();
  passbolt.message.emit('passbolt.app.folders.open-rename-dialog', event.detail.folderId);
});

// Insert the folder delete dialog.
window.addEventListener('passbolt.plugin.folders.open-delete-dialog', async function (event) {
  if (!event.detail || !event.detail.folderId || !validator.isUUID(event.detail.folderId)) {
    throw new TypeError('Invalid Appjs request. Folder delete request should contain a valid folder ID.');
  }
  await showReactApp();
  passbolt.message.emit('passbolt.app.folders.open-delete-dialog', event.detail.folderId);
});

// Move folders and/or resources
window.addEventListener('passbolt.plugin.folders.open-move-confirmation-dialog', async function (event) {
  let resources = [];
  let folders = [];
  const errorMsg = 'Invalid Appjs request. Folder move should contain a valid array of folders ID and/or a valid array of resources ID.';
  if (!event.detail) {
    throw new TypeError(errorMsg);
  }

  if (event.detail.folders) {
    if (!validator.isArrayOfUuid(event.detail.folders)) {
      throw new TypeError(errorMsg);
    }
    folders = event.detail.folders;
  }

  if (event.detail.resources) {
    if (!validator.isArrayOfUuid(event.detail.resources)) {
      throw new TypeError(errorMsg);
    }
    resources = event.detail.resources;
  }

  const folderParentId = event.detail.folderParentId;
  if (!validator.isUUID(folderParentId) && folderParentId !== null) {
    throw new TypeError('Invalid Appjs request. Folder move should contain a valid folder parent ID (null for root).');
  }

  const moveDto = {folders, resources, folderParentId};
  try {
    await passbolt.request('passbolt.app.folders.open-move-confirmation-dialog', moveDto);
  } catch (error) {
    console.error(error);
  }
});

/* ==================================================================================
 * Share related events from APPJS
 * ================================================================================== */
async function openShareDialog(items) {
  try {
    await showReactApp();
    await passbolt.request('passbolt.app.share.open-share-dialog', items);
  } catch (error) {
    // PASSBOLT-3356 Improve error feedback
    console.error(error);
  }
}

// Open resources multi / single share dialog
async function shareResources (event) {
  const errorMsg = 'Invalid Appjs request. Resource multi share request should contain valid resource UUIDs.';
  if (!event.detail || !event.detail.resourcesIds) {
    throw new TypeError(errorMsg);
  }
  let resourcesIds = Object.values(event.detail.resourcesIds);
  if (!validator.isArrayOfUuid(resourcesIds)) {
    throw new TypeError(errorMsg);
  }
  await openShareDialog({resourcesIds: resourcesIds})
}
window.addEventListener("passbolt.plugin.resources.open-share-dialog", shareResources, false);

// Open folders multi / single share dialog
window.addEventListener("passbolt.plugin.folders.open-share-dialog", async (event) => {
  const errorMsg = 'Invalid Appjs request. Folders multi share request should contain valid folders UUIDs.';
  if (!event.detail || !event.detail.foldersIds) {
    throw new TypeError(errorMsg);
  }
  let foldersIds = Object.values(event.detail.foldersIds);
  if (!validator.isArrayOfUuid(foldersIds)) {
    throw new TypeError(errorMsg);
  }
  await openShareDialog({foldersIds: event.detail.foldersIds})
}, false);

//
// DEPRECATED
//
// @deprecated since v2.13 to be removed in 3.0
window.addEventListener("passbolt.plugin.resources_share", shareResources, false);

// @deprecated since v2.4.0 will be removed in v3.0
window.addEventListener("passbolt.plugin.resource_share", async function (event) {
  const data = event.detail;
  const resourceId = Object.values(data.resourceId);
  if (!event.detail || !validator.isUUID(resourceId)) {
    throw new TypeError('Invalid Appjs request. Resource share request should contain a valid resource UUID.');
  }
  await openShareDialog({resourcesIds: [resourceId]});
}, false);

/* ==================================================================================
 * General events from background page
 * ================================================================================== */

// Show the react app.
passbolt.message.on('passbolt.app.show', function () {
  showReactApp();
});

// Hide the react app.
passbolt.message.on('passbolt.app.hide', function () {
  hideReactApp();
});

// Display a notification on the appjs.
passbolt.message.on('passbolt.notification.display', function (notification) {
  passbolt.message.emitToPage('passbolt_notify', notification);
});

// Select and scroll to a resource.
passbolt.message.on('passbolt.resources.select-and-scroll-to', function (resourceId) {
  if (!resourceId || !validator.isUUID(resourceId)) {
    throw new TypeError('Invalid Appjs request. Select and scroll request should contain a valid resource UUID.');
  }
  passbolt.message.emitToPage('passbolt.plugin.resources.select-and-scroll-to', resourceId);
});

// Select and scroll to a folder.
passbolt.message.on('passbolt.folders.select-and-scroll-to', function (folderId) {
  if (!folderId || !validator.isUUID(folderId)) {
    throw new TypeError('Invalid Appjs request. Select and scroll request should contain a valid folder UUID.');
  }
  passbolt.message.emitToPage('passbolt.plugin.folders.select-and-scroll-to', folderId);
});

/* ==================================================================================
 * Iframe management & startup
 * ================================================================================== */

// Insert the react application iframe.
const insertReactAppIframe = function() {
  const iframeId = 'passbolt-iframe-react-app';
  const className = '';
  const appendTo = 'body';
  const style = "display: none; position: absolute; width: 100%; height:100%; z-index: 999;";
  return passbolt.html.insertThemedIframe(iframeId, appendTo, className, null, null, style);
};

// Show the react app.
const showReactApp = async function() {
  $('iframe#passbolt-iframe-react-app').css('display', 'block');
  passbolt.message.emitToPage('passbolt.passbolt-page.remove-all-focuses');
};

// Hide the react app.
const hideReactApp = function() {
  $('iframe#passbolt-iframe-react-app').css('display', 'none');
};

// Check if background page is ready
const isAppWorkerReady = async function() {
  let resolver;
  const promise = new Promise(resolve => {resolver = resolve});

  const checkInterval = setInterval(function() {
    passbolt.request('passbolt.app.is-ready').then(() => {
      resolver();
      clearInterval(checkInterval);
    });
  }, 100);

  return promise;
};

// Check if react iframe app is ready via the background page app worker
const isReactAppReady = function() {
  let resolver;
  const promise = new Promise(resolve => {resolver = resolve});

  const checkInterval = setInterval(function() {
    passbolt.request('passbolt.app.react-app.is-ready').then(() => {
      resolver();
      clearInterval(checkInterval);
    }, (error) => {
      //console.warn('Passbolt app is not ready, retrying...');
    });
  }, 100);

  return promise;
};

// Content script initialization
const init = async function() {
  await isAppWorkerReady();
  await passbolt.request('passbolt.app.after-appjs-ready');
  insertReactAppIframe();
  await isReactAppReady();
  $('html').addClass('passboltplugin-ready');
};
init();

// Return undefined
// Because the result of an injected script must be a structured-clonable data
// To prevent warnings
undefined;
