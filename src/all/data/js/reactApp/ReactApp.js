/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2019 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2019 Passbolt SA (https://www.passbolt.com)
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

import ErrorDialog from "./components/Error/ErrorDialog";
import PasswordCreateDialog from "./components/PasswordCreateDialog/PasswordCreateDialog";
import PasswordEditDialog from "./components/PasswordEditDialog/PasswordEditDialog";
import FolderCreateDialog from "./components/Folder/FolderCreateDialog/FolderCreateDialog";
import FolderRenameDialog from "./components/Folder/FolderRenameDialog/FolderRenameDialog";
import FolderMoveDialog from "./components/Folder/FolderMoveDialog/FolderMoveDialog";
import FolderDeleteDialog from "./components/Folder/FolderDeleteDialog/FolderDeleteDialog";
import ProgressDialog from "./components/ProgressDialog/ProgressDialog";
import PassphraseEntryDialog from "./components/PassphraseEntryDialog/PassphraseEntryDialog";

import AppContext from './contexts/AppContext';

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
  }

  getDefaultState() {
    return {
      user: null,
      resources: null,
      rememberMeOptions: {},

      showPassphraseEntryDialog: false,
      passphraseRequestId: '',

      showResourceCreateDialog: false,
      showPasswordEditDialog: false,
      passwordEditDialogProps: {
        id: null
      },

      folder: {},
      showFolderCreateDialog: false,
      showFolderRenameDialog: false,
      showFolderDeleteDialog: false,
      showFolderMoveFolderDialog: false,

      showProgressDialog: false,
      showErrorDialog: false,

      errorDialogProps: {
        title: null,
        message: null
      },
      progressDialogProps: {
        goals: 2,
        message: "test"
      }
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
    this.handleFolderMoveDialogOpenEvent = this.handleFolderMoveDialogOpenEvent.bind(this);
    this.handleFolderMoveDialogCloseEvent = this.handleFolderMoveDialogCloseEvent.bind(this);
  }

  initEventHandlers() {
    browser.storage.onChanged.addListener(this.handleStorageChange);
    port.on('passbolt.app.is-ready', this.handleErrorDialogOpenEvent);
    port.on('passbolt.errors.open-error-dialog', this.handleErrorDialogOpenEvent);
    port.on('passbolt.passphrase.request', this.handlePassphraseEntryRequestEvent);
    port.on('passbolt.progress.start', this.handleProgressStartEvent);
    port.on('passbolt.progress.complete', this.handleProgressCompleteEvent);
    port.on('passbolt.resources.open-create-dialog', this.handleResourceCreateDialogOpenEvent);
    port.on('passbolt.resources.open-edit-dialog', this.handleResourceEditDialogOpenEvent);
    port.on('passbolt.folders.open-create-dialog', this.handleFolderCreateDialogOpenEvent);
    port.on('passbolt.folders.open-rename-dialog', this.handleFolderRenameDialogOpenEvent);
    port.on('passbolt.folders.open-delete-dialog', this.handleFolderDeleteDialogOpenEvent);
    port.on('passbolt.folders.open-move-dialog', this.handleFolderMoveDialogOpenEvent);
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

  handleResourceCreateDialogOpenEvent() {
    this.setState({showResourceCreateDialog: true});
  }

  handleFolderCreateDialogOpenEvent() {
    this.setState({showFolderCreateDialog: true});
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

  handleFolderMoveDialogOpenEvent(folderId) {
    const folder = {id: folderId};
    this.setState({showFolderMoveDialog: true, folder});
  }

  handleFolderMoveDialogCloseEvent() {
    this.setState({showFolderMoveDialog: false});
    port.emit('passbolt.app.hide');
  }

  handleResourceEditDialogCloseEvent() {
    this.setState({showPasswordEditDialog: false});
    port.emit('passbolt.app.hide');
  }

  handleResourceEditDialogOpenEvent(id) {
    this.setState({showPasswordEditDialog: true, passwordEditDialogProps: {id: id}});
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
                {this.state.showErrorDialog &&
                <ErrorDialog title={this.state.errorDialogProps.title}
                             message={this.state.errorDialogProps.message}
                             onClose={this.handleErrorDialogCloseEvent}/>
                }
                {this.state.showResourceCreateDialog &&
                <PasswordCreateDialog onClose={this.handleResourceCreateDialogCloseEvent}/>
                }
                {this.state.showPasswordEditDialog &&
                <PasswordEditDialog onClose={this.handleResourceEditDialogCloseEvent}
                  id={this.state.passwordEditDialogProps.id}/>
                }
                {this.state.showFolderCreateDialog &&
                <FolderCreateDialog onClose={this.handleFolderCreateDialogCloseEvent}/>
                }
                {this.state.showFolderRenameDialog &&
                <FolderRenameDialog onClose={this.handleFolderRenameDialogCloseEvent} folderId={this.state.folder.id}/>
                }
                {this.state.showFolderMoveDialog &&
                <FolderMoveDialog onClose={this.handleFolderMoveDialogCloseEvent} folderId={this.state.folder.id}/>
                }
                {this.state.showFolderDeleteDialog &&
                <FolderDeleteDialog onClose={this.handleFolderDeleteDialogCloseEvent} folderId={this.state.folder.id}/>
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
