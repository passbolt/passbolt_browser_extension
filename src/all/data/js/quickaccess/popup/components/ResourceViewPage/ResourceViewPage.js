import React from "react";
import { Link } from "react-router-dom";
import Transition from 'react-transition-group/Transition';
import browser from "webextension-polyfill/dist/browser-polyfill";
import AppContext from "../../contexts/AppContext";

class ResourceViewPage extends React.Component {
  constructor(props) {
    super(props);
    this.initEventHandlers();
    this.initState();
    this.loadResource();
  }

  initEventHandlers() {
    this.handleGoBackClick = this.handleGoBackClick.bind(this);
    this.handleCopyLoginClick = this.handleCopyLoginClick.bind(this);
    this.handleCopyPasswordClick = this.handleCopyPasswordClick.bind(this);
    this.handleGoToUrlClick = this.handleGoToUrlClick.bind(this);
    this.handleUseOnThisTabClick = this.handleUseOnThisTabClick.bind(this);
  }

  initState() {
    this.state = {
      resource: {},
      passphrase: "",
      usingOnThisTab: false,
      copySecretState: "default",
      copyLoginState: "default",
      useOnThisTabError: ""
    };
  }

  handleGoBackClick(ev) {
    ev.preventDefault();

    // Additional variables were passed via the history.push state option.
    if (this.props.location.state) {
      // A specific number of entries to go back to was given in parameter.
      // It happens when the user comes from the create resource page by instance.
      if (this.props.location.state.goBackEntriesCount) {
        this.props.history.go(this.props.location.state.goBackEntriesCount);
        return;
      }
    }

    this.props.history.goBack();
  }

  async loadResource() {
    const storageData = await browser.storage.local.get("resources");
    const resource = storageData.resources.find(item => item.id == this.props.match.params.id);
    this.setState({ resource });
  }

  resetError() {
    this.setState({ useOnThisTabError: "" });
  }

  async handleCopyLoginClick(event) {
    event.preventDefault();
    this.resetError();
    if (!this.state.resource.username) {
      return;
    }

    try {
      this.setState({ copyLoginState: 'processing' });
      await navigator.clipboard.writeText(this.state.resource.username);
      this.setState({ copyLoginState: 'done' });
      setTimeout(() => {
        this.setState({ copyLoginState: 'default' });
      }, 15000)
    } catch (error) {
      console.error('An unexpected error occured', error);
    }
  }

  async handleCopyPasswordClick(event) {
    event.preventDefault();
    this.resetError();
    try {
      this.setState({ copySecretState: 'processing' });
      const message = await passbolt.request('passbolt.secret-edit.decrypt', this.state.resource.id);
      await navigator.clipboard.writeText(message);
      this.setState({ copySecretState: 'done' });
      setTimeout(() => {
        this.setState({ copySecretState: 'default' });
      }, 15000);
    } catch (error) {
      if (error.name == "UserAbortsOperationError") {
        this.setState({ copySecretState: 'default' });
      } else {
        console.error('An unexpected error occured', error);
      }
    }
  }

  handleGoToUrlClick(event) {
    this.resetError();
    if (!this.sanitizeResourceUrl()) {
      event.preventDefault();
    }
  }

  async handleUseOnThisTabClick(event) {
    event.preventDefault();
    this.setState({ usingOnThisTab: true });
    try {
      await passbolt.request('passbolt.quickaccess.use-resource-on-current-tab', this.state.resource.id, this.state.resource.username);
      window.close();
    } catch (error) {
      if (error.name == "UserAbortsOperationError") {
        this.setState({ usingOnThisTab: false });
      } else {
        console.error('An error occured', error);
        this.setState({
          usingOnThisTab: false,
          useOnThisTabError: "Unable to use the password on this page. Copy and paste the information instead."
        });
      }
    }
  }

