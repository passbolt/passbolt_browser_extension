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

class SharePermissionItemSkeleton extends Component {
  render() {
    return (
      <li className="row skeleton">
        <div className="avatar"></div>
        <div className="aro">
          <div className="aro-name"></div>
          <div className="aro-details"></div>
        </div>
        <div className="select rights"></div>
        <div className="actions"></div>
        <div className="shimmer"></div>
      </li>
    );
  }
}

SharePermissionItemSkeleton.propTypes = {
};

export default SharePermissionItemSkeleton;
