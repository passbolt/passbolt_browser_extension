/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.12.0
 */

import React, {Component} from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route} from "react-router-dom";
/* eslint-disable no-unused-vars */
import browser from "webextension-polyfill/dist/browser-polyfill";
import Simplebar from "simplebar/dist/simplebar";
import Port from "../lib/port";
import SecretComplexity from "../lib/secretComplexity";
/* eslint-enable no-unused-vars */

import ErrorDialog from "./components/Common/ErrorDialog/ErrorDialog";
import PasswordCreateDialog from "./components/Password/PasswordCreateDialog/PasswordCreateDialog";
import PasswordEditDialog from "./components/Password/PasswordEditDialog/PasswordEditDialog";
import FolderCreateDialog from "./components/Folder/FolderCreateDialog/FolderCreateDialog";
import FolderRenameDialog from "./components/Folder/FolderRenameDialog/FolderRenameDialog";
import FolderDeleteDialog from "./components/Folder/FolderDeleteDialog/FolderDeleteDialog";
import ProgressDialog from "./components/ProgressDialog/ProgressDialog";
import PassphraseEntryDialog from "./components/Passphrase/PassphraseEntryDialog/PassphraseEntryDialog";

import AppContext from './contexts/AppContext';
import ShareDialog from "./components/Share/ShareDialog";

