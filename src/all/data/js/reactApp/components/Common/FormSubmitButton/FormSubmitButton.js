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
import React, { Component} from "react";
import PropTypes from "prop-types";

class FormSubmitButton extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.bindEventHandlers();
  }

  bindEventHandlers() {
    this.getClassName = this.getClassName.bind(this);
  }

  getClassName() {
    let name = 'button primary';
    if (this.props.warning) {
      name += ' warning';
    }
    if (this.props.disabled) {
      name += ' disabled';
    }
    if (this.props.processing) {
      name += ' processing';
    }
    return name;
  }

  render() {
    return (
      <input type="submit"
             className={this.getClassName()}
             disabled={this.props.disabled}
             value={this.props.value || 'Save'}
      />
    )
  }
}

FormSubmitButton.defaultProps = {
  warning: false
};

FormSubmitButton.propTypes = {
  processing: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  warning: PropTypes.bool
};

export default FormSubmitButton;
