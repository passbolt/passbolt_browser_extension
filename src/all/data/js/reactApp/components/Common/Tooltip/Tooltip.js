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
import Icon from "../Icons/Icon";

class Tooltip extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <span className="tooltip tooltip-right" data-tooltip={this.props.message}>
        <Icon name={this.props.icon} />
      </span>
    )
  }
}

Tooltip.defaultProps = {
  icon: 'warning'
};

Tooltip.propTypes = {
  icon: PropTypes.string,
  message: PropTypes.string
};

export default Tooltip;
