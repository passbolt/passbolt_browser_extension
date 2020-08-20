import React from "react";
import { Link } from "react-router-dom";
import SimpleBar from "../SimpleBar/SimpleBar";
import AppContext from "../../contexts/AppContext";

class ResourceCreatePage extends React.Component {
  constructor(props) {
    super(props);
    this.initEventHandlers();
    this.state = this.getDefaultState();
    this.createInputRef();
  }

  componentDidMount() {
    this.loadPasswordMetaFromTabInfo();
  }

  initEventHandlers() {
    this.handleGoBackClick = this.handleGoBackClick.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleViewPasswordButtonClick = this.handleViewPasswordButtonClick.bind(this);
    this.handleGeneratePasswordButtonClick = this.handleGeneratePasswordButtonClick.bind(this);
  }

  getDefaultState() {
    return {
      loaded: false,
      error: "",
      name: "",
      nameError: "",
      username: "",
      usernameError: "",
      uri: "",
      uriError: "",
      password: "",
      passwordError: "",
      viewPassword: false,
      strengthClass: "not_available",
      strengthLabel: "n/a",
    };
  }

  createInputRef() {
    this.nameInputRef = React.createRef();
    this.uriInputRef = React.createRef();
    this.usernameInputRef = React.createRef();
  }

  async loadPasswordMetaFromTabInfo() {
    const {name, uri} = await this.getPasswordMetaFromTabInfo();
    this.setState({ name, uri });
    await this.focusFirstEmptyField(name, uri);
    this.setState({loaded: true});
  }

  async getPasswordMetaFromTabInfo() {
    let name = "";
    let uri = "";
    const ignoreNames = ["newtab"];
    const ignoreUris = ["chrome://newtab/", "about:newtab"];

    try {
      const tabInfo = await passbolt.request("passbolt.active-tab.get-info");
      if (!ignoreNames.includes(tabInfo["title"])) {
        name = tabInfo["title"].substring(0, 64);
      }
      if (!ignoreUris.includes(tabInfo["url"])) {
        uri = tabInfo["url"];
      }
    } catch (error) {
      console.error(error);
    }

    return {name, uri};
  }

  focusFirstEmptyField(name, uri) {
    return new Promise(resolve => {
      // Wait 210ms, the time for the animation to be completed.
      // If we don't wait the animation to be completed, then the focus will screw the animation. Some browsers need
      // elements to be visible to give them focus, therefor the browser makes it visible while the animation is
      // running, making the element blinking.
      setTimeout(() => {
        if (name === "") {
          this.nameInputRef.current.focus();
        } else if (uri === "") {
          this.uriInputRef.current.focus();
        } else {
          this.usernameInputRef.current.focus();
        }
        resolve();
      }, 210);
    });
  }

  handleGoBackClick(ev) {
    ev.preventDefault();
    this.props.history.goBack();
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    this.setState({
      processing: true,
      error: "",
      nameError: "",
      usernameError: "",
      uriError: "",
    });

    const resourceDto = {
      name: this.state.name,
      username: this.state.username,
      uri: this.state.uri
    };
    const secretDto = this.state.password;

    try {
      const resource = await passbolt.request("passbolt.resources.create", resourceDto, secretDto);
      // Remove the create step from the history.
      // The user needs to be redirected to the home page and not the create page while clicking on go back
      // password details page.
      const goToComponentState = {
        goBackEntriesCount: -2
      };
      this.props.history.push(`/data/quickaccess/resources/view/${resource.id}`, goToComponentState);
    } catch (error) {
      this.handleSubmitError(error);
    }
  }

  handleSubmitError(error) {
    if (error.name === "PassboltApiFetchError"
      && error.data.code === 400 && error.data.body
      && (error.data.body.name || error.data.body.username || error.data.body.uri)) {
      // Could not validate resource data.
      this.setState({
        nameError: this.formatValidationFieldError(error.data.body.name),
        usernameError: this.formatValidationFieldError(error.data.body.username),
        uriError: this.formatValidationFieldError(error.data.body.uri),
        processing: false
      });
    } else {
      // An unexpected error occured.
      this.setState({
        error: error.message,
        processing: false
      });
    }
  }

  formatValidationFieldError(fieldErrors) {
    if (!fieldErrors) {
      return "";
    }
    return Object.values(fieldErrors).join(', ');
  }

