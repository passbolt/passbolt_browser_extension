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

import SharePermissionDeleteButton from "./SharePermissionDeleteButton";
import TooltipHtml from "../Common/Tooltip/TooltipHtml";
import ShareVariesDetails from "./ShareVariesDetails";
import AppContext from "../../contexts/AppContext";
import UserAvatar from "../Common/Avatar/UserAvatar";
import GroupAvatar from "../Common/Avatar/GroupAvatar";

class SharePermissionItem extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.state = {};
    if (!Number.isInteger(props.permissionType)) {
      throw new TypeError('Invalid permission type for share permission item.');
    }
    this.state.permissionType = props.permissionType;
    this.bindEventHandlers();
  }

  /**
   *  Invoked immediately after updating occurs. This method is not called for the initial render.
   * @param prevProps
   */
  componentDidUpdate(prevProps) {
    if (prevProps.permissionType !== this.props.permissionType) {
      this.setState({permissionType: this.props.permissionType});
    }
  }

  bindEventHandlers() {
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * R
   * @returns {string} Group or User name
   */
  getAroDetails() {
    if (this.props.aro.profile) {
      return this.props.aro.username;
    } else {
      return 'Group';
    }
  }

  isInputDisabled() {
    return this.props.disabled;
  }

  getSelectClassName() {
    if (this.isInputDisabled()) {
      return 'permission disabled';
    }
    return 'permission';
  }

  getAroName() {
    if (this.props.aro.profile) {
      let profile = this.props.aro.profile;
      return `${profile.first_name} ${profile.last_name}`;
    } else {
      return this.props.aro.name;
    }
  }

  /**
   * Return true if aro in props is a user
   * @returns {boolean}
   */
  isUser() {
    return !this.isGroup();
  }

  /**
   * Return true if aro in props is a group
   * @returns {boolean}
   */
  isGroup() {
    return !(this.props.aro && this.props.aro.profile);
  }

  getClassName() {
    let className = 'row';
    if (this.props.updated) {
      className += ' permission-updated';
    }
    return className;
  }

  handleUpdate(event) {
    let newType = parseInt(event.target.value);
    this.props.onUpdate(this.props.id, newType);
  }

  handleDelete(event) {
    this.props.onDelete(this.props.id);
  }

  render() {
    return(
      <li id={"permission-item-" + this.props.id} className={this.getClassName()}>
        {this.isUser() &&
          <UserAvatar user={this.props.aro} />
        }
        {this.isGroup() &&
          <GroupAvatar group={this.props.aro} />
        }

        <div className="aro">
          <div className="aro-name">
            <span className="ellipsis">{this.getAroName()}</span>
          </div>
          <div className="aro-details">
            <span className="ellipsis">{this.getAroDetails()}</span>
          </div>
        </div>

        <div className="select rights">
          <select name="permissionSelect"
                  className={this.getSelectClassName()}
                  value={this.state.permissionType}
                  disabled={this.isInputDisabled()}
                  onChange={this.handleUpdate}
          >
            <option value="1">can read</option>
            <option value="7">can update</option>
            <option value="15">is owner</option>
            { (this.props.variesDetails) &&
            <option value="-1">varies</option>
            }
          </select>

          {(this.props.variesDetails) &&
          <TooltipHtml offset={true}>
            <ShareVariesDetails variesDetails={this.props.variesDetails} />
          </TooltipHtml>
          }
        </div>

        <div className="actions">
          <SharePermissionDeleteButton onClose={this.handleDelete} disabled={this.isInputDisabled()}/>
        </div>
      </li>
    );
  }
}

SharePermissionItem.contextType = AppContext;

SharePermissionItem.propTypes = {
  id: PropTypes.string, // uuid
  aro: PropTypes.object, // {id: <uuid>, name: <string>, ...etc}
  variesDetails: PropTypes.object, // {type: [resource1, ...resourceN]}
  updated: PropTypes.bool,
  disabled: PropTypes.bool,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func
};

export default SharePermissionItem;
