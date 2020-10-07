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

class ReactAppIframe extends Component{

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

  loadReactAppIframe() {
    const iframeUrl = chrome.runtime.getURL("data/passbolt-iframe-react-app.html?passbolt=passbolt-iframe-react-app");
    this.iframeRef.current.contentWindow.location = iframeUrl;
  }

  removeLegacyCanJs() {
    // Remove canjs container.
    const canJsContainer = document.querySelector('#container');
    if (canJsContainer) {
      canJsContainer.remove();
    }
    // Remove canjs scripts.
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => script.remove());
  }

  render() {
    const style = {
      position: "absolute",
      width: "100%",
      height:"100%",
      zIndex: 999,
    };

    return (
      <iframe id="passbolt-iframe-react-app" ref={this.iframeRef} style={style} />
    );
  }
}

export default ReactAppIframe;