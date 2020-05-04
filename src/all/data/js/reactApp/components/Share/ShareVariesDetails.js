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

class ShareVariesDetails extends Component {
  render() {
    return (
      <span className="share-varies-details">
        {(this.props.variesDetails[0].length > 0) &&
        <span><strong>No access: {this.props.variesDetails[0].join(', ')}</strong><br/></span>
        }
        {(this.props.variesDetails[1].length > 0) &&
        <span><strong>Can read: {this.props.variesDetails[1].join(', ')}</strong><br/></span>
        }
        {(this.props.variesDetails[7].length > 0) &&
        <span><strong>Can edit: {this.props.variesDetails[7].join(', ')}</strong><br/></span>
        }
        {(this.props.variesDetails[15].length > 0) &&
        <span><strong>Is owner: {this.props.variesDetails[15].join(', ')}</strong><br/></span>
        }
      </span>
    );
  }
}

ShareVariesDetails.propTypes = {
  variesDetails: PropTypes.object
};

export default ShareVariesDetails;