class ReactApp extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.bindCallbacks();
    this.initEventHandlers();
  }

  async componentDidMount() {
    this.getUserSettings();
    this.rememberMeInfo();
    this.getResources();
    this.getFolders();
  }

  getDefaultState() {
    return {
      user: null,
      resources: null,
      rememberMeOptions: {},

      // passphrase dialog
      showPassphraseEntryDialog: false,
      passphraseRequestId: '',

      // Resource create / edit dialogs
      showResourceCreateDialog: false,
      resourceCreateDialogProps: {
        folderParentId: null
      },
      showPasswordEditDialog: false,
      passwordEditDialogProps: {
        id: null
      },

      // folder dialogs
      folder: {},
      showFolderCreateDialog: false,
      folderCreateDialogProps: {
        folderParentId: null
      },
      showFolderRenameDialog: false,
      showFolderDeleteDialog: false,

      // share dialog
      showShareDialog: false,
      shareDialogProps: {
        resourcesIds: null
      },

      // progress dialog
      showProgressDialog: false,
      progressDialogProps: {
        goals: 2,
        message: "test"
      },

      // error dialog
      showErrorDialog: false,
      errorDialogProps: {
        title: null,
        message: null
      },

    };
  }

  bindCallbacks() {
    this.handleStorageChange = this.handleStorageChange.bind(this);
    this.handleIsReadyEvent = this.handleIsReadyEvent.bind(this);
    this.handleErrorDialogOpenEvent = this.handleErrorDialogOpenEvent.bind(this);
    this.handleErrorDialogCloseEvent = this.handleErrorDialogCloseEvent.bind(this);
    this.handlePassphraseEntryRequestEvent = this.handlePassphraseEntryRequestEvent.bind(this);
    this.handlePassphraseDialogClose = this.handlePassphraseDialogClose.bind(this);
    this.handleProgressStartEvent = this.handleProgressStartEvent.bind(this);
    this.handleProgressCompleteEvent = this.handleProgressCompleteEvent.bind(this);
    this.handleResourceCreateDialogOpenEvent = this.handleResourceCreateDialogOpenEvent.bind(this);
    this.handleResourceCreateDialogCloseEvent = this.handleResourceCreateDialogCloseEvent.bind(this);
    this.handleResourceEditDialogOpenEvent = this.handleResourceEditDialogOpenEvent.bind(this);
    this.handleResourceEditDialogCloseEvent = this.handleResourceEditDialogCloseEvent.bind(this);
    this.handleFolderCreateDialogOpenEvent = this.handleFolderCreateDialogOpenEvent.bind(this);
    this.handleFolderCreateDialogCloseEvent = this.handleFolderCreateDialogCloseEvent.bind(this);
    this.handleFolderRenameDialogOpenEvent = this.handleFolderRenameDialogOpenEvent.bind(this);
    this.handleFolderRenameDialogCloseEvent = this.handleFolderRenameDialogCloseEvent.bind(this);
    this.handleFolderDeleteDialogOpenEvent = this.handleFolderDeleteDialogOpenEvent.bind(this);
    this.handleFolderDeleteDialogCloseEvent = this.handleFolderDeleteDialogCloseEvent.bind(this);
    this.handleShareDialogOpenEvent = this.handleShareDialogOpenEvent.bind(this);
    this.handleShareDialogCloseEvent = this.handleShareDialogCloseEvent.bind(this);
  }

  initEventHandlers() {
    browser.storage.onChanged.addListener(this.handleStorageChange);
    port.on('passbolt.react-app.is-ready', this.handleIsReadyEvent);
    port.on('passbolt.errors.open-error-dialog', this.handleErrorDialogOpenEvent);
    port.on('passbolt.passphrase.request', this.handlePassphraseEntryRequestEvent);
    port.on('passbolt.progress.start', this.handleProgressStartEvent);
    port.on('passbolt.progress.complete', this.handleProgressCompleteEvent);
    port.on('passbolt.resources.open-create-dialog', this.handleResourceCreateDialogOpenEvent);
    port.on('passbolt.resources.open-edit-dialog', this.handleResourceEditDialogOpenEvent);
    port.on('passbolt.folders.open-create-dialog', this.handleFolderCreateDialogOpenEvent);
    port.on('passbolt.folders.open-rename-dialog', this.handleFolderRenameDialogOpenEvent);
    port.on('passbolt.folders.open-delete-dialog', this.handleFolderDeleteDialogOpenEvent);
    port.on('passbolt.share.open-share-dialog', this.handleShareDialogOpenEvent);
  }

  async getUserSettings() {
    const storageData = await browser.storage.local.get(["_passbolt_data"]);
    this.setState({user: storageData._passbolt_data.config});
  }

  handleStorageChange(changes) {
    if (changes.resources) {
      const resources = changes.resources.newValue;
      this.setState({resources: resources});
    }
    if (changes.folders) {
      const folders = changes.folders.newValue;
      this.setState({folders: folders});
    }
  }

  handleIsReadyEvent(requestId) {
    if (this.isReady()) {
      port.emit(requestId, "SUCCESS");
    } else {
      port.emit(requestId, "ERROR");
    }
  }

  async getResources() {
    const storageData = await browser.storage.local.get(["resources"]);
    if (storageData.resources && storageData.resources.length) {
      const resources = storageData.resources;
      this.setState({resources: resources});
    }
  }

  async getFolders() {
    const storageData = await browser.storage.local.get(["folders"]);
    if (storageData.folders && storageData.folders.length) {
      const folders = storageData.folders;
      this.setState({folders: folders});
    }
  }

  async rememberMeInfo() {
    const rememberMeOptions = await port.request('passbolt.site.settings.plugins.rememberMe');
    this.setState({rememberMeOptions: rememberMeOptions});
  }

  isReady() {
    return this.state.user !== null;
  }

  handleErrorDialogOpenEvent(title, message) {
    const errorDialogProps = {title: title, message: message};
    this.setState({showErrorDialog: true, errorDialogProps: errorDialogProps});
  }

  handleErrorDialogCloseEvent() {
    this.setState({showErrorDialog: false});
    port.emit('passbolt.app.hide');
  }

  handlePassphraseEntryRequestEvent(requestId) {
    this.setState({showPassphraseEntryDialog: true, passphraseRequestId: requestId});
  }

  handleProgressStartEvent(title, goals, message) {
    const progressDialogProps = {title: title, message: message, goals: goals};
    this.setState({showProgressDialog: true, progressDialogProps: progressDialogProps});
  }

  handleProgressCompleteEvent() {
    this.setState({showProgressDialog: false});
  }

  handlePassphraseDialogClose() {
    this.setState({showPassphraseEntryDialog: false, passphraseRequestId: null});
  }

  handleResourceCreateDialogCloseEvent() {
    this.setState({showResourceCreateDialog: false});
    port.emit('passbolt.app.hide');
  }

  handleResourceCreateDialogOpenEvent(folderParentId) {
    const resourceCreateDialogProps = {folderParentId};
    this.setState({showResourceCreateDialog: true, resourceCreateDialogProps});
  }

  handleFolderCreateDialogOpenEvent(folderParentId) {
    const folderCreateDialogProps = {folderParentId};
    this.setState({showFolderCreateDialog: true, folderCreateDialogProps});
  }

  handleFolderCreateDialogCloseEvent() {
    this.setState({showFolderCreateDialog: false});
    port.emit('passbolt.app.hide');
  }

  handleFolderRenameDialogOpenEvent(folderId) {
    const folder = {id: folderId};
    this.setState({showFolderRenameDialog: true, folder});
  }

  handleFolderRenameDialogCloseEvent() {
    this.setState({showFolderRenameDialog: false});
    this.setState({folder: {}});
    port.emit('passbolt.app.hide');
  }

  handleFolderDeleteDialogOpenEvent(folderId) {
    const folder = {id: folderId};
    this.setState({showFolderDeleteDialog: true, folder});
  }

  handleFolderDeleteDialogCloseEvent() {
    this.setState({showFolderDeleteDialog: false});
    port.emit('passbolt.app.hide');
  }

  handleResourceEditDialogCloseEvent() {
    this.setState({showPasswordEditDialog: false});
    port.emit('passbolt.app.hide');
  }

  handleResourceEditDialogOpenEvent(id) {
    this.setState({showPasswordEditDialog: true, passwordEditDialogProps: {id: id}});
  }

  handleShareDialogOpenEvent(resourcesIds, foldersIds) {
    this.setState({showShareDialog: true, shareDialogProps: {resourcesIds, foldersIds}});
  }

  handleShareDialogCloseEvent() {
    this.setState({showShareDialog: false, shareDialogProps: null});
    port.emit('passbolt.app.hide');
  }

  render() {
    const isReady = this.isReady();
    return (
      <Router>
        <Route render={() => (
          <Route exact path="/data/app.html">
            <AppContext.Provider value={this.state}>
              {isReady &&
              <div id="app" className={`app ${isReady ? "ready" : ""}`} tabIndex="1000">
                {this.state.showResourceCreateDialog &&
                <PasswordCreateDialog onClose={this.handleResourceCreateDialogCloseEvent}
                  folderParentId={this.state.resourceCreateDialogProps.folderParentId}/>
                }
                {this.state.showPasswordEditDialog &&
                <PasswordEditDialog onClose={this.handleResourceEditDialogCloseEvent}
                  id={this.state.passwordEditDialogProps.id}/>
                }
                {this.state.showFolderCreateDialog &&
                <FolderCreateDialog onClose={this.handleFolderCreateDialogCloseEvent}
                  folderParentId={this.state.folderCreateDialogProps.folderParentId}/>
                }
                {this.state.showFolderRenameDialog &&
                <FolderRenameDialog onClose={this.handleFolderRenameDialogCloseEvent} folderId={this.state.folder.id}/>
                }
                {this.state.showFolderDeleteDialog &&
                <FolderDeleteDialog onClose={this.handleFolderDeleteDialogCloseEvent} folderId={this.state.folder.id}/>
                }
                {this.state.showShareDialog &&
                <ShareDialog resourcesIds={this.state.shareDialogProps.resourcesIds}
                             foldersIds={this.state.shareDialogProps.foldersIds}
                             onClose={this.handleShareDialogCloseEvent} />
                }
                {
                  // Hello traveller, leave these dialogs at the end
                  // so that they are displayed on top of your new dialog
                }
                {this.state.showProgressDialog &&
                <ProgressDialog title={this.state.progressDialogProps.title}
                                goals={this.state.progressDialogProps.goals}
                                message={this.state.progressDialogProps.message}/>
                }

                {this.state.showPassphraseEntryDialog &&
                <PassphraseEntryDialog requestId={this.state.passphraseRequestId}
                                       onClose={this.handlePassphraseDialogClose}/>
                }
                {this.state.showErrorDialog &&
                <ErrorDialog title={this.state.errorDialogProps.title}
                             message={this.state.errorDialogProps.message}
                             onClose={this.handleErrorDialogCloseEvent}/>
                }
              </div>
              }
            </AppContext.Provider>
          </Route>
        )}/>
      </Router>
    );
  }
}

ReactApp.contextType = AppContext;

const domContainer = document.querySelector('#app-container');
ReactDOM.render(React.createElement(ReactApp), domContainer);
