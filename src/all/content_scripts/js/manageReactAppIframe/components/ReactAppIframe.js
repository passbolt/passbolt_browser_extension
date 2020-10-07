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
 * @since        3.0.0
 */
import React, {Component} from "react";
import {withRouter} from "react-router-dom";

class ReactAppIframe extends Component {

  constructor(props) {
    super(props);
    this.createRefs();
  }

  componentDidMount() {
    this.removeLegacyCanJs();
    this.loadReactAppIframe();
  }

  createRefs() {
    this.iframeRef = React.createRef();
  }

  /**
   * Remove the legacy canjs application.
   * Empty the body and remove all javascripts.
   */
  removeLegacyCanJs() {
    // Remove all javascript.
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Remove all canjs content
    const legacyContainerElement = document.querySelector('#container');
    if (legacyContainerElement) {
      legacyContainerElement.remove();
    }
    const legacyBusElement = document.querySelector('#bus');
    if (legacyBusElement) {
      legacyBusElement.remove();
    }
    const legacyFooterElement = document.querySelector('footer');
    if (legacyFooterElement) {
      legacyFooterElement.remove();
    }
  }

  /**
   * Load the react app iframe
   * @returns {void}
   */
  loadReactAppIframe() {
    const contentScriptPathname = this.getPagePathname();
    const iframeUrl = `data/passbolt-iframe-react-app.html?passbolt=passbolt-iframe-react-app&pathname=${contentScriptPathname}`;
    this.iframeRef.current.contentWindow.location = chrome.runtime.getURL(iframeUrl);
  }

  /**
   * Get the pathname from url.
   * By instance ?pathname=/app/users
   *
   * @returns {string}
   */
  getPagePathname() {
    if (!this.validatePagePathname()) {
      return "";
    }

    return this.props.location.pathname;
  }

  /**
   * Validate a pathname.
   * A valid pathname contains only alphabetical, numerical, / and - characters
   * @param {string} pathname
   * @returns {boolean}
   */
  validatePagePathname() {
    return /^[A-Za-z0-9\-\/]*$/.test(this.props.location.pathname);
  }

  /**
   * Render the component
   * @return {JSX}
   */
  render() {
    const style = {
      position: "absolute",
      width: "100%",
      height: "100%",
      zIndex: 999,
    };

    return (
      <iframe id="passbolt-iframe-react-app" ref={this.iframeRef} style={style}/>
    );
  }
}

export default withRouter(ReactAppIframe);