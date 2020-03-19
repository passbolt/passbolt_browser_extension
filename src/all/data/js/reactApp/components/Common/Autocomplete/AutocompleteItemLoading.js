import React, {Component} from "react";

class AutocompleteItemLoading extends Component {
  render() {
    return(
      <li>
        <div className="row loading">
          <div className="main-cell-wrapper">
            <div className="main-cell">
              <div className="avatar">
                <img src='img/controls/loading_light.svg' alt="Loading, please wait" />
              </div>
              <div className="info">
                <span className="name">Loading...</span>
                <span className="details">Please wait.</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }
}

export default AutocompleteItemLoading;
