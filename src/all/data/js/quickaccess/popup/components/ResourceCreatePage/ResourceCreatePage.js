import React from "react";
import { Link } from "react-router-dom";

class ResourceCreatePage extends React.Component {
  render() {
    return (
      <div className="resource-create">
        <div className="back-link">
          <Link to="/data/quickaccess.html" className="primary-action">
            <span className="icon fa">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z" /></svg>
            </span>
            <span className="primary-action-title">Create password</span>
          </Link>
          <Link to="/data/quickaccess.html" className="secondary-action button-icon button">
            <span className="fa icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" /></svg>
            </span>
            <span className="visually-hidden">cancel</span>
          </Link>
        </div>
        <div className="resource-create-form" data-simplebar>
          <div className="form-container">
            <div className="input text required error">
              <label for="UserUsername">Name</label>
              <input name="data[Resource][Name]" className="required fluid" maxlength="50" type="text" id="ResourceName" required="required" />
              <div className="error-message">This field is required.</div>
            </div>
            <div className="input text">
              <label for="UserUsername">URL</label>
              <input name="data[Resource][uri]" className="required fluid" maxlength="50" type="text" id="ResourceUri" required="required" />
            </div>
            <div className="input text">
              <label for="UserUsername">Username</label>
              <input name="data[Resource][username]" className="required fluid" maxlength="50" type="text" id="ResourceUsername" required="required" />
            </div>
            <div className="input text password required">
              <label for="passphrase">Password</label>
              <input type="password" placeholder="Password" id="password" />
              <a href="#" className="password-view button-icon button button-toggle">
                <span className="fa icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M569.354 231.631C512.969 135.949 407.81 72 288 72 168.14 72 63.004 135.994 6.646 231.631a47.999 47.999 0 0 0 0 48.739C63.031 376.051 168.19 440 288 440c119.86 0 224.996-63.994 281.354-159.631a47.997 47.997 0 0 0 0-48.738zM288 392c-75.162 0-136-60.827-136-136 0-75.162 60.826-136 136-136 75.162 0 136 60.826 136 136 0 75.162-60.826 136-136 136zm104-136c0 57.438-46.562 104-104 104s-104-46.562-104-104c0-17.708 4.431-34.379 12.236-48.973l-.001.032c0 23.651 19.173 42.823 42.824 42.823s42.824-19.173 42.824-42.823c0-23.651-19.173-42.824-42.824-42.824l-.032.001C253.621 156.431 270.292 152 288 152c57.438 0 104 46.562 104 104z" /></svg>
                </span>
                <span className="visually-hidden">view</span>
              </a>
              <a href="#" className="password-generate button-icon button">
                <span className="fa icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M224 96l16-32 32-16-32-16-16-32-16 32-32 16 32 16 16 32zM80 160l26.66-53.33L160 80l-53.34-26.67L80 0 53.34 53.33 0 80l53.34 26.67L80 160zm352 128l-26.66 53.33L352 368l53.34 26.67L432 448l26.66-53.33L512 368l-53.34-26.67L432 288zm70.62-193.77L417.77 9.38C411.53 3.12 403.34 0 395.15 0c-8.19 0-16.38 3.12-22.63 9.38L9.38 372.52c-12.5 12.5-12.5 32.76 0 45.25l84.85 84.85c6.25 6.25 14.44 9.37 22.62 9.37 8.19 0 16.38-3.12 22.63-9.37l363.14-363.15c12.5-12.48 12.5-32.75 0-45.24zM359.45 203.46l-50.91-50.91 86.6-86.6 50.91 50.91-86.6 86.6z" /></svg>
                </span>
                <span className="visually-hidden">generate</span>
              </a>
              <span className="password-strength">
                <span className="password-strength-bar"><span className="password-strength-bar-value weak"></span></span>
                <span className="password-strength-label">Strength:</span>
                <span className="password-strength-value">poor</span>
              </span>
            </div>

          </div>
        </div>
        <div className="submit-wrapper">
          <a id="loginSubmit" href="#" className="button primary big full-width" role="button">save</a>
        </div>
      </div>
    );
  }
}

export default ResourceCreatePage;
