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
import PropTypes from "prop-types";
import AppContext from "../../../contexts/AppContext";
import UserAbortsOperationError from "../../../lib/errors/userAbortsOperationError";
import Icon from "../../Common/Icons/Icon";

class PassphraseEntryDialog extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.initEventHandlers();
    this.createInputRef();
  }

  componentDidMount() {
    // Init the default remember me duration based on the remember me options given in options.
    if (this.hasRememberMeOptions()) {
      const rememberMeDurations = Object.keys(this.context.rememberMeOptions);
      const rememberMeDuration = parseInt(rememberMeDurations[0]);
      this.setState({rememberMeDuration: rememberMeDuration});
    }
  }

  getDefaultState() {
    return {
      attempt: 0,
      processing: false,
      passphrase: "",
      rememberMe: false,
      passphraseError: "",
      rememberMeDuration: 0,
      passphraseInputHasFocus: true
    };
  }

  initEventHandlers() {
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRememberMeDurationSelectChange = this.handleRememberMeDurationSelectChange.bind(this);
    this.handlePassphraseInputFocus = this.handlePassphraseInputFocus.bind(this);
    this.handlePassphraseInputBlur = this.handlePassphraseInputBlur.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createInputRef() {
    this.passphraseInputRef = React.createRef();
    this.rememberMeDurationSelectRef = React.createRef();
  }

  /**
   * Close the dialog.
   */
  close() {
    const error = new UserAbortsOperationError("The dialog has been closed.");
    port.emit(this.props.requestId, "ERROR", error);
    this.props.onClose();
  }

  /**
   * Handle close button click.
   */
  handleCloseClick() {
    this.close();
  }

  /**
   * Handle key down on the component.
   * @params {ReactEvent} The react event
   */
  handleKeyDown(event) {
    // Close the dialog when the user presses the "ESC" key.
    if (event.keyCode === 27) {
      event.stopPropagation();
      this.close();
    }
  }

  /**
   * Handle form submit event.
   * @params {ReactEvent} The react event
   * @return {Promise}
   */
  async handleFormSubmit(event) {
    event.preventDefault();

    this.setState({processing: true});
    if (await this.isValidPassphrase()) {
      this.handleValidPassphrase();
    } else {
      this.handleInvalidPassphrase();
    }
  }

  /**
   * Check the passphrase.
   * @return {boolean}
   */
  async isValidPassphrase() {
    try {
      await port.request("passbolt.keyring.private.checkpassphrase", this.state.passphrase);
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }

  /**
   * Check if remember me options are provided.
   */
  hasRememberMeOptions() {
    return Object.keys(this.context.rememberMeOptions).length > 0;
  }

  /**
   * Handle valid passphrase
   */
  handleValidPassphrase() {
    let rememberMe = false;
    if (this.state.rememberMe && this.hasRememberMeOptions()) {
      rememberMe = this.state.rememberMeDuration;
    }

    port.emit(this.props.requestId, "SUCCESS", {
      passphrase: this.state.passphrase,
      rememberMe: rememberMe
    });
    this.props.onClose();
  }

  /**
   * Handle invalid passphrase.
   */
  handleInvalidPassphrase() {
    const attempt = this.state.attempt + 1;
    this.setState({
      processing: false,
      attempt: attempt,
      passphraseError: "This is not a valid passphrase."
    });
    if (attempt < 3) {
      // Force the passphrase input focus. The autoFocus attribute only works during the first rendering.
      this.passphraseInputRef.current.focus();
    }
  }

  /**
   * Handle form input changes.
   * @params {ReactEvent} The react event
   */
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  /**
   * Handle remember me duration selection change.
   * @params {ReactEvent} The react event
   */
  handleRememberMeDurationSelectChange(event) {
    this.setState({
      rememberMe: true,
      rememberMeDuration: parseInt(event.target.value)
    });
  }

  /**
   * Handle passphrase input focus.
   */
  handlePassphraseInputFocus() {
    const passphraseInputHasFocus = true;
    this.setState({passphraseInputHasFocus: passphraseInputHasFocus});
  }

  /**
   * Handle passphrase input blur.
   */
  handlePassphraseInputBlur() {
    const passphraseInputHasFocus = false;
    this.setState({passphraseInputHasFocus: passphraseInputHasFocus});
  }

  /**
   * Get the passphrase input style.
   * @return {Object}
   */
  getPassphraseInputStyle() {
    if (this.state.passphraseInputHasFocus) {
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
    if (this.state.passphraseInputHasFocus) {
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
   * Render the remember me options
   * @return {array<JSX>}
   */
  renderRememberMeOptions() {
    const selectOptions = [];
    for (const time in this.context.rememberMeOptions) {
      selectOptions.push(<option value={time} key={time}>{this.context.rememberMeOptions[time].toString()}</option>);
    }
    return selectOptions;
  }

  render() {
    const passphraseStyle = this.getPassphraseInputStyle();
    const securityTokenStyle = this.getSecurityTokenStyle();
    let passphraseInputLabel = "You need your passphrase to continue.";
    if (this.state.passphraseError) {
      passphraseInputLabel = "Please enter a valid passphrase.";
    }
    const hasRememberMeOptions = this.hasRememberMeOptions();

    return (
      <div className="dialog-wrapper" onKeyDown={this.handleKeyDown}>
        <div className="dialog passphrase-entry">
          <div className="dialog-header">
            <h2>Please enter your passphrase</h2>
            <a className="dialog-close" onClick={this.handleCloseClick}>
              <Icon name="close"/>
              <span className="visually-hidden">cancel</span>
            </a>
          </div>
          {this.state.attempt < 3 &&
          <div className="dialog-content">
            <form onSubmit={this.handleFormSubmit}>
              <div className="form-content">
                <div className="input text required">
                  <label htmlFor="passphrase-entry-form-passphrase">{passphraseInputLabel}</label>
                  <input id="passphrase-entry-form-passphrase" type="password" name="passphrase"
                    placeholder="Passphrase" required="required" ref={this.passphraseInputRef}
                    className={`required ${this.state.passphraseError ? "error" : ""}`} value={this.state.passphrase}
                    autoFocus={true} onFocus={this.handlePassphraseInputFocus} onBlur={this.handlePassphraseInputBlur}
                    onChange={this.handleInputChange} disabled={this.state.processing} style={passphraseStyle}/>
                  <div className="security-token"
                    style={securityTokenStyle}>{this.context.user["user.settings.securityToken.code"]}</div>
                  {this.state.passphraseError &&
                  <div className="input text">
                    <div className="message error">{this.state.passphraseError}</div>
                  </div>
                  }
                </div>
                {hasRememberMeOptions &&
                <div>
                  <div className="input checkbox">
                    <input id="passphrase-entry-form-remember-me" type="checkbox" name="rememberMe"
                      checked={this.state.rememberMe} onChange={this.handleInputChange}/>
                    <label htmlFor="passphrase-entry-form-remember-me">Remember it for </label>
                  </div>
                  <div className="input select">
                    <select name="rememberMeDuration" value={this.state.rememberMeDuration}
                      onChange={this.handleRememberMeDurationSelectChange}
                      ref={this.rememberMeDurationSelectRef}>
                      {this.renderRememberMeOptions()}
                    </select>
                  </div>
                </div>
                }
              </div>
              <div className="submit-wrapper clearfix">
                <input type="submit" className="button primary" role="button" value="OK"/>
                <a className="cancel" onClick={this.handleCloseClick}>Cancel</a>
              </div>
            </form>
          </div>
          }
          {this.state.attempt == 3 &&
          <div className="dialog-content">
            <div className="form-content">
              Your passphrase is wrong! The operation has been aborted.
            </div>
            <div className="submit-wrapper clearfix">
              <a className="button primary" role="button" onClick={this.handleCloseClick}>Close</a>
            </div>
          </div>
          }
        </div>
      </div>
    );
  }
}

PassphraseEntryDialog.contextType = AppContext;

PassphraseEntryDialog.propTypes = {
  requestId: PropTypes.string,
  onClose: PropTypes.func
};

export default PassphraseEntryDialog;
