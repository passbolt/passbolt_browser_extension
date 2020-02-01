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

class FolderMoveDialog extends Component {
  constructor() {
    super();
    this.state = this.getDefaultState();
    this.initEventHandlers();
  }

  getDefaultState() {
    return {
      error: "",
      parent_id: "",
    };
  }

  initEventHandlers() {
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
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
      const folder = await this.moveFolder();
      this.displayNotification("success", "The folder has been moved successfully");
      this.selectAndScrollToFolder(this.props.folderId);
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
   * Move the folder
   * @returns {Promise}
   */
  moveFolder() {
    const folderDto = {
      id: this.props.folderId,
      folderParentId: this.state.folderParentId
    };

    return port.request("passbolt.folders.move", folderDto);
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
            <h2>Move a Folder</h2>
            <a className="dialog-close" onClick={this.handleCloseClick}>
              <SvgCloseIcon/>
              <span className="visually-hidden">cancel</span>
            </a>
          </div>
          <div className="dialog-content">
            TODO
          </div>
        </div>
      </div>
    );
  }
}

FolderMoveDialog.contextType = AppContext;

FolderMoveDialog.propTypes = {
  className: PropTypes.string,
  folderId: PropTypes.string,
  onClose: PropTypes.func
};

export default FolderMoveDialog;
