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
 * @since         2.14.0
 */
import React, {Component} from "react";
import PropTypes from "prop-types";
import AppContext from "../../../contexts/AppContext";
import SvgCloseIcon from "../../../img/svg/close";
import ErrorDialog from "../../Error/ErrorDialog";
import browser from "webextension-polyfill";

class FolderDeleteDialog extends Component {

  /**
   * Constructor
   * Initialize state and bind methods
   */
  constructor() {
    super();
    this.state = this.getDefaultState();
    this.bindCallbacks();
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
      name: "",
      cascade: false,
      processing: true,
    };
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   */
  async componentDidMount() {
    this.loadFolder();
  }

  /**
   * Bind callbacks methods
   */
  bindCallbacks() {
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
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

    try {
      await port.request("passbolt.folders.delete", this.props.folderId, this.state.cascade);
      this.displayNotification("success", "The folder was deleted.");
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
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
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
        <div className="dialog delete-folder-dialog">
          <div className="dialog-header">
            <h2>Delete folder</h2>
            <a className="dialog-close" onClick={this.handleCloseClick}>
              <SvgCloseIcon/>
              <span className="visually-hidden">cancel</span>
            </a>
          </div>
          <div className="dialog-content">
            <form onSubmit={this.handleFormSubmit} noValidate>
              <div className="form-content">
                <p>
                  You're about to delete the folder <strong>{this.state.name}</strong>.
                  Other users may loose access. This action cannot be undone.
                </p>
                <div className="input checkbox">
                  <input id="delete-cascade" type="checkbox" name="cascade" onChange={this.handleInputChange}/>
                  <label htmlFor="delete-cascade">Also delete items inside this folder</label>
                </div>
              </div>
              <div className="submit-wrapper clearfix">
                <a role="button" className={ `button primary ${this.state.processing ? "processing" : ""} warning` }
                   onClick={this.handleFormSubmit}>Delete</a>
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

FolderDeleteDialog.contextType = AppContext;

FolderDeleteDialog.propTypes = {
  className: PropTypes.string,
  folderId: PropTypes.string,
  onClose: PropTypes.func
};

export default FolderDeleteDialog;
