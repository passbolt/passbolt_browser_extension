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
import TooltipHtml from "../Tooltip/TooltipHtml";

class DialogWrapper extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleKeyDown(event) {
    // Close the dialog when the user presses the "ESC" key.
    if (event.keyCode === 27) {
      this.handleClose();
    }
  }

  handleClose() {
    if (!this.props.disabled) {
      this.props.onClose();
    }
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   * @return {void}
   */
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <div className={`${this.props.className} dialog-wrapper`}>
        <div className="dialog">
          <div className="dialog-header">
            <h2>
              <span>{this.props.title}</span>
              {(this.props.tooltip && this.props.tooltip !== '') &&
                <TooltipHtml>
                  <span>{this.props.tooltip}</span>
                </TooltipHtml>
              }
            </h2>
            <DialogCloseButton onClose={this.handleClose} disabled={this.props.disabled}/>
          </div>
          <div className="dialog-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

DialogWrapper.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  tooltip: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClose: PropTypes.func
};

export default DialogWrapper;
