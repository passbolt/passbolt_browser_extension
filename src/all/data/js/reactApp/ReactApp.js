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
import PasswordCreateDialog from "./components/PasswordCreateDialog/PasswordCreateDialog";
import FolderCreateDialog from "./components/FolderCreateDialog/FolderCreateDialog";
import ProgressDialog from "./components/ProgressDialog/ProgressDialog";
import PassphraseEntryDialog from "./components/PassphraseEntryDialog/PassphraseEntryDialog";
import AppContext from './contexts/AppContext';

class ReactApp extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.initEventHandlers();
  }

  async componentDidMount() {
    this.rememberMeInfo();
    this.getUserSettings();
  }

  getDefaultState() {
    return {
      user: {},
      rememberMeOptions: {},
      showPassphraseEntryDialog: false,
      passphraseRequestId: '',
      showResourceCreateDialog: false,
      showFolderCreateDialog: false,
      showProgressDialog: false,
      progressDialogProps: {
        goals: 2,
        message: "test"
      }
    };
  }

  async initEventHandlers() {
    this.handlePassphraseEntryRequestEvent = this.handlePassphraseEntryRequestEvent.bind(this);
    port.on('passbolt.passphrase.request', this.handlePassphraseEntryRequestEvent);
    this.handlePassphraseDialogClose = this.handlePassphraseDialogClose.bind(this);

    this.handleProgressStartEvent = this.handleProgressStartEvent.bind(this);
    port.on('passbolt.progress.start', this.handleProgressStartEvent);
    this.handleProgressCompleteEvent = this.handleProgressCompleteEvent.bind(this);
    port.on('passbolt.progress.complete', this.handleProgressCompleteEvent);

    this.handleResourceCreateDialogOpenEvent = this.handleResourceCreateDialogOpenEvent.bind(this);
    port.on('passbolt.resources.open-create-dialog', this.handleResourceCreateDialogOpenEvent);
    this.handleResourceCreateDialogCloseEvent = this.handleResourceCreateDialogCloseEvent.bind(this);

    this.handleFolderCreateDialogOpenEvent = this.handleFolderCreateDialogOpenEvent.bind(this);
    port.on('passbolt.folders.open-create-dialog', this.handleFolderCreateDialogOpenEvent);
    this.handleFolderCreateDialogCloseEvent = this.handleFolderCreateDialogCloseEvent.bind(this);
  }

  async getUserSettings() {
    const storageData = await browser.storage.local.get(["_passbolt_data"]);
    this.setState({user: storageData._passbolt_data.config});
  }

  async rememberMeInfo() {
    const rememberMeOptions = await port.request('passbolt.site.settings.plugins.rememberMe');
    this.setState({rememberMeOptions: rememberMeOptions});
  }

  isReady() {
    return this.state.user !== null;
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

  render() {
    const isReady = this.isReady();
    return (
      <Router>
        <Route render={() => (
          <Route exact path="/data/app.html">
            <AppContext.Provider value={this.state}>
              {isReady &&
              <div id="app" className="app" tabIndex="1000">
                {this.state.showResourceCreateDialog &&
                <PasswordCreateDialog onClose={this.handleResourceCreateDialogCloseEvent}/>
                }
                {this.state.showFolderCreateDialog &&
                <FolderCreateDialog onClose={this.handleFolderCreateDialogCloseEvent}/>
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
