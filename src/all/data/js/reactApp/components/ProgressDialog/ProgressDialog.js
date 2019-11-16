/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2019 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2019 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.12.0
 */

import React, {Component} from "react";
import PropTypes from "prop-types";
import AppContext from "../../contexts/AppContext";

class ProgressDialog extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.initEventHandlers();
  }

  getDefaultState() {
    return {
      goals: this.props.goals || 0,
      message: this.props.message || "",
      completed: 0,
    };
  }

  initEventHandlers() {
    this.handleBackgroundPageProgressUpdateEvent = this.handleBackgroundPageProgressUpdateEvent.bind(this);
    port.on("passbolt.progress.update", this.handleBackgroundPageProgressUpdateEvent);
    this.handleBackgroundPageProgressUpdateGoalsEvent = this.handleBackgroundPageProgressUpdateGoalsEvent.bind(this);
    port.on("passbolt.progress.update-goals", this.handleBackgroundPageProgressUpdateGoalsEvent);
  }

  handleBackgroundPageProgressUpdateEvent(message, completed) {
    this.setState({
      message: message || this.state.message,
      completed: completed
    });
  }

  handleBackgroundPageProgressUpdateGoalsEvent(goals) {
    this.setState({goals: goals});
  }

  calculateProgress() {
    let progress = 100;
    if (this.state.goals) {
      progress = Math.round((100 * this.state.completed) / this.state.goals);
    }

    return progress;
  }

  render() {
    const displayDetailsSection = this.state.goals || false;
    const progress = this.calculateProgress();
    const progressBarStyle = {width: `${progress}%`};
    // @todo Adjust the styleguide.
    const progressLabelStyle = {float: "right"};

    return (
      <div className="dialog-wrapper progress-dialog">
        <div className="dialog">
          <div className="dialog-header">
            <h2>{this.props.title}</h2>
          </div>
          <div className="dialog-content">
            {/* Form content class to have the white background */}
            <div className="form-content">
              <label>Take a deep breath and enjoy being in the present moment...</label>
              <div className="progress-bar-wrapper">
                <span className="progress-bar big infinite" style={progressBarStyle}>
                  <span className="progress"></span>
                </span>
              </div>
              {displayDetailsSection &&
              <div className="progress-details">
                <span className="progress-step-label">&nbsp; {this.state.message}</span>
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

ProgressDialog.propTypes = {
  title: PropTypes.string,
  goals: PropTypes.number,
  message: PropTypes.string
};

export default ProgressDialog;

