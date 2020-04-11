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

class AutocompleteItemEmpty extends Component {
  render() {
    return(
      <li>
        <div className="row">
          <div className="main-cell-wrapper">
            <div className="main-cell">
              <p>No user or group found</p>
            </div>
          </div>
        </div>
      </li>
    )
  }
}

export default AutocompleteItemEmpty;
