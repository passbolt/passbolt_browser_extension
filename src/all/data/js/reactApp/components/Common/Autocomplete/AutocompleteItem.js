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

class AutocompleteItem extends Component {

  getAvatar() {
    if (this.props.user) {
      // return this.props.user.profile.avatar.small;
      return 'img/avatar/user.png'
    } else {
      return 'img/avatar/group_default.png';
    }
  }

  getTitle() {
    if (this.props.user) {
      return `${this.props.user.profile.first_name} ${this.props.user.profile.last_name} (${this.props.user.username})`;
    } else {
      return `${this.props.group.name}`;
    }
  }

  getSubtitle() {
    if (this.props.user) {
      let longId = this.props.user.gpgkey.fingerprint.substr(this.props.user.gpgkey.fingerprint.length - 16);
      return longId.replace(/(.{4})/g,"$1 ")
    } else {
      if (this.props.group.user_count > 1) {
        return `${this.props.group.user_count} group members`;
      } else {
        return `One group member`
      }
    }
  }

  getClassName() {
    if (this.props.selected) {
      return 'row selected';
    }
    return 'row';
  }

  onClick () {
    this.props.onClick(this.props.id);
  }

  render() {
    return (
      <li id="autocomplete-item">
        <div className={this.getClassName()}>
          <div className="main-cell-wrapper">
            <div className="main-cell ">
              <a role="button" onClick={this.onClick.bind(this)}>
                <div className="avatar">
                  <img src={this.getAvatar()} alt="Avatar picture"/>
                </div>
                <div className="user">
                  <span className="name">{this.getTitle()}</span>
                  <span className="details">{this.getSubtitle()}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </li>
    )
  }
}

AutocompleteItem.propTypes = {
  id: PropTypes.number,
  user: PropTypes.object,
  group: PropTypes.object,
  selected: PropTypes.bool,
  onClick: PropTypes.func
};

export default AutocompleteItem;
