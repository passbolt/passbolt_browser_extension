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
      showCreateDialog: false,
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

    this.handleProgressDialogOpenEvent = this.handleProgressDialogOpenEvent.bind(this);
    port.on('passbolt.progress.open', this.handleProgressDialogOpenEvent);
    this.handleProgressDialogCloseEvent = this.handleProgressDialogCloseEvent.bind(this);
    port.on('passbolt.progress.close', this.handleProgressDialogCloseEvent);

    this.handleResourceCreateDialogOpenEvent = this.handleResourceCreateDialogOpenEvent.bind(this);
    port.on('passbolt.resources.open-create-dialog', this.handleResourceCreateDialogOpenEvent);
    this.handleResourceCreateDialogCloseEvent = this.handleResourceCreateDialogCloseEvent.bind(this);
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

  handleProgressDialogOpenEvent(title, goals, message) {
    const progressDialogProps = {title: title, message: message, goals: goals};
    this.setState({showProgressDialog: true, progressDialogProps: progressDialogProps});
  }

  handleProgressDialogCloseEvent() {
    this.setState({showProgressDialog: false});
  }

  handlePassphraseDialogClose() {
    this.setState({showPassphraseEntryDialog: false, passphraseRequestId: null});
  }

  handleResourceCreateDialogCloseEvent() {
    this.setState({showCreateDialog: false});
    port.emit('passbolt.app.hide');
  }

  handleResourceCreateDialogOpenEvent() {
    this.setState({showCreateDialog: true});
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
                {this.state.showCreateDialog &&
                <PasswordCreateDialog onClose={this.handleResourceCreateDialogCloseEvent}/>
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