  handlePasswordChange(event) {
    this.loadPassword(event.target.value)
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleViewPasswordButtonClick() {
    if (this.state.processing) {
      return;
    }

    this.setState({ viewPassword: !this.state.viewPassword });
  }

  handleGeneratePasswordButtonClick() {
    if (this.state.processing) {
      return;
    }

    const password = secretComplexity.generate();
    this.loadPassword(password);
  }

  loadPassword(password) {
    const strength = secretComplexity.strength(password);
    const strengthClass = secretComplexity.STRENGTH[strength].id;
    const strengthLabel = secretComplexity.STRENGTH[strength].label;
    this.setState({ password, strengthClass, strengthLabel });
  }

  render() {
    return (
      <div className="resource-create">
        <div className="back-link">
          <a href="#" className="primary-action" onClick={this.handleGoBackClick} title="Cancel the operation">
            <span className="icon fa">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z" /></svg>
            </span>
            <span className="primary-action-title">Create password</span>
          </a>
          <Link to="/data/quickaccess.html" className="secondary-action button-icon button" title="Cancel">
            <span className="fa icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" /></svg>
            </span>
            <span className="visually-hidden">cancel</span>
          </Link>
        </div>
        <form onSubmit={this.handleFormSubmit}>
          <SimpleBar className="resource-create-form">
            <div className="form-container">
              <div className={`input text required ${this.state.nameError ? "error" : ""}`}>
                <label htmlFor="name">Name</label>
                <input name="name" value={this.state.name} onChange={this.handleInputChange} disabled={this.state.processing}
                  ref={this.nameInputRef} className="required fluid" maxLength="64" type="text" id="name" required="required" autoComplete="off" />
                <div className="error-message">{this.state.nameError}</div>
              </div>
              <div className={`input text ${this.state.urlError ? "error" : ""}`}>
                <label htmlFor="uri">URL</label>
                <input name="uri" value={this.state.uri} onChange={this.handleInputChange} disabled={this.state.processing}
                  ref={this.uriInputRef} className="fluid" maxLength="1024" type="text" id="uri" autoComplete="off" />
                <div className="error-message">{this.state.uriError}</div>
              </div>
              <div className="input text">
                <label htmlFor="username">Username</label>
                <input name="username" name="username" value={this.state.username} onChange={this.handleInputChange} disabled={this.state.processing}
                  ref={this.usernameInputRef} className="fluid" maxLength="64" type="text" id="username" autoComplete="off" />
                <div className="error-message">{this.state.usernameError}</div>
              </div>
              <div className="input text password required">
                <label htmlFor="password">Password</label>
                <input name="password" maxLength="4096" value={this.state.password} onChange={this.handlePasswordChange} disabled={this.state.processing}
                  type={this.state.viewPassword ? "text" : "password"} className="required" placeholder="Password" id="password" required="required" />
                <a onClick={this.handleViewPasswordButtonClick} className={`password-view button button-icon button-toggle ${this.state.viewPassword ? "selected" : ""}`}>
                  <span className="fa icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M569.354 231.631C512.969 135.949 407.81 72 288 72 168.14 72 63.004 135.994 6.646 231.631a47.999 47.999 0 0 0 0 48.739C63.031 376.051 168.19 440 288 440c119.86 0 224.996-63.994 281.354-159.631a47.997 47.997 0 0 0 0-48.738zM288 392c-75.162 0-136-60.827-136-136 0-75.162 60.826-136 136-136 75.162 0 136 60.826 136 136 0 75.162-60.826 136-136 136zm104-136c0 57.438-46.562 104-104 104s-104-46.562-104-104c0-17.708 4.431-34.379 12.236-48.973l-.001.032c0 23.651 19.173 42.823 42.824 42.823s42.824-19.173 42.824-42.823c0-23.651-19.173-42.824-42.824-42.824l-.032.001C253.621 156.431 270.292 152 288 152c57.438 0 104 46.562 104 104z" /></svg>
                  </span>
                  <span className="visually-hidden">view</span>
                </a>
                <a onClick={this.handleGeneratePasswordButtonClick} className="password-generate button-icon button">
                  <span className="fa icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M224 96l16-32 32-16-32-16-16-32-16 32-32 16 32 16 16 32zM80 160l26.66-53.33L160 80l-53.34-26.67L80 0 53.34 53.33 0 80l53.34 26.67L80 160zm352 128l-26.66 53.33L352 368l53.34 26.67L432 448l26.66-53.33L512 368l-53.34-26.67L432 288zm70.62-193.77L417.77 9.38C411.53 3.12 403.34 0 395.15 0c-8.19 0-16.38 3.12-22.63 9.38L9.38 372.52c-12.5 12.5-12.5 32.76 0 45.25l84.85 84.85c6.25 6.25 14.44 9.37 22.62 9.37 8.19 0 16.38-3.12 22.63-9.37l363.14-363.15c12.5-12.48 12.5-32.75 0-45.24zM359.45 203.46l-50.91-50.91 86.6-86.6 50.91 50.91-86.6 86.6z" /></svg>
                  </span>
                  <span className="visually-hidden">generate</span>
                </a>
                <span className="password-strength">
                  <span className="password-strength-bar"><span className={`password-strength-bar-value ${this.state.strengthClass}`}></span></span>
                  <span className="password-strength-label">Strength:</span>
                  <span className="password-strength-value">${this.state.strengthLabel}</span>
                </span>
              </div>
            </div>
          </SimpleBar>
          <div className="submit-wrapper input">
            <input type="submit" className={`button primary big full-width ${this.state.processing ? "processing" : ""}`} role="button"
              value="save" disabled={this.state.processing} />
            <div className="error-message">{this.state.error}</div>
          </div>
        </form>
      </div>
    );
  }
}

ResourceCreatePage.contextType = AppContext;

export default ResourceCreatePage;
