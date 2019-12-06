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
import PropTypes from "prop-types";
import AppContext from "../../contexts/AppContext";
import SvgCloseIcon from "../../img/svg/close";
import SvgGenerateIcon from "../../img/svg/generate";
import SvgViewIcon from "../../img/svg/view";
import SvgWarningÌcon from "../../img/svg/warning";

class PasswordCreateDialog extends Component {
  constructor() {
    super();
    this.state = this.getDefaultState();
    this.initEventHandlers();
    this.createInputRef();
  }

  getDefaultState() {
    return {
      error: "",
      name: "",
      nameError: "",
      username: "",
      usernameError: "",
      uri: "",
      uriError: "",
      password: "",
      passwordError: "",
      description: "",
      descriptionError: "",
      viewPassword: false,
      passwordInputHasFocus: false
    };
  }

  initEventHandlers() {
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePasswordInputFocus = this.handlePasswordInputFocus.bind(this);
    this.handlePasswordInputBlur = this.handlePasswordInputBlur.bind(this);
    this.handleNameInputKeyUp = this.handleNameInputKeyUp.bind(this);
    this.handlePasswordInputKeyUp = this.handlePasswordInputKeyUp.bind(this);
    this.handleViewPasswordButtonClick = this.handleViewPasswordButtonClick.bind(this);
    this.handleGeneratePasswordButtonClick = this.handleGeneratePasswordButtonClick.bind(this);
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createInputRef() {
    this.nameInputRef = React.createRef();
    this.passwordInputRef = React.createRef();
  }

  /**
   * Handle form submit event.
   * @params {ReactEvent} The react event
   * @return {Promise}
   */
  async handleFormSubmit(event) {
    event.preventDefault();

    if (this.state.processing) {
      return;
    }

    this.setState({processing: true});

    if (!await this.validate()) {
      this.setState({processing: false});
      this.focusFirstFieldError();
      return;
    }

    try {
      const resource = await this.createResource();
      this.displayNotification("success", "The password has been added successfully");
      this.selectAndScrollToResource(resource.id);
      this.props.onClose();
    } catch (error) {
      // It can happen when the user has closed the passphrase entry dialog by instance.
      if (error.name === "UserAbortsOperationError") {
        this.setState({processing: false});
      } else {
        // Unexpected error occurred.
        this.setState({
          error: error.message,
          processing: false
        });
      }
    }
  }

  /**
   * Create the resource
   * @returns {Promise}
   */
  createResource() {
    const resourceMeta = {
      name: this.state.name,
      username: this.state.username,
      uri: this.state.uri,
      description: this.state.description
    };

    return port.request("passbolt.resources.create", resourceMeta, this.state.password);
  }

  /**
   * Focus the first field of the form which is in error state.
   */
  focusFirstFieldError() {
    if (this.state.nameError) {
      this.nameInputRef.current.focus();
    } else if (this.state.passwordError) {
      this.passwordInputRef.current.focus();
    }
  }

  /**
   * Notify the user.
   * @param {string} status Can be success, error or info
   * @param {string} message The message to display
   */
  displayNotification(status, message) {
    port.emit("passbolt.notification.display", {status: status, message: message});
  }

  /**
   * Select and scroll to a given resource.
   * @param {string} id The resource id.
   */
  selectAndScrollToResource(id) {
    port.emit("passbolt.resources.select-and-scroll-to", id);
  }

  /**
   * Handle form input change.
   * @params {ReactEvent} The react event.
   */
  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  /**
   * Handle password input focus.
   */
  handlePasswordInputFocus() {
    const passwordInputHasFocus = true;
    this.setState({passwordInputHasFocus: passwordInputHasFocus});
  }

  /**
   * Handle password input blur.
   */
  handlePasswordInputBlur() {
    const passwordInputHasFocus = false;
    this.setState({passwordInputHasFocus: passwordInputHasFocus});
  }

  /**
   * Handle name input keyUp event.
   */
  handleNameInputKeyUp() {
    const state = this.validateNameInput();
    this.setState(state);
  }

  /**
   * Validate the name input.
   * @return {Promise}
   */
  validateNameInput() {
    const name = this.state.name.trim();
    let nameError = "";
    if (!name.length) {
      nameError = "A name is required.";
    }

    return new Promise(resolve => {
      this.setState({nameError: nameError}, resolve);
    });
  }

  /**
   * Handle password input keyUp event.
   */
  handlePasswordInputKeyUp() {
    this.validatePasswordInput();
  }

  /**
   * Validate the password input.
   * @return {Promise}
   */
  validatePasswordInput() {
    const password = this.state.password;
    let passwordError = "";
    if (!password.length) {
      passwordError = "A password is required.";
    }

    return new Promise(resolve => {
      this.setState({passwordError: passwordError}, resolve);
    });
  }

  /**
   * Validate the form.
   * @return {Promise<boolean>}
   */
  async validate() {
    // Reset the form errors.
    this.setState({
      error: "",
      nameError: "",
      uriError: "",
      usernameError: "",
      passwordError: "",
      descriptionError: ""
    });

    // Validate the form inputs.
    await Promise.all([
      this.validateNameInput(),
      this.validatePasswordInput()
    ]);

    return this.state.nameError === "" && this.state.passwordError === "";
  }

  /**
   * Handle view password button click.
   */
  handleViewPasswordButtonClick() {
    if (this.state.processing) {
      return;
    }
    this.setState({viewPassword: !this.state.viewPassword});
  }

  /**
   * Handle generate password button click.
   */
  handleGeneratePasswordButtonClick() {
    if (this.state.processing) {
      return;
    }
    const password = secretComplexity.generate();
    this.setState({
      password: password,
      passwordError: ""
    });
  }

  /**
   * Handle close button click.
   */
  handleCloseClick() {
    this.props.onClose();
  }

  /**
   * Handle key down on the component.
   * @params {ReactEvent} The react event
   */
  handleKeyDown(event) {
    // Close the dialog when the user presses the "ESC" key.
    if (event.keyCode === 27) {
      // Stop the event propagation in order to avoid a parent component to react to this ESC event.
      event.stopPropagation();
      this.props.onClose();
    }
  }

  /**
   * Get the password input style.
   * @return {Object}
   */
  getPasswordInputStyle() {
    if (this.state.passwordInputHasFocus) {
      return {
        background: this.context.user["user.settings.securityToken.color"],
        color: this.context.user["user.settings.securityToken.textColor"]
      };
    }

    return {
      background: "",
      color: "",
    };
  }

  /**
   * Get the security token style.
   * @return {Object}
   */
  getSecurityTokenStyle() {
    if (this.state.passwordInputHasFocus) {
      return {
        background: this.context.user["user.settings.securityToken.textColor"],
        color: this.context.user["user.settings.securityToken.color"],
      };
    }

    return {
      background: this.context.user["user.settings.securityToken.color"],
      color: this.context.user["user.settings.securityToken.textColor"],
    };
  }

  render() {
    const passwordInputStyle = this.getPasswordInputStyle();
    const securityTokenStyle = this.getSecurityTokenStyle();
    const passwordStrength = secretComplexity.strength(this.state.password);
    const passwordStrengthLabel = secretComplexity.STRENGTH[passwordStrength].label;
    const passwordStrengthLabelClass = secretComplexity.STRENGTH[passwordStrength].id;

    return (
      <div className="dialog-wrapper" onKeyDown={this.handleKeyDown}>
        <div className="dialog create-password-dialog">
          <div className="dialog-header">
            <h2>Create a password</h2>
            <a className="dialog-close" onClick={this.handleCloseClick}>
              <SvgCloseIcon/>
              <span className="visually-hidden">cancel</span>
            </a>
          </div>
          <div className="dialog-content">
            <form onSubmit={this.handleFormSubmit} noValidate>
              <div className="form-content">
                <div className={`input text required ${this.state.nameError ? "error" : ""}`}>
                  <label htmlFor="create-password-form-name">Name</label>
                  <input id="create-password-form-name" name="name" type="text" value={this.state.name}
                    onKeyUp={this.handleNameInputKeyUp} onChange={this.handleInputChange}
                    disabled={this.state.processing} ref={this.nameInputRef} className="required fluid" maxLength="64"
                    required="required" autoComplete="off" autoFocus={true}/>
                  {this.state.nameError &&
                  <div className="name error message">{this.state.nameError}</div>
                  }
                </div>
                <div className={`input text ${this.state.uriError ? "error" : ""}`}>
                  <label htmlFor="create-password-form-uri">URL</label>
                  <input id="create-password-form-uri" name="uri" className="fluid" maxLength="1024" type="text"
                    autoComplete="off" value={this.state.uri} onChange={this.handleInputChange}
                    disabled={this.state.processing}/>
                  {this.state.uriError &&
                  <div className="error message">{this.state.uriError}</div>
                  }
                </div>
                <div className={`input text ${this.state.usernameError ? "error" : ""}`}>
                  <label htmlFor="create-password-form-username">Username</label>
                  <input id="create-password-form-username" name="username" type="text" className="fluid" maxLength="64"
                    autoComplete="off" value={this.state.username} onChange={this.handleInputChange}
                    disabled={this.state.processing}/>
                  {this.state.usernameError &&
                  <div className="error message">{this.state.usernameError}</div>
                  }
                </div>
                <div className={`input-password-wrapper required ${this.state.passwordError ? "error" : ""}`}>
                  <label htmlFor="create-password-form-password">Password</label>
                  <div className="input text password">
                    <input id="create-password-form-password" name="password" className="required" maxLength="4096"
                      placeholder="Password" required="required" type={this.state.viewPassword ? "text" : "password"}
                      onKeyUp={this.handlePasswordInputKeyUp} value={this.state.password}
                      onFocus={this.handlePasswordInputFocus} onBlur={this.handlePasswordInputBlur}
                      onChange={this.handleInputChange} disabled={this.state.processing}
                      style={passwordInputStyle} ref={this.passwordInputRef}/>
                    <div className="security-token"
                      style={securityTokenStyle}>{this.context.user["user.settings.securityToken.code"]}</div>
                  </div>
                  <ul className="actions inline">
                    <li>
                      <a onClick={this.handleViewPasswordButtonClick}
                        className={`password-view button button-icon button-toggle ${this.state.viewPassword ? "selected" : ""}`}>
                        <SvgViewIcon/>
                        <span className="visually-hidden">view</span>
                      </a>
                    </li>
                    <li>
                      <a onClick={this.handleGeneratePasswordButtonClick}
                        className="password-generate button-icon button">
                        <SvgGenerateIcon/>
                        <span className="visually-hidden">generate</span>
                      </a>
                    </li>
                  </ul>
                  <div className={`password-complexity ${passwordStrengthLabelClass}`}>
                    <span className="progress"><span
                      className={`progress-bar ${passwordStrengthLabelClass}`}></span></span>
                    <span className="complexity-text">complexity: <strong>{passwordStrengthLabel}</strong></span>
                  </div>
                  {this.state.passwordError &&
                  <div className="input text">
                    <div className="password message error">{this.state.passwordError}</div>
                  </div>
                  }
                </div>
                <div className="input textarea">
                  <label htmlFor="create-password-form-description">Description
                    <span className="tooltip tooltip-right" data-tooltip="Do not store sensitive data. This field is not end to end encrypted.">
                      <SvgWarningÌcon/>
                    </span>
                  </label>
                  <textarea id="create-password-form-description" name="description" maxLength="10000"
                    className="required" placeholder="add a description" value={this.state.description}
                    disabled={this.state.processing} onChange={this.handleInputChange}>
                  </textarea>
                  {this.state.descriptionError &&
                  <div className="error message">{this.state.descriptionError}</div>
                  }
                </div>
              </div>
              {this.state.error &&
              <div className="feedbacks message error">{this.state.error}</div>
              }
              <div className="submit-wrapper clearfix">
                <input type="submit" className="button primary" role="button" value="Create"/>
                <a className="cancel" role="button" onClick={this.handleCloseClick}>Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

PasswordCreateDialog.contextType = AppContext;

PasswordCreateDialog.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func
};

export default PasswordCreateDialog;
