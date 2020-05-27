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
import ErrorDialog from "../../Common/ErrorDialog/ErrorDialog";
import FormSubmitButton from "../../Common/FormSubmitButton/FormSubmitButton";
import FormCancelButton from "../../Common/FormSubmitButton/FormCancelButton";
import DialogWrapper from "../../Common/DialogWrapper/DialogWrapper";

class FolderDeleteDialog extends Component {
  /**
   * Constructor
   * @param {Object} props
   * @param {Object} context
   */
  constructor(props, context) {
    super(props, context);
    this.state = this.getStateBasedOnContext(context, props,  this.getDefaultState());
    this.bindEventHandlers();
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   * @return {void}
   */
  async componentDidMount() {
    this.setState({loading: false});
  }

  /**
   * Return default state
   * @returns {Object} default state
   */
  getDefaultState() {
    return {
      // Dialog states
      loading: true,
      processing: false,

      // Error dialog trigger
      serviceError: false,
      errorMessage: '',

      // Cascade checkbox
      cascade: false
    };
  }

  /**
   * Bind callbacks methods
   */
  bindEventHandlers() {
    this.handleClose = this.handleClose.bind(this);
    this.handleCloseError = this.handleCloseError.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * Return default state based on context and props
   * For example if folder doesn't exist then we show an error message
   * Otherwise set the input name value
   *
   * @param context
   * @param props
   * @param defaultState
   * @returns {*}
   */
  getStateBasedOnContext(context, props, defaultState) {
    const folders = context.folders;
    const errorMessage = 'The folder could not be found. Maybe it was deleted or you lost access.';
    if (!folders) {
      console.error(`No folders context defined.`);
      defaultState.serviceError = true;
      defaultState.errorMessage = errorMessage;
    }
    const folder = context.folders.find(item => item.id === props.folderId) || false;
    if (!folder) {
      console.error(`Folder ${props.folderId} not found in context.`);
      defaultState.serviceError = true;
      defaultState.errorMessage = errorMessage;
    } else {
      defaultState.name = folder.name;
    }
    return defaultState;
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

    this.toggleProcessing();

    try {
      await port.request("passbolt.folders.delete", this.props.folderId, this.state.cascade);
      this.displayNotification("success", "The folder was deleted.");
      this.props.onClose();
    } catch (error) {
      console.error(error);
      this.setState({
        serviceError: true,
        errorMessage: error.message,
        processing: false
      });
    }
  }

  /**
   * Toggle processing state
   * @returns {Promise<void>}
   */
  async toggleProcessing() {
    const prev = this.state.processing;
    return new Promise(resolve => {
      this.setState({processing: !prev}, resolve());
    });
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
   * Handle close error dialog
   * @returns {void}
   */
  handleCloseError() {
    // Close error dialog / we do not close main dialog to allow retry
    this.setState({serviceError: false, serviceErrorMessage: ''});
  }

  /**
   * Handle close button click.
   */
  handleClose() {
    if (this.state.processing) {
      return;
    }
    this.props.onClose();
  }

  /**
   * Should input be disabled? True if state is loading or processing
   * @returns {boolean}
   */
  hasAllInputDisabled() {
    return this.state.processing || this.state.loading;
  }

  render() {
    return (
      <div>
        <DialogWrapper className='folder-create-dialog' title="Are you sure?"
          onClose={this.handleClose} disabled={this.hasAllInputDisabled()}>
          <form className="folder-create-form" onSubmit={this.handleFormSubmit} noValidate>
            <div className="form-content">
              <p>
                  You&apos;re about to delete the folder <strong>{this.state.name}</strong>.
                  Other users may loose access. This action cannot be undone.
              </p>
              <div className="input checkbox">
                <input id="delete-cascade" type="checkbox" name="cascade" onChange={this.handleInputChange}
                  autoFocus={true} disabled={this.hasAllInputDisabled()} />&nbsp;
                <label htmlFor="delete-cascade">Also delete items inside this folder.</label>
              </div>
            </div>
            <div className="submit-wrapper clearfix">
              <FormSubmitButton disabled={this.hasAllInputDisabled()} processing={this.state.processing} value="Delete" warning={true}/>
              <FormCancelButton disabled={this.hasAllInputDisabled()} onClick={this.handleClose} />
            </div>
          </form>
        </DialogWrapper>
        {this.state.serviceError &&
          <ErrorDialog message={this.state.errorMessage} onClose={this.handleCloseError}/>
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
