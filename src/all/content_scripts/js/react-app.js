
/* ==================================================================================
 * React Application events
 * ================================================================================== */
//
// RESOURCES
//
// Insert the resource create dialog.
window.addEventListener('passbolt.plugin.resources.open-create-dialog', async function (event) {
  await showReactApp();
  const folderParentId = event.detail.folderParentId;
  passbolt.message.emit('passbolt.app.resources.open-create-dialog', folderParentId);
});

// Insert the resource edit dialog.
window.addEventListener('passbolt.plugin.resources.open-edit-dialog', async function (event) {
  const id = event.detail.id;
  await showReactApp();
  passbolt.message.emit('passbolt.app.resources.open-edit-dialog', id);
});

//
// FOLDERS
//
// Insert the folder create dialog.
window.addEventListener('passbolt.plugin.folders.open-create-dialog', async function (event) {
  await showReactApp();
  const folderParentId = event.detail.folderParentId;
  passbolt.message.emit('passbolt.app.folders.open-create-dialog', folderParentId);
});

// Insert the folder rename dialog.
window.addEventListener('passbolt.plugin.folders.open-rename-dialog', async function (event) {
  if (!event.detail || !event.detail.folderId || !validator.isUUID(event.detail.folderId)) {
    throw new TypeError('Invalid Appjs request. Folder rename should contain a valid folder ID.');
  }
  await showReactApp();
  passbolt.message.emit('passbolt.app.folders.open-rename-dialog', event.detail.folderId);
});

// Insert the folder delete dialog.
window.addEventListener('passbolt.plugin.folders.open-delete-dialog', async function (event) {
  if (!event.detail || !event.detail.folderId || !validator.isUUID(event.detail.folderId)) {
    throw new TypeError('Invalid Appjs request. Folder delete should contain a valid folder ID.');
  }
  await showReactApp();
  passbolt.message.emit('passbolt.app.folders.open-delete-dialog', event.detail.folderId);
});

// Insert the folder move dialog.
window.addEventListener('passbolt.plugin.folders.open-move-dialog', async function (event) {
  if (!event.detail || !event.detail.folderId || !validator.isUUID(event.detail.folderId)) {
    throw new TypeError('Invalid Appjs request. Folder delete should contain a valid folder ID.');
  }
  await showReactApp();
  passbolt.message.emit('passbolt.app.folders.open-move-dialog', event.detail.folderId);
});

//
// SHARE
//
/*
 * Open the password(s) share component.
 */
window.addEventListener("passbolt.plugin.resources_share", async function (event) {
  const data = event.detail;
  const resourcesIds = Object.values(data.resourcesIds);
  try {
    await showReactApp();
    await passbolt.request('passbolt.app.share.open-share-dialog', resourcesIds);
  } catch (error) {
    // PASSBOLT-3356 Improve the plugin errors management.
  }
}, false);

/**
 * @deprecated since v2.4.0 will be removed in v3.0
 * replaced by the bulk share event "passbolt.plugin.resources_share"
 */
window.addEventListener("passbolt.plugin.resource_share", async function (event) {
  const data = event.detail;
  const resourceId = Object.values(data.resourceId);
  try {
    await showReactApp();
    await passbolt.request('passbolt.share.init', [resourceId]);
  } catch (error) {
    // PASSBOLT-3356 Improve the plugin errors management.
  }
}, false);

//
// COMMONS
//
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
passbolt.message.on('passbolt.resources.select-and-scroll-to', function (id) {
  passbolt.message.emitToPage('passbolt.plugin.resources.select-and-scroll-to', id);
});

// Select and scroll to a folder.
passbolt.message.on('passbolt.folders.select-and-scroll-to', function (id) {
  passbolt.message.emitToPage('passbolt.plugin.folders.select-and-scroll-to', id);
});

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
  // Move the focus into the iframe.
  passbolt.message.emitToPage('passbolt.passbolt-page.remove-all-focuses');

  // TODO Cedric to review
  // let checkCount = 0;
  // return new Promise(function(resolve) {
  //   let interval = setInterval(function () {
  //     checkCount++;
  //     if (checkCount > 200) {
  //       clearInterval(interval);
  //       resolve();
  //     }
  //     const appElement = $('iframe#react-app').contents().find('#app');
  //     appElement.focus();
  //     // If the focus has been set to the element, resolve the promise and
  //     // continue, otherwise try again.
  //     if (appElement.is(":focus")) {
  //       clearInterval(interval);
  //       console.log('resolve focus');
  //       resolve();
  //     }
  //   }, 10);
  // });
};

// Hide the react app.
const hideReactApp = function() {
  $('iframe#passbolt-iframe-react-app').css('display', 'none');
};

/* ==================================================================================
 * Handle the ready state.
 * ================================================================================== */

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

const isReactAppReady = function() {
  let resolver;
  const promise = new Promise(resolve => {resolver = resolve});

  const checkInterval = setInterval(function() {
    passbolt.request('passbolt.app.react-app.is-ready').then(() => {
      resolver();
      clearInterval(checkInterval);
    }, (error) => {
      console.warn('Passbolt app is not ready, retrying...');
    });
  }, 100);

  return promise;
};

const init = async function() {
  await isAppWorkerReady();
  insertReactAppIframe();
  await isReactAppReady();
  $('html').addClass('passboltplugin-ready');
};
init();

undefined; // result must be structured-clonable data
