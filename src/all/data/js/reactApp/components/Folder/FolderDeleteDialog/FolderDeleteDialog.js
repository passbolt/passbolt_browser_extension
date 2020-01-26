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

class FolderDeleteDialog extends Component {
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
      id: "",
      nameError: ""
    };
  }

  initEventHandlers() {
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  /**
   * Delete DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createInputRef() {
    this.nameInputRef = React.createRef();
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
      const folder = await this.deleteFolder();
      this.displayNotification("success", "The folder has been deleted successfully");
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
   * Delete the folder
   * @returns {Promise}
   */
  deleteFolder() {
    const folderDto = {
      id: this.state.id,
      name: this.state.name,
      parentId: this.state.parentId
    };

    return port.request("passbolt.folders.delete", folderDto);
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
   * Validate the form.
   * @return {Promise<boolean>}
   */
  async validate() {
    // Reset the form errors.
    this.setState({
      error: "",
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

  render() {
    return (
      <div className="dialog-wrapper" onKeyDown={this.handleKeyDown}>
        <div className="dialog create-folder-dialog">
          <div className="dialog-header">
            <h2>Delete a Folder</h2>
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
                  <input id="permissions-for-folders" type="checkbox"/>
                  <label htmlFor="permissions-for-folders">Also delete items inside this folder</label>
                </div>
              </div>
              {this.state.error &&
              <div className="feedbacks message error">{this.state.error}</div>
              }
              <div className="submit-wrapper clearfix">
                <input type="submit" className="button primary" role="button" value="Delete"/>
                <a className="cancel" role="button" onClick={this.handleCloseClick}>Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

FolderDeleteDialog.contextType = AppContext;

FolderDeleteDialog.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func
};

export default FolderDeleteDialog;
