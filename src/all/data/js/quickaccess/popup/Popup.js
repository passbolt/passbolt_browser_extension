import React from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill/dist/browser-polyfill";
import Simplebar from "simplebar/dist/simplebar";
import Port from "../../lib/port";
import Request from "../../lib/request";
import Message from "../../lib/message";
import SecretComplexity from "../../lib/secretComplexity";
import AppContext from "./contexts/AppContext";
import FilterResourcesByFavoritePage from "./components/FilterResourcesByFavoritePage/FilterResourcesByFavoritePage";
import FilterResourcesByItemsIOwnPage from "./components/FilterResourcesByItemsIOwnPage/FilterResourcesByItemsIOwnPage";
import FilterResourcesByGroupPage from "./components/FilterResourcesByGroupPage/FilterResourcesByGroupPage";
import FilterResourcesByRecentlyModifiedPage
  from "./components/FilterResourcesByRecentlyModifiedPage/FilterResourcesByRecentlyModifiedPage";
import FilterResourcesBySharedWithMePage
  from "./components/FilterResourcesBySharedWithMePage/FilterResourcesBySharedWithMePage";
import FilterResourcesByTagPage from "./components/FilterResourcesByTagPage/FilterResourcesByTagPage";
import Header from "./components/Header/Header";
import HomePage from "./components/HomePage/HomePage";
import LoginPage from "./components/LoginPage/LoginPage";
import MoreFiltersPage from "./components/MoreFiltersPage/MoreFiltersPage";
import ResourceCreatePage from "./components/ResourceCreatePage/ResourceCreatePage";
import ResourceViewPage from "./components/ResourceViewPage/ResourceViewPage";
import Search from "./components/Search/Search";
import {BrowserRouter as Router, Route} from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import AnimatedSwitch from "./components/AnimatedSwitch/AnimatedSwitch";
import PassphraseDialog from "./components/PassphraseDialog/PassphraseDialog";
import {Trans, withTranslation} from "react-i18next";
import TranslationProvider from "./components/Internationalisation/TranslationProvider";

const SEARCH_VISIBLE_ROUTES = [
  '/data/quickaccess.html',
  '/data/quickaccess/resources/favorite',
  '/data/quickaccess/resources/group',
  '/data/quickaccess/resources/owned-by-me',
  '/data/quickaccess/resources/recently-modified',
  '/data/quickaccess/resources/shared-with-me',
  '/data/quickaccess/resources/tag'
];

const PASSBOLT_GETTING_STARTED_URL = "https://www.passbolt.com/start";

class QuickAccess extends React.Component {
  constructor(props) {
    super(props);
    this.initEventHandlers();
    this.initState();
    this.searchRef = React.createRef();
  }

  /**
   * Can the user use the remember until I logout option
   * @return {boolean}
   */
  get canRememberMe() {
    const options = this.state.siteSettings && this.state.siteSettings.passbolt.plugins.rememberMe.options;
    const hasRememberMe = options && typeof options[-1] !== "undefined";
    return hasRememberMe;
  }

  initEventHandlers() {
    this.focusSearch = this.focusSearch.bind(this);
    this.updateSearch = this.updateSearch.bind(this);
    this.handlekeyDown = this.handleKeyDown.bind(this);
    this.handleBackgroundPageRequiresPassphraseEvent = this.handleBackgroundPageRequiresPassphraseEvent.bind(this);
    passbolt.message.on('passbolt.passphrase.request', this.handleBackgroundPageRequiresPassphraseEvent);
    this.handlePassphraseDialogCompleted = this.handlePassphraseDialogCompleted.bind(this);
    this.loginSuccessCallback = this.loginSuccessCallback.bind(this);
    this.logoutSuccessCallback = this.logoutSuccessCallback.bind(this);
  }

  async componentDidMount() {
    await this.checkPluginIsConfigured();
    await this.getUser();
    this.checkAuthStatus();
    this.getSiteSettings();
  }

  initState() {
    this.state = {
      isAuthenticated: null,
      user: null,
      siteSettings: null,
      // Search
      search: "",
      searchHistory: {},
      updateSearch: this.updateSearch,
      focusSearch: this.focusSearch,
      // Passphrase
      passphraseRequired: false,
      passphraseRequestId: ''
    };
  }

  updateSearch(search) {
    this.setState({search});
  }

  focusSearch() {
    this.searchRef.current.focus();
  }

  async checkPluginIsConfigured() {
    const isConfigured = await passbolt.request('passbolt.addon.is-configured');
    if (!isConfigured) {
      browser.tabs.create({url: PASSBOLT_GETTING_STARTED_URL});
      window.close();
    }
  }

