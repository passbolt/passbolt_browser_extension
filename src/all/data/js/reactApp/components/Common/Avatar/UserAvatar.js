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

class UserAvatar extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.state = {error: false};
  }

  /**
   * Return true if the user from props contains a valid profile with avatar url properties
   * @returns {boolean}
   */
  propsHasUrl () {
    return this.props.user &&
      this.props.user.profile &&
      this.props.user.profile.avatar &&
      this.props.user.profile.avatar.url &&
      this.props.user.profile.avatar.url.small
  }

  propsUrlHasProtocol() {
    return this.props.user.profile.avatar.url.small.startsWith('https://');
  }

  formatUrl(url) {
    return `${this.context.user["user.settings.trustedDomain"]}/${url}`;
  }

  getPropsUrl() {
    return this.props.user.profile.avatar.url.small;
  }

  getAvatarSrc() {
    if (!this.state.error && this.propsHasUrl()) {
      if (this.propsUrlHasProtocol()) {
        return this.getPropsUrl();
      } else {
        return this.formatUrl(this.getPropsUrl());
      }
    }
    return this.formatUrl('/img/avatar/user.png');
  }

  handleError() {
    console.error(`Could not load avatar image url: ${this.getAvatarSrc()}`);
    this.setState({error: true});
  }

  getAltText() {
    return `Avatar of user ${this.props.user.profile.first_name} ${this.props.user.profile.last_name}.`;
  }

  render() {
    return(
      <div className="avatar user-avatar">
        <img src={this.getAvatarSrc()} onError={this.handleError.bind(this)} alt={this.getAltText()}/>
      </div>
    )
  }
}

UserAvatar.contextType = AppContext;

UserAvatar.propTypes = {
  user: PropTypes.object
};

export default UserAvatar;
