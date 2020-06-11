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
 * @since         2.12.0
 */
import React, {Component} from "react";
import PropTypes from "prop-types";
import AppContext from "../../contexts/AppContext";

class ProgressDialog extends Component {
  calculateProgress() {
    if (!this.props.goals) {
      return 100; // displays a spinning 100% progress bar by default.
    }

    let progress = Math.round((100 * this.props.completed) / this.props.goals);
    if (progress > 100) {
      progress = 100;
    }
    return progress;
  }

  render() {
    const displayDetailsSection = this.props.goals || false;
    const progress = this.calculateProgress();
    const progressBarStyle = {width: `${progress}%`};
    const progressLabelStyle = {float: "right"};

    return (
      <div className="dialog-wrapper progress-dialog">
        <div className="dialog">
          <div className="dialog-header">
            <h2>{this.props.title}</h2>
          </div>
          <div className="dialog-content">
            <div className="form-content">
              <label>Take a deep breath and enjoy being in the present moment...</label>
              <div className="progress-bar-wrapper">
                <span className="progress-bar big infinite" style={progressBarStyle}>
                  <span className="progress"></span>
                </span>
              </div>
              {displayDetailsSection &&
              <div className="progress-details">
                <span className="progress-step-label">&nbsp; {this.props.message}</span>
                <span style={progressLabelStyle} className="progress-percent">{progress}%</span>
              </div>
              }
            </div>
            <div className="submit-wrapper clearfix">
              <a className="button primary processing">&nbsp;</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProgressDialog.contextType = AppContext;

ProgressDialog.defaultProps = {
  title: 'Please wait...',
  message: 'Please wait...',
  completed: 0,
  goal: 0
};

ProgressDialog.propTypes = {
  title: PropTypes.string,
  goals: PropTypes.number,
  completed: PropTypes.number,
  message: PropTypes.string
};

export default ProgressDialog;