  async getUser() {
    const storageData = await browser.storage.local.get(["_passbolt_data"]);
    this.setState({user: storageData._passbolt_data.config});
  }

  async getSiteSettings() {
    const siteSettings = await passbolt.request('passbolt.site.settings');
    this.setState({siteSettings});
  }

  async checkAuthStatus() {
    const {isAuthenticated, isMfaRequired} = await passbolt.request("passbolt.auth.check-status");
    if (isMfaRequired) {
      this.redirectToMfaAuthentication();
      return;
    }
    this.setState({isAuthenticated});
  }

  redirectToMfaAuthentication() {
    browser.tabs.create({url: this.state.user["user.settings.trustedDomain"]});
    window.close();
  }

  loginSuccessCallback() {
    this.setState({isAuthenticated: true});
  }

  logoutSuccessCallback() {
    this.setState({isAuthenticated: false});
  }

  handleKeyDown(event) {
    // Close the quickaccess popup when the user presses the "ESC" key.
    if (event.keyCode === 27) {
      window.close();
    }
  }

  handleBackgroundPageRequiresPassphraseEvent(requestId) {
    this.setState({passphraseRequired: true, passphraseRequestId: requestId});
  }

  handlePassphraseDialogCompleted() {
    this.setState({passphraseRequired: false, passphraseRequestId: null});
  }

  isReady() {
    return this.state.isAuthenticated !== null
      && this.state.user !== null
      && window.self.port !== undefined && window.self.port._connected;
  }

  render() {
    const isReady = this.isReady();

    return (
      <TranslationProvider>
        <Router>
          <Route render={(props) => (
            <AppContext.Provider value={this.state}>
              <div className="container page quickaccess" onKeyDown={this.handleKeyDown}>
                <Header logoutSuccessCallback={this.logoutSuccessCallback}/>
                {!isReady &&
                <div className="processing-wrapper">
                  <p className="processing-text"><Trans>Connecting your account</Trans></p>
                </div>
                }
                {isReady &&
                <React.Fragment>
                  {this.state.passphraseRequired &&
                  <PassphraseDialog requestId={this.state.passphraseRequestId} onComplete={this.handlePassphraseDialogCompleted}/>
                  }
                  <div className={`${this.state.passphraseRequired ? "visually-hidden" : ""}`}>
                    <Route path={SEARCH_VISIBLE_ROUTES} render={() => (
                      <Search ref={this.searchRef}/>
                    )}/>
                    <AnimatedSwitch location={props.location}>
                      <Route path="/data/quickaccess/login" render={() => (
                        <LoginPage loginSuccessCallback={this.loginSuccessCallback} canRememberMe={this.canRememberMe}/>
                      )}/>
                      <PrivateRoute exact path="/data/quickaccess/resources/group" component={FilterResourcesByGroupPage}/>
                      <PrivateRoute path="/data/quickaccess/resources/group/:id" component={FilterResourcesByGroupPage}/>
                      <PrivateRoute exact path="/data/quickaccess/resources/tag" component={FilterResourcesByTagPage}/>
                      <PrivateRoute path="/data/quickaccess/resources/tag/:id" component={FilterResourcesByTagPage}/>
                      <PrivateRoute exact path="/data/quickaccess/resources/favorite" component={FilterResourcesByFavoritePage}/>
                      <PrivateRoute exact path="/data/quickaccess/resources/owned-by-me" component={FilterResourcesByItemsIOwnPage}/>
                      <PrivateRoute exact path="/data/quickaccess/resources/recently-modified" component={FilterResourcesByRecentlyModifiedPage}/>
                      <PrivateRoute exact path="/data/quickaccess/resources/shared-with-me" component={FilterResourcesBySharedWithMePage}/>
                      <PrivateRoute path="/data/quickaccess/resources/create" component={ResourceCreatePage}/>
                      <PrivateRoute path="/data/quickaccess/resources/view/:id" component={ResourceViewPage}/>
                      <PrivateRoute exact path="/data/quickaccess/more-filters" component={MoreFiltersPage}/>
                      <PrivateRoute exact path="/data/quickaccess.html" component={HomePage}/>
                    </AnimatedSwitch>
                  </div>
                </React.Fragment>
                }
              </div>
            </AppContext.Provider>
          )}/>
        </Router>
      </TranslationProvider>
    );
  }
}

const domContainer = document.querySelector('#quickaccess-container');
ReactDOM.render(React.createElement(withTranslation('common')(QuickAccess)), domContainer);
