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

  /**
   * Constructor
   * Initialize state and bind methods
   */
  constructor() {
    super();
    this.state = this.getDefaultState();
    this.bindCallbacks();
    this.createRefs();
  }

  /**
   * Return default state
   * @returns {Object} default state
   */
  getDefaultState() {
    return {
      showErrorDialog: false,
      errorTitle: null,
      errorMessage: null,
      name: null,
      nameError: null,
      processing: true,
    };
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   */
  async componentDidMount() {
    this.loadFolder();
    this.focusOnNameInput();
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  /**
   * componentWillUnmount
   * Invoked before component is removed from the tree
   */
  componentWillUnmount(){
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  /**
   * Bind callbacks methods
   */
  bindCallbacks() {
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleNameInputKeyUp = this.handleNameInputKeyUp.bind(this);
  }

  /**
   * Create a ref to store the input DOM element
   */
  createRefs() {
    this.nameInputRef = React.createRef();
  }

  /**
   * Load current folder info from local storage (name)
   * @returns {Promise<void>}
   */
  async loadFolder() {
    const storageData = await browser.storage.local.get("folders");
    if (!storageData) {
      this.setState({
        processing: false,
        showErrorDialog: true,
        errorMessage: 'The folder could not be found. No folder found.'
      });
      return;
    }
    const folder = storageData.folders.find(item => item.id === this.props.folderId);
    if (!folder) {
      this.setState({
        processing: false,
        showErrorDialog: true,
        errorMessage: 'The folder could not be found. The folder may have been deleted or you may have lost access.'
      });
      return;
    }
    this.setState({
      processing: false,
      name: folder.name
    });
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
      this.focusOnNameInput();
      return;
    }

    try {
      const folderDto = {
        id: this.props.folderId,
        name: this.state.name
      };
      await port.request("passbolt.folders.update", folderDto);
      this.displayNotification("success", "The folder was renamed successfully");
      this.props.onClose();
    } catch (error) {
      this.setState({
        showErrorDialog: true,
        errorMessage: error.message,
        processing: false
      });
    }
  }

  /**
   * Focus the first field of the form which is in error state.
   */
  focusOnNameInput() {
    this.nameInputRef.current.focus();
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
    const value = event.target.value;
    const name = event.target.name;
    this.setState({
      [name]: value
    });
  }

  /**
   * Handle name input keyUp event.
   */
  async handleNameInputKeyUp() {
    const state = await this.validateNameInput();
    this.setState(state);
  }

  /**
   * Validate the name input.
   * @return {Promise<boolean>}
   */
  async validateNameInput() {
    const name = this.state.name.trim();
    if (!name.length) {
      this.setState({nameError: "A name is required."});
      return false;
    }
    try {
      await port.request("passbolt.folders.validate", {name});
    } catch(error) {
      this.setState({nameError: error.message});
      return false;
    }
    this.setState({nameError: null});
    return true;
  }

  /**
   * Validate the form.
   * @return {Promise<boolean>}
   */
  async validate() {
    return this.validateNameInput();
  }

  /**
   * Handle close button click.
   */
  handleCloseClick() {
    if (this.state.processing) {
      return;
    }
    this.props.onClose();
  }

  /**
   * Handle key down on the component.
   * @params {ReactEvent} The react event
   */
  handleKeyDown(event) {
    // Close the dialog when the user presses the "ESC" key.
    if (event.keyCode === 27) {
      event.stopPropagation();
      this.handleCloseClick();
    }
    // Submit the dialog when the user presses the "Enter" key.
    if (event.keyCode === 13) {
      event.stopPropagation();
      this.handleFormSubmit();
    }
  }

  render() {
    return (
      <div className="dialog-wrapper" onKeyDown={this.handleKeyDown}>
        {this.state.showErrorDialog &&
        <ErrorDialog title={this.state.errorTitle}
                     message={this.state.errorMessage}
                     onClose={this.handleCloseClick}/>
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
