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
import AppContext from "../../../contexts/AppContext";

class GroupAvatar extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
  }

  getAvatarSrc(url) {
    return `${this.context.user["user.settings.trustedDomain"]}/img/avatar/group_default.png`;
  }

  getAltText() {
    return `Avatar of the ${this.props.group.name} group.`;
  }

  render() {
    return(
      <div className="avatar user-avatar">
        <img src={this.getAvatarSrc()} alt={this.getAltText()}/>
      </div>
    )
  }
}

GroupAvatar.contextType = AppContext;

GroupAvatar.propTypes = {
  group: PropTypes.object
};

export default GroupAvatar;
