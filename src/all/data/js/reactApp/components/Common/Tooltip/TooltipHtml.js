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

class TooltipHtml extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.state = {top:null};
    this.tooltipRef = React.createRef();
  }

  getInlineCss() {
    if (this.state.top) {
      const top = (this.tooltipRef.current.getBoundingClientRect().top) + 'px';
      return {top};
    }
    return {};
  }

  setTop() {
    if (this.props.offset) {
      this.setState({top: this.tooltipRef.current.getBoundingClientRect().top});
    }
  }

  render() {
    return(
      <div className="more-details tooltip-alt" ref={this.tooltipRef} onMouseEnter={this.setTop.bind(this)}>
        <Icon name='info-circle' />
        <div className="tooltip-text right" style={this.getInlineCss()}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

TooltipHtml.propTypes = {
  // force top position (useful if in a scrolling container)
  offset: PropTypes.bool
};
export default TooltipHtml;
