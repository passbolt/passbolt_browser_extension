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
 * @since         2.13.0
 */
import React, {Component} from "react";
import PropTypes from "prop-types";
import AppContext from "../../../contexts/AppContext";
import FormSubmitButton from "../../Common/FormSubmitButton/FormSubmitButton";
import FormCancelButton from "../../Common/FormSubmitButton/FormCancelButton";
import DialogWrapper from "../../Common/DialogWrapper/DialogWrapper";
import UserAbortsOperationError from "../../../lib/errors/UserAbortsOperationError";

class FolderMoveStrategyDialog extends Component {
  /**
   * Constructor
   * @param {Object} props
   * @param {Object} context
   */
  constructor(props, context) {
    super(props, context);
    this.state = this.getStateBasedOnContext(context, props,  this.getDefaultState());
    this.moveOptionChangeRef = React.createRef();
    this.moveOptionKeepRef = React.createRef();
    this.bindEventHandlers();
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   * @return {void}
   */
  async componentDidMount() {
    this.setState({loading: false, moveOption: 'change'});
    this.moveOptionChangeRef.current.focus();
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
      moveOption: 'change',

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

    await this.toggleProcessing();

    try {
      port.emit(this.props.requestId, "SUCCESS", {moveOption: this.state.moveOption});
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
  handleClose() {
    if (this.state.processing) {
      return;
    }
    const error = new UserAbortsOperationError("The dialog has been closed.");
    port.emit(this.props.requestId, "ERROR", error);
    this.props.onClose();
  }

  /**
   * Should input be disabled? True if state is loading or processing
   * @returns {boolean}
   */
  hasAllInputDisabled() {
    return this.state.processing || this.state.loading;
  }

  /**
   * Return an intro message explaining the context of the move to the user
   * @returns {string}
   */
  getIntroMessage() {
    let message = '';
    if (this.isAboutItems()) {
      message = 'You are about to move several items.' + ' ';
    } else if (this.isAboutAFolder()) {
      message = 'You are about to move a folder.' + ' ';
    } else if (this.isAboutFolders()) {
      message = 'You are about to move several folders.' + ' ';
    } else if (this.isAboutAResource()) {
      message = 'You are about to move one resource.' + ' ';
    } else {
      message = 'You are about to move several resources.' + ' ';
    }
    message += 'The permissions do not match the destination folder permissions.';
    return message;
  }

  /**
   * Is this share screen handling sharing of multiple Acos?
   * @returns {boolean}
   */
  isAboutItems() {
    return this.props.resourcesIds
      && this.props.foldersIds
      && this.props.resourcesIds.length
      && this.props.foldersIds.length;
  }

  /**
   * Is this share screen handling sharing of multiple resources?
   * @returns {boolean}
   */
  isAboutResources() {
    return this.props.resourcesIds && this.props.resourcesIds.length > 1;
  }

  /**
   * Is this share screen handling sharing of multiple folders?
   * @returns {boolean}
   */
  isAboutFolders() {
    return this.props.foldersIds && this.props.foldersIds.length > 1;
  }

  /**
   * Is this share screen handling sharing one folder?
   * @returns {boolean}
   */
  isAboutAFolder() {
    return this.props.foldersIds && this.props.foldersIds.length === 1;
  }

  /**
   * Is this share screen handling sharing one resource?
   * @returns {boolean}
   */
  isAboutAResource() {
    return this.props.resourcesIds && this.props.resourcesIds.length === 1;
  }

  render() {
    return (
      <div>
        <DialogWrapper className='move-folder-strategy-dialog' title="How do you want to proceed?"
          onClose={this.handleClose} disabled={this.hasAllInputDisabled()}>
          <form className="folder-create-form" onSubmit={this.handleFormSubmit} noValidate>
            <div className="form-content">
              <p>{this.getIntroMessage()}</p>
              <div className="radiolist-alt">
                <div className="input radio">
                  <input name="moveOption" value="change" id="moveOptionChange" type="radio"
                    onChange={this.handleInputChange} ref={this.moveOptionChangeRef} checked={this.state.moveOption === 'change'} />
                  <label htmlFor="moveOptionChange">
                    <span className="strategy-name">Change permissions</span>
                    <span className="strategy-info">Remove old inherited permissions and apply the new destination folder permissions recursively.</span>
                  </label>
                </div>
                <div className="input radio last">
                  <input name="moveOption" value="keep" id="moveOptionKeep" type="radio"
                    onChange={this.handleInputChange} ref={this.moveOptionKeepRef}  checked={this.state.moveOption === 'keep'}/>
                  <label htmlFor="moveOptionKeep">
                    <span className="strategy-name">Keep existing permissions</span>
                    <span className="strategy-info">Keep the original permissions, do not apply the destination folder permissions.</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="submit-wrapper clearfix">
              <FormSubmitButton disabled={this.hasAllInputDisabled()} processing={this.state.processing} value="Move" />
              <FormCancelButton disabled={this.hasAllInputDisabled()} onClick={this.handleClose} />
            </div>
          </form>
        </DialogWrapper>
      </div>
    );
  }
}

FolderMoveStrategyDialog.contextType = AppContext;

FolderMoveStrategyDialog.propTypes = {
  className: PropTypes.string,
  folderId: PropTypes.string,
  requestId: PropTypes.string,
  foldersIds: PropTypes.array,
  resourcesIds: PropTypes.array,
  onClose: PropTypes.func
};

export default FolderMoveStrategyDialog;