  sanitizeResourceUrl() {
    const resource = this.state.resource;
    let uri = resource.uri;

    // Wrong format.
    if (uri == undefined || typeof uri != "string" || !uri.length) {
      return false;
    }

    // Absolute url are not valid url.
    if (uri[0] == "/") {
      return false;
    }

    // If no protocol defined, use http.
    if (!/^((?!:\/\/).)*:\/\//.test(uri)) {
      uri = `http://${uri}`;
    }

    try {
      let url = new URL(uri);
      if (url.protocol == "javascript") {
        throw Exception("The protocol javascript is forbidden.");
      }
      return url.href;
    } catch (error) {
      return false;
    }
  }

  render() {
    const sanitizeResourceUrl = this.sanitizeResourceUrl();

    return (
      <div className="resource item-browse">
        <div className="back-link">
          <a href="#" className="primary-action" onClick={this.handleGoBackClick}>
            <span className="icon fa">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z" /></svg>
            </span>
            <span className="primary-action-title">{this.state.resource.name}</span>
          </a>
          <a href={`${this.context.user["user.settings.trustedDomain"]}/app/passwords/view/${this.props.match.params.id}`} className="secondary-action button-icon button" target="_blank" rel="noopener noreferrer" title="View it in passbolt">
            <span className="fa icon">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" className="svg-inline--fa fa-external-link-alt fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M576 24v127.984c0 21.461-25.96 31.98-40.971 16.971l-35.707-35.709-243.523 243.523c-9.373 9.373-24.568 9.373-33.941 0l-22.627-22.627c-9.373-9.373-9.373-24.569 0-33.941L442.756 76.676l-35.703-35.705C391.982 25.9 402.656 0 424.024 0H552c13.255 0 24 10.745 24 24zM407.029 270.794l-16 16A23.999 23.999 0 0 0 384 303.765V448H64V128h264a24.003 24.003 0 0 0 16.97-7.029l16-16C376.089 89.851 365.381 64 344 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V287.764c0-21.382-25.852-32.09-40.971-16.97z"></path></svg>
            </span>
            <span className="visually-hidden">Edit in passbolt</span>
          </a>
        </div>
        <ul className="properties">
          <li className="property">
            <a role="button" className={`button button-icon property-action ${!this.state.resource.username ? "disabled" : ""}`} onClick={this.handleCopyLoginClick} title="copy to clipboard">
              <span className="fa icon login-copy-icon">
                <Transition in={this.state.copyLoginState == "default"} appear={false} timeout={500}>
                  {(status) => (
                    <svg className={`transition fade-${status} ${this.state.copyLoginState != "default" ? "visually-hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M336 64h-80c0-35.29-28.71-64-64-64s-64 28.71-64 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm-6 400H54a6 6 0 0 1-6-6V118a6 6 0 0 1 6-6h42v36c0 6.627 5.373 12 12 12h168c6.627 0 12-5.373 12-12v-36h42a6 6 0 0 1 6 6v340a6 6 0 0 1-6 6zM192 40c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24" /></svg>
                  )}
                </Transition>
                <Transition in={this.state.copyLoginState == "processing"} appear={true} timeout={500}>
                  {(status) => (
                    <svg className={`fade-${status} ${this.state.copyLoginState != "processing" ? "visually-hidden" : ""}`} width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g stroke="none" fill="none" ><g id="loading_white" transform="translate(2, 2)" strokeWidth="4"><circle id="Oval" stroke="#CCC" cx="9" cy="9" r="9" /></g><g id="loading_white" transform="translate(2, 2)" strokeWidth="2"><path d="M18,9 C18,4.03 13.97,0 9,0" id="Shape" stroke="#000"><animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.35s" repeatCount="indefinite" /></path></g></g></svg>
                  )}
                </Transition>
                <Transition in={this.state.copyLoginState == "done"} appear={true} timeout={500}>
                  {(status) => (
                    <svg className={`fade-${status} ${this.state.copyLoginState != "done" ? "visually-hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" /></svg>
                  )}
                </Transition>
              </span>
              <span className="visually-hidden">Copy to clipboard</span>
            </a>
            <span className="property-name">Username</span>
            {this.state.resource.username &&
              <a href="#" role="button" className="property-value" onClick={this.handleCopyLoginClick}>
                {this.state.resource.username}
              </a>
            }
            {!this.state.resource.username &&
              <span className="property-value empty">
                no username provided
              </span>
            }
          </li>
          <li className="property">
            <a role="button" className="button button-icon property-action" onClick={this.handleCopyPasswordClick} title="copy to clipboard">
              <span className="fa icon">
                <Transition in={this.state.copySecretState == "default"} appear={false} timeout={500}>
                  {(status) => (
                    <svg className={`transition fade-${status} ${this.state.copySecretState != "default" ? "visually-hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M336 64h-80c0-35.29-28.71-64-64-64s-64 28.71-64 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm-6 400H54a6 6 0 0 1-6-6V118a6 6 0 0 1 6-6h42v36c0 6.627 5.373 12 12 12h168c6.627 0 12-5.373 12-12v-36h42a6 6 0 0 1 6 6v340a6 6 0 0 1-6 6zM192 40c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24" /></svg>
                  )}
                </Transition>
                <Transition in={this.state.copySecretState == "processing"} appear={true} timeout={500}>
                  {(status) => (
                    <svg className={`fade-${status} ${this.state.copySecretState != "processing" ? "visually-hidden" : ""}`} width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g stroke="none" fill="none" ><g id="loading_white" transform="translate(2, 2)" strokeWidth="4"><circle id="Oval" stroke="#CCC" cx="9" cy="9" r="9" /></g><g id="loading_white" transform="translate(2, 2)" strokeWidth="2"><path d="M18,9 C18,4.03 13.97,0 9,0" id="Shape" stroke="#000"><animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.35s" repeatCount="indefinite" /></path></g></g></svg>
                  )}
                </Transition>
                <Transition in={this.state.copySecretState == "done"} appear={true} timeout={500}>
                  {(status) => (
                    <svg className={`fade-${status} ${this.state.copySecretState != "done" ? "visually-hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" /></svg>
                  )}
                </Transition>
              </span>
              <span className="visually-hidden">Copy to clipboard</span>
            </a>
            <span className="property-name">Password</span>
            <a href="#" role="button" className="secret-copy property-value" onClick={this.handleCopyPasswordClick}>
              <span className="visually-hidden">Copy to clipboard</span>
            </a>
          </li>
          <li className="property">
            <a href={`${sanitizeResourceUrl ? sanitizeResourceUrl : "#"}`} role="button" className={`button button-icon property-action ${!sanitizeResourceUrl ? "disabled" : ""}`}
              onClick={this.handleGoToUrlClick} target="_blank" rel="noopener noreferrer" title="open in a new tab">
              <span className="fa icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M448 80v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48zm-88 16H248.029c-21.313 0-32.08 25.861-16.971 40.971l31.984 31.987L67.515 364.485c-4.686 4.686-4.686 12.284 0 16.971l31.029 31.029c4.687 4.686 12.285 4.686 16.971 0l195.526-195.526 31.988 31.991C358.058 263.977 384 253.425 384 231.979V120c0-13.255-10.745-24-24-24z" /></svg>
              </span>
              <span className="visually-hidden">Open in new window</span>
            </a>
            <span className="property-name">Url</span>
            {this.state.resource.uri && sanitizeResourceUrl &&
              <a href={this.sanitizeResourceUrl()} role="button" className="property-value" target="_blank" rel="noopener noreferrer">
                {this.state.resource.uri}
              </a>
            }
            {this.state.resource.uri && !sanitizeResourceUrl &&
              <span className="property-value">
                {this.state.resource.uri}
              </span>
            }
            {!this.state.resource.uri &&
              <span className="property-value empty">
                no url provided
              </span>
            }
          </li>
        </ul>
        <div className="submit-wrapper input">
          <a href="#" id="popupAction" className={`button primary big full-width ${this.state.usingOnThisTab ? "processing" : ""}`} role="button" onClick={this.handleUseOnThisTabClick}>
            use on this page
          </a>
          <div className="error-message">{this.state.useOnThisTabError}</div>
        </div>
      </div>
    );
  }
}

ResourceViewPage.contextType = AppContext;

export default ResourceViewPage;
