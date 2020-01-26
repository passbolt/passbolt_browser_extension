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
import AppContext from "../../../contexts/AppContext";
import SvgCloseIcon from "../../../img/svg/close";
import ErrorDialog from "../../Error/ErrorDialog";
import browser from "webextension-polyfill";

class FolderRenameDialog extends Component {
  constructor() {
    super();
    this.state = this.getDefaultState();
    this.initEventHandlers();
  }

  getDefaultState() {
    return {
      error: null,
      id: null,
      name: null,
      nameError: null,
      processing: true,
    };
  }

  componentDidMount() {
    this.setState({'id': this.props.folderId});
    this.loadFolder();
  }

  initEventHandlers() {
    this.handleErrorDialogCloseEvent = this.handleErrorDialogCloseEvent.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleNameInputKeyUp = this.handleNameInputKeyUp.bind(this);
  }

  async loadFolder() {
    const storageData = await browser.storage.local.get("folders");
    // TODO cannot find folder in storage
    const folder = storageData.folders.find(item => item.id == this.state.id);
    this.setState({name: folder.name });
    this.setState({processing: false});
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
      const folderDto = {
        id: this.state.id,
        name: this.state.name
      };
      await port.request("passbolt.folders.update", folderDto);
      this.displayNotification("success", "The folder was renamed successfully");
      this.props.onClose();
    } catch (error) {
      // It can happen when the user has closed the passphrase entry dialog by instance.
      if (error.name === "UserAbortsOperationError") {
        this.setState({processing: false});
      } else {
        // Unexpected error occurred.
        this.setState({
          showErrorDialog: true,
          error: error.message,
          processing: false
        });
      }
    }
  }

  /**
   * Focus the first field of the form which is in error state.
   */
  focusFirstFieldError() {
    if (this.state.nameError) {
      this.nameInputRef.current.focus();
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
   * Validate the form.
   * @return {Promise<boolean>}
   */
  async validate() {
    // Reset the form errors.
    this.setState({
      nameError: ""
    });

    // Validate the form inputs.
    await Promise.all([
      this.validateNameInput()
    ]);

    return this.state.nameError === "";
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

  handleErrorDialogCloseEvent() {
    this.setState({showErrorDialog: false});
    this.handleCloseClick();
  }

  render() {
    return (
      <div className="dialog-wrapper" onKeyDown={this.handleKeyDown}>
        {this.state.showErrorDialog &&
        <ErrorDialog title=''
                     message={this.state.error}
                     onClose={this.handleErrorDialogCloseEvent}/>
        }
        {!this.state.showErrorDialog &&
        <div className="dialog rename-folder-dialog">
          <div className="dialog-header">
            <h2>Rename a folder</h2>
            <a className="dialog-close" onClick={this.handleCloseClick}>
              <SvgCloseIcon/>
              <span className="visually-hidden">cancel</span>
            </a>
          </div>
          <div className="dialog-content">
            <form onSubmit={this.handleFormSubmit} noValidate>
              <div className="form-content">
                {!this.state.name &&
                <p>Loading...</p>
                }
                {this.state.name &&
                <div className={`input text required ${this.state.nameError ? "error" : ""}`}>
                  <label htmlFor="rename-folder-form-name">Folder name</label>
                  <input id="rename-folder-form-name" name="name" type="text" value={this.state.name}
                         onKeyUp={this.handleNameInputKeyUp} onChange={this.handleInputChange}
                         disabled={this.state.processing} ref={this.nameInputRef} className="required fluid"
                         maxLength="255"
                         required="required" autoComplete="off" autoFocus={true} placeholder="Untitled"
                  />
                  {this.state.nameError &&
                  <div className="name error message">{this.state.nameError}</div>
                  }
                </div>
                }
              </div>
              <div className="submit-wrapper clearfix">
                <a role="button" className={ `button primary ${this.state.processing ? "processing" : ""}` }
                   onClick={this.handleFormSubmit}>Rename</a>
                <a role="button" className={ `cancel ${this.state.processing ? "disabled" : ""}` }
                   onClick={this.handleCloseClick}>Cancel</a>
              </div>
            </form>
          </div>
        </div>
        }
      </div>
    );
  }
}

FolderRenameDialog.contextType = AppContext;

FolderRenameDialog.propTypes = {
  className: PropTypes.string,
  folderId: PropTypes.string,
  onClose: PropTypes.func
};

export default FolderRenameDialog;
