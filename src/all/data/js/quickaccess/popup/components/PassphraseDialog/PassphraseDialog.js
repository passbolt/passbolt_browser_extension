import React from "react";
import PropTypes from "prop-types";
import AppContext from "../../contexts/AppContext";

class PassphraseDialog extends React.Component {

  constructor(props) {
    super(props);
    this.initEventHandlers();
    this.initState();
    this.passphraseInputRef = React.createRef();
  }

  initEventHandlers() {
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  initState() {
    this.state = {
      attempt: 0,
      processing: false,
      passphrase: '',
      rememberMe: false,
      passphraseError: '',
      passphraseStyle: {},
      securityTokenStyle: {}
    };
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    this.setState({ processing: true });

    try {
      await passbolt.request('passbolt.keyring.private.checkpassphrase', this.state.passphrase);
      this.handlePassphraseSuccess();
    } catch (error) {
      this.handlePassphraseError();
    }
  }

  handlePassphraseSuccess() {
    passbolt.message.emit(this.props.requestId, "SUCCESS", { passphrase: this.state.passphrase, rememberMe: this.state.rememberMe });
    this.props.onComplete();
  }

  handlePassphraseError() {
    const attempt = this.state.attempt + 1;
    this.setState({
      processing: false,
      attempt: attempt,
      passphraseError: "this is not a valid passphrase"
    });
    if (attempt < 3) {
      // Force the passphrase input focus. The autoFocus attribute only works during the first rendering.
      this.passphraseInputRef.current.focus();
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleInputFocus() {
    this.setState({
      passphraseStyle: {
        background: this.context.user["user.settings.securityToken.color"],
        color: this.context.user["user.settings.securityToken.textColor"],
      },
      securityTokenStyle: {
        background: this.context.user["user.settings.securityToken.textColor"],
        color: this.context.user["user.settings.securityToken.color"],
      }
    });
  }

  handleInputBlur() {
    this.setState({
      passphraseStyle: {
        background: this.context.user["user.settings.securityToken.textColor"],
        color: this.context.user["user.settings.securityToken.color"],
      },
      securityTokenStyle: {
        background: this.context.user["user.settings.securityToken.color"],
        color: this.context.user["user.settings.securityToken.textColor"],
      }
    });
  }

  handleCloseButtonClick() {
    passbolt.message.emit(this.props.requestId, "ERROR", { name: "UserAbortsOperationError", message: "The dialog has been closed." });
    this.props.onComplete();
  }

  handleKeyDown(event) {
    // Close the dialog when the user presses the "ESC" key.
    if (event.keyCode === 27) {
      // If not stop it will bubble to the QuickAccess component and it will close the quickaccess dialog.
      event.stopPropagation();
      passbolt.message.emit(this.props.requestId, "ERROR", { name: "UserAbortsOperationError", message: "The dialog has been closed." });
      this.props.onComplete();
    }
  }

  render() {
    return (
      <div className="passphrase shake" onKeyDown={this.handleKeyDown}>
        <div className="back-link">
          <a className="primary-action">
            <span className="primary-action-title">Passphrase required</span>
          </a>
          <a onClick={this.handleCloseButtonClick} className="secondary-action button-icon button" title="cancel the operation">
            <span className="fa icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" /></svg>
            </span>
            <span className="visually-hidden">cancel</span>
          </a>
        </div>
        {this.state.attempt < 3 &&
          <form onSubmit={this.handleFormSubmit}>
            <div className="form-container">
              <div className={`input text passphrase required ${this.state.passphraseError ? 'error' : ''}`} >
                <label htmlFor="passphrase">Please enter your passphrase</label>
                <input type="password" name="passphrase" placeholder="passphrase" id="passphrase" autoFocus ref={this.passphraseInputRef}
                  value={this.state.passphrase} onChange={this.handleInputChange} onFocus={this.handleInputFocus} onBlur={this.handleInputBlur}
                  disabled={this.state.processing} style={this.state.passphraseStyle} />
                <span className="security-token" style={this.state.securityTokenStyle}>{this.context.user["user.settings.securityToken.code"]}</span>
                <div className="error-message">{this.state.passphraseError}</div>
              </div>
              <div className="input checkbox small">
                <input type="checkbox" name="rememberMe" id="remember-me" checked={this.state.rememberMe} onChange={this.handleInputChange} />
                <label htmlFor="remember-me">Remember until I log out.</label>
              </div>
            </div>
            <div className="submit-wrapper">
              <input type="submit" className={`button primary big full-width ${this.state.processing ? "processing" : ""}`} role="button"
                value="submit" disabled={this.state.processing} />
            </div>
          </form>
        }
        {this.state.attempt == 3 &&
          <div className="passphrase-wrong">
            <div className="too-many-attempts-error">
              Your passphrase is wrong ! The operation has been aborted.
            </div>
            <div className="submit-wrapper">
              <a className="button primary big full-width" role="button" autoFocus onClick={this.handleCloseButtonClick}>
                close
              </a>
            </div>
          </div>
        }
      </div>
    );
  }
}

PassphraseDialog.contextType = AppContext;

PassphraseDialog.propTypes = {
  className: PropTypes.string,
  requestId: PropTypes.string,
  onComplete: PropTypes.func
};

export default PassphraseDialog;
