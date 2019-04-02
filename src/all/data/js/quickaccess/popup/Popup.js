import React from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill/dist/browser-polyfill";
import AppContext from "./contexts/AppContext";
import Header from "./components/Header/Header";
import HomePage from "./components/HomePage/HomePage";
import LoginPage from "./components/LoginPage/LoginPage";
import ResourceViewPage from "./components/ResourceViewPage/ResourceViewPage";
import Search from "./components/Search/Search";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import AnimatedSwitch from "./components/AnimatedSwitch/AnimatedSwitch";
import PassphraseDialog from "./components/PassphraseDialog/PassphraseDialog";

const SEARCH_VISIBLE_ROUTES = [
  '/data/quickaccess.html'
];

const PASSBOLT_GETTING_STARTED_URL = "https://www.passbolt.com/start";

class QuickAccess extends React.Component {
  constructor(props) {
    super(props);
    this.initEventHandlers();
    this.initState();

  }

  initEventHandlers() {
    this.handlekeyDown = this.handleKeyDown.bind(this);
    this.handleSearchChangeCallback = this.handleSearchChangeCallback.bind(this);
    this.handleBackgroundPageRequiresPassphraseEvent = this.handleBackgroundPageRequiresPassphraseEvent.bind(this);
    passbolt.message.on('passbolt.passphrase.request', this.handleBackgroundPageRequiresPassphraseEvent);
    this.handlePassphraseDialogCompleted = this.handlePassphraseDialogCompleted.bind(this);
    this.loginSuccessCallback = this.loginSuccessCallback.bind(this);
    this.logoutSuccessCallback = this.logoutSuccessCallback.bind(this);
  }

  async componentDidMount() {
    await this.checkPluginIsConfigured();
    await this.initAppContext();
    await this.checkUserIsLoggedIn();
  }

  initState() {
    this.state = {
      isLoggedIn: null,
      user: null,
      search: '',
      passphraseRequired: false,
      passphraseRequestId: ''
    };
  }

  async checkPluginIsConfigured() {
    const isConfigured = await passbolt.request('passbolt.addon.isConfigured');
    if (!isConfigured) {
      browser.tabs.create({ url: PASSBOLT_GETTING_STARTED_URL });
      window.close();
    }
  }

  async initAppContext() {
    const storageData = await browser.storage.local.get(["_passbolt_data"]);
    this.setState({ user: storageData._passbolt_data.config });
  }

  async checkUserIsLoggedIn() {
    try {
      await passbolt.request("passbolt.auth.is-logged-in");
      this.setState({ isLoggedIn: true });
    } catch (error) {
      if (error.name === "MfaAuthenticationRequiredError") {
        this.redirectToMfaAuthentication();
      } else {
        this.setState({ isLoggedIn: false });
      }
    }
  }

  redirectToMfaAuthentication() {
    browser.tabs.create({ url: this.state.user["user.settings.trustedDomain"] });
    window.close();
  }

  loginSuccessCallback() {
    this.setState({ isLoggedIn: true });
  }

  logoutSuccessCallback() {
    this.setState({ isLoggedIn: false });
  }

  handleKeyDown(event) {
    // Close the quickaccess popup when the user presses the "ESC" key.
    if (event.keyCode === 27) {
      window.close();
    }
  }

  handleBackgroundPageRequiresPassphraseEvent(requestId) {
    this.setState({ passphraseRequired: true, passphraseRequestId: requestId });
  }

  handlePassphraseDialogCompleted() {
    this.setState({ passphraseRequired: false, passphraseRequestId: null });
  }

  handleSearchChangeCallback(search) {
    this.setState({ search });
  }

  isReady() {
    return this.state.isLoggedIn !== null
      && this.state.user !== null
      && window.self.port !== undefined && window.self.port._connected;
  }

  render() {
    return (
      <Router>
        <Route render={(props) => (
          <AppContext.Provider value={this.state}>
            <div className="container page quickaccess" onKeyDown={this.handleKeyDown}>
              <Header logoutSuccessCallback={this.logoutSuccessCallback} />
              {!this.isReady() &&
                <div className="processing-wrapper">
                  <p className="processing-text">Connecting your account</p>
                </div>
              }
              {this.isReady() &&
                <React.Fragment>
                  {this.state.passphraseRequired &&
                    <PassphraseDialog requestId={this.state.passphraseRequestId} onComplete={this.handlePassphraseDialogCompleted} />
                  }
                  <div className={`${this.state.passphraseRequired ? "visually-hidden" : ""}`}>
                    <Route exact path={SEARCH_VISIBLE_ROUTES} render={() => (
                      <Search search={this.state.search} searchChangeCallback={this.handleSearchChangeCallback} />
                    )} />
                    <AnimatedSwitch location={props.location}>
                      <Route path="/data/quickaccess/login" render={() => (
                        <LoginPage loginSuccessCallback={this.loginSuccessCallback} />
                      )} />
                      <PrivateRoute path="/data/quickaccess/resources/view/:id" component={ResourceViewPage} />
                      <PrivateRoute exact path="/data/quickaccess.html" component={HomePage} search={this.state.search} />
                    </AnimatedSwitch>
                  </div>
                </React.Fragment>
              }
            </div>
          </AppContext.Provider>
        )} />
      </Router>
    );
  }
}

QuickAccess.contextType = AppContext;

const domContainer = document.querySelector('#quickaccess-container');
ReactDOM.render(React.createElement(QuickAccess), domContainer);
