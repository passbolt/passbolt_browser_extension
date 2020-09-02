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
 * @since         2.14.0
 */
import React, {Component} from "react";
import PropTypes from "prop-types";
import AppContext from "../../../contexts/AppContext";
import Icon from "../../Common/Icons/Icon";
import Tooltip from "../../Common/Tooltip/Tooltip";

class PasswordEditDialog extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = this.getDefaultState(props, context);
    this.initEventHandlers();
    this.createInputRef();
  }

  getDefaultState(props, context) {
    const resource = context.resources.find(item => item.id === props.id) || {};
    return {
      nameOriginal: resource.name || "",
      error: "",
      name: resource.name || "",
      nameError: "",
      username: resource.username || "",
      usernameError: "",
      uri: resource.uri || "",
      uriError: "",
      password: "",
      passwordError: "",
      description: resource.description || "",
      descriptionError: "",
      viewPassword: false,
      passwordInputHasFocus: false,
      isSecretDecrypted: false,
      isSecretDecrypting: false,
      encryptDescription: null,
      resourceTypeId: resource.resource_type_id || ""
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
    this.handleDescriptionInputFocus = this.handleDescriptionInputFocus.bind(this);
    this.handleDescriptionInputBlur = this.handleDescriptionInputBlur.bind(this);
    this.handleDescriptionToggle = this.handleDescriptionToggle.bind(this);
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createInputRef() {
    this.nameInputRef = React.createRef();
    this.passwordInputRef = React.createRef();
    this.descriptionInputRef = React.createRef();
  }

  componentDidMount() {
    if (this.mustDescriptionBeEncrypted()) {
      this.setState({encryptDescription: true, description: ''});
    }
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

    await this.save();
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
  async handlePasswordInputFocus() {
    const passwordInputHasFocus = true;
    this.setState({passwordInputHasFocus: passwordInputHasFocus});
    if (!this.state.isSecretDecrypted) {
      if (await this.decryptSecret()) {
        this.passwordInputRef.current.focus();
      }
    }
  }

  /**
   * Handle description input focus.
   */
  async handleDescriptionInputFocus() {
    const descriptionHasFocus = true;
    this.setState({passwordInputHasFocus: descriptionHasFocus});
    if (this.mustDescriptionBeEncrypted() && !this.state.isSecretDecrypted) {
      if (await this.decryptSecret()) {
        this.descriptionInputRef.current.focus();
      }
    }
  }

  /**
   * Handle password input blur.
   */
  handlePasswordInputBlur() {
    this.setState({passwordInputHasFocus: false});
  }

  /**
   * Handle description input blur.
   */
  handleDescriptionInputBlur() {
    this.setState({descriptionInputHasFocus: false});
  }

  /**
   * Handle name input keyUp event.
   */
  handleNameInputKeyUp() {
    const state = this.validateNameInput();
    this.setState(state);
  }

  /**
   * Handle password input keyUp event.
   */
  handlePasswordInputKeyUp() {
    this.validatePasswordInput();
  }

  /**
   * Handle view password button click.
   */
  async handleViewPasswordButtonClick() {
    if (this.state.processing) {
      return;
    }
    let isSecretDecrypted = this.state.isSecretDecrypted;
    if (!isSecretDecrypted) {
      isSecretDecrypted = await this.decryptSecret();
    }
    if (isSecretDecrypted) {
      this.setState({viewPassword: !this.state.viewPassword});
    }
  }

  /**
   * Handle generate password button click.
   */
  handleGeneratePasswordButtonClick() {
    if (this.state.processing || !this.state.isSecretDecrypted) {
      return;
    }
    const password = secretComplexity.generate();
    this.setState({password: password});
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
   * Save the changes.
   */
  async save() {
    this.setState({processing: true});

    if (!await this.validate()) {
      this.setState({processing: false});
      this.focusFirstFieldError();
      return;
    }

    try {
      await this.updateResource();
      this.displayNotification("success", "The password has been updated successfully");
      this.selectAndScrollToResource(this.props.id);
      this.props.onClose();
    } catch (error) {
      // It can happen when the user has closed the passphrase entry dialog by instance.
      if (error.name === "UserAbortsOperationError") {
        this.passwordInputRef.current.blur();
        this.setState({processing: false});
      } else {
        // Unexpected error occurred.
        console.error(error);
        this.setState({
          error: error.message,
          processing: false
        });
      }
    }
  }

  /**
   * Update the resource (LEGACY)
   * @returns {Promise<Object>} updated resource
   */
  updateResourceLegacy() {
    const resourceDto = {
      id: this.props.id,
      name: this.state.name,
      username: this.state.username,
      uri: this.state.uri,
      description: this.state.description
    };
    let plaintextDto = null;
    if (this.state.isSecretDecrypted) {
      plaintextDto = this.state.password;
    }
    return port.request("passbolt.resources.update", resourceDto, plaintextDto);
  }

  /**
   * Update the resource
   * @returns {Promise<Object>} updated resource
   */
  updateResource() {
    if (!this.isResourceTypesEnabled()) {
      return this.updateResourceLegacy();
    }

    const resourceDto = {
      id: this.props.id,
      name: this.state.name,
      username: this.state.username,
      uri: this.state.uri
    };
    let plaintextDto = null;
    let resourceTypeCase;
    if (this.state.isSecretDecrypted) {
      if (!this.state.encryptDescription) {
        resourceTypeCase = 'password-string';
        resourceDto.description = this.state.description;
        plaintextDto = this.state.password;
      } else {
        resourceTypeCase = 'password-and-description';
        resourceDto.description = '';
        plaintextDto = {
          description: this.state.description,
          password: this.state.password
        };
      }
      const resourceTypeId = this.findResourceTypeIdBySlug(resourceTypeCase);
      if (resourceTypeId) {
        resourceDto.resource_type_id = resourceTypeId;
      }
    }
    return port.request("passbolt.resources.update", resourceDto, plaintextDto);
  }

  /**
   * Find a resource type for a give slug
   * @param {string} slug
   * @returns {undefined|object}
   */
  findResourceTypeIdBySlug(slug) {
    if (!this.isResourceTypesEnabled()) {
      return undefined;
    }
    const type = this.props.resourceTypes.find(type => type.slug === slug);
    if (type && type.id) {
      return type.id;
    }
    return undefined;
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
   * Decrypt the password secret
   * @return {Promise<boolean>}
   */
  async decryptSecret() {
    this.setState({
      isSecretDecrypting: true
    });

    try {
      const secretDto = await this.getDecryptedSecret();
      this.setState({
        password: secretDto.password,
        description: secretDto.description,
        isSecretDecrypting: false,
        isSecretDecrypted: true
      });
    } catch (error) {
      this.passwordInputRef.current.blur();
      this.setState({
        isSecretDecrypting: false,
        isSecretDecrypted: false
      });

      return false;
    }

    return true;
  }

  /**
   * Get the decrypted password secret
   * @return {Promise<Object>}
   */
  async getDecryptedSecret() {
    const plaintext = await port.request("passbolt.secret.decrypt", this.props.id);
    if (typeof plaintext === 'string') {
      return {
        password: plaintext,
        description: this.state.description
      };
    }
    return plaintext;
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
   * Validate the password input.
   * @return {Promise}
   */
  validatePasswordInput() {
    if (!this.state.isSecretDecrypted) {
      return Promise.resolve();
    }

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

  /**
   * Get the password input field placeholder.
   * @returns {string}
   */
  getPasswordInputPlaceholder() {
    let placeholder = "Click here to unlock";
    if (this.state.isSecretDecrypting) {
      placeholder = "Decrypting";
    } else if (this.state.isSecretDecrypted) {
      placeholder = "Password";
    }

    return placeholder;
  }

  /**
   * Are resource types supported?
   * @returns {boolean}
   */
  isResourceTypesEnabled() {
    return !(!this.props.resourceTypes || !this.props.resourceTypes.length);
  }

  /**
   * Must the description be kept encrypted?
   * E.g. prevent downgrading from an encrypted description to a cleartext one
   * @returns {boolean}
   */
  mustDescriptionBeEncrypted() {
    if (!this.isResourceTypesEnabled()) {
      return false;
    }
    const type = this.props.resourceTypes.find(type => type.id === this.state.resourceTypeId);
    if (!type || !type.slug) {
      return false;
    }
    return (type.slug === 'password-and-description');
  }

  /**
   * Get the description placeholder text depending on state
   * @returns {string}
   */
  getDescriptionPlaceholder() {
    if (this.state.encryptDescription) {
      let placeholder = "Click here to unlock";
      if (this.state.isSecretDecrypting) {
        placeholder = "Decrypting";
      } else if (this.state.isSecretDecrypted) {
        placeholder = "Description (encrypted)";
      }
      return placeholder;
    }
    return "Description";
  }

  /**
   * Switch to toggle description field encryption
   */
  async handleDescriptionToggle() {
    if (!this.mustDescriptionBeEncrypted()) {
      const encrypt = !this.state.encryptDescription;
      this.setState({encryptDescription: encrypt});
      if (encrypt) {
        await this.decryptSecret();
      }
    }
  }

  render() {
    const passwordStrength = secretComplexity.strength(this.state.password);
    const passwordStrengthLabel = secretComplexity.STRENGTH[passwordStrength].label;
    const passwordStrengthLabelClass = secretComplexity.STRENGTH[passwordStrength].id;

    return (
      <div className="dialog-wrapper" onKeyDown={this.handleKeyDown}>
        <div className="dialog edit-password-dialog">
          <div className="dialog-header">
            <h2>
              <span className="dialog-header-title">Edit</span>
              <span className="dialog-header-subtitle">{this.state.nameOriginal}</span>
            </h2>
            <a className="dialog-close" onClick={this.handleCloseClick}>
              <Icon name='close' />
              <span className="visually-hidden">cancel</span>
            </a>
          </div>
          <div className="dialog-content">
            <form onSubmit={this.handleFormSubmit} noValidate>
              <div className="form-content">
                <div className={`input text required ${this.state.nameError ? "error" : ""}`}>
                  <label htmlFor="edit-password-form-name">Name</label>
                  <input id="edit-password-form-name" name="name" type="text" value={this.state.name}
                    onKeyUp={this.handleNameInputKeyUp} onChange={this.handleInputChange}
                    disabled={this.state.processing} ref={this.nameInputRef} className="required fluid" maxLength="64"
                    required="required" autoComplete="off" autoFocus={true} placeholder="Name" />
                  {this.state.nameError &&
                  <div className="name error message">{this.state.nameError}</div>
                  }
                </div>
                <div className={`input text ${this.state.uriError ? "error" : ""}`}>
                  <label htmlFor="edit-password-form-uri">URL</label>
                  <input id="edit-password-form-uri" name="uri" className="fluid" maxLength="1024" type="text"
                    autoComplete="off" value={this.state.uri} onChange={this.handleInputChange} placeholder="URL"
                    disabled={this.state.processing}/>
                  {this.state.uriError &&
                  <div className="error message">{this.state.uriError}</div>
                  }
                </div>
                <div className={`input text ${this.state.usernameError ? "error" : ""}`}>
                  <label htmlFor="edit-password-form-username">Username</label>
                  <input id="edit-password-form-username" name="username" type="text" className="fluid" maxLength="64"
                    autoComplete="off" value={this.state.username} onChange={this.handleInputChange} placeholder="Username"
                    disabled={this.state.processing}/>
                  {this.state.usernameError &&
                  <div className="error message">{this.state.usernameError}</div>
                  }
                </div>
                <div className={`input-password-wrapper required ${this.state.passwordError ? "error" : ""}`}>
                  <label htmlFor="edit-password-form-password">Password</label>
                  <div className="input text password">
                    <input id="edit-password-form-password" name="password" className="required"
                      required="required" type={this.state.viewPassword ? "text" : "password"}
                      onKeyUp={this.handlePasswordInputKeyUp} value={this.state.password}
                      placeholder={this.getPasswordInputPlaceholder()} onFocus={this.handlePasswordInputFocus}
                      onBlur={this.handlePasswordInputBlur} onChange={this.handleInputChange}
                      disabled={this.state.processing} style={this.getPasswordInputStyle()} ref={this.passwordInputRef}/>
                    <div className="security-token"
                      style={this.getSecurityTokenStyle()}>{this.context.user["user.settings.securityToken.code"]}</div>
                  </div>
                  <ul className="actions inline">
                    <li>
                      <a onClick={this.handleViewPasswordButtonClick}
                        className={`password-view button button-icon toggle ${this.state.viewPassword ? "selected" : ""} ${this.state.processing ? "disabled" : ""}`}>
                        <Icon name='eye-open' big={true}/>
                        <span className="visually-hidden">view</span>
                      </a>
                    </li>
                    <li>
                      <a onClick={this.handleGeneratePasswordButtonClick}
                        className={`password-generate button-icon button ${this.state.processing || !this.state.isSecretDecrypted ? "disabled" : ""}`}>
                        <Icon name='magic-wand' big={true}/>
                        <span className="visually-hidden">generate</span>
                      </a>
                    </li>
                  </ul>
                  <div className={`password-complexity ${passwordStrengthLabelClass}`}>
                    <span className="progress">
                      <span className={`progress-bar ${passwordStrengthLabelClass}`}/>
                    </span>
                    <span className="complexity-text">complexity: <strong>{passwordStrengthLabel}</strong></span>
                  </div>
                  {this.state.passwordError &&
                  <div className="input text">
                    <div className="password message error">{this.state.passwordError}</div>
                  </div>
                  }
                </div>
                <div className="input textarea">
                  <label htmlFor="create-password-form-description">Description&nbsp;
                    {!this.isResourceTypesEnabled() &&
                    <Tooltip message="Do not store sensitive data. Unlike the password, this data is not encrypted. Upgrade to version 3 to encrypt this information."
                      icon="info-circle"/>
                    }
                    {this.isResourceTypesEnabled() && !this.state.encryptDescription &&
                    <a role="button" onClick={this.handleDescriptionToggle}>
                      <Tooltip message="Do not store sensitive data or click here to enable encryption for the description field." icon="lock-open" />
                    </a>
                    }
                    {this.isResourceTypesEnabled() && this.state.encryptDescription &&
                    <a role="button" onClick={this.handleDescriptionToggle}>
                      <Tooltip message="The description content will be encrypted." icon="lock" />
                    </a>
                    }
                  </label>
                  <textarea id="edit-password-form-description" name="description" maxLength="10000"
                    className="required" placeholder={this.getDescriptionPlaceholder()} value={this.state.description}
                    disabled={this.state.processing} onChange={this.handleInputChange} ref={this.descriptionInputRef}
                    onFocus={this.handleDescriptionInputFocus} onBlur={this.handleDescriptionInputBlur}>
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
                <input type="submit" className="button primary" role="button" value="Save"/>
                <a className="cancel" role="button" onClick={this.handleCloseClick}>Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

PasswordEditDialog.contextType = AppContext;
PasswordEditDialog.defaultProps = {
  resourceTypes: []
};
PasswordEditDialog.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  id: PropTypes.string,
  resourceTypes: PropTypes.array
};

export default PasswordEditDialog;
