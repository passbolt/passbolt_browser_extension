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
 * @since         2.13.0
 */
import React, {Component} from "react";
import PropTypes from "prop-types";
import DialogCloseButton from "../DialogCloseButton/DialogCloseButton";

class ErrorDialog extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getDefaultState() {
    return {
      title: this.props.title || 'Oops something went wrong.',
      message: this.props.message || "An internal error occurred, please try again later.",
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Handle key down on the component.
   * @params {ReactEvent} The react event
   */
  handleKeyDown(event) {
    // Close the dialog when the user presses the "ESC" or "Enter" keys.
    if (event.keyCode === 27 || event.keyCode === 13) {
      // Stop the event propagation in order to avoid a parent component to react to this ESC event.
      event.stopPropagation();
      this.props.onClose();
    }
  }

  render() {
    return (
      <div className="dialog-wrapper error-dialog">
        <div className="dialog">
          <div className="dialog-header">
            <h2>{this.state.title}</h2>
            <DialogCloseButton onClose={this.props.onClose}/>
          </div>
          <div className="dialog-content">
            <div className="form-content">
              <p>{this.state.message}</p>
            </div>
            <div className="submit-wrapper clearfix">
              <a className="button primary" onClick={this.props.onClose}>OK</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ErrorDialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func
};

export default ErrorDialog;
