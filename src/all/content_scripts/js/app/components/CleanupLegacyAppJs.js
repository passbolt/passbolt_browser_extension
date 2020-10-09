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

class CleanupLegacyAppJs extends Component {

  componentDidMount() {
    this.removeLegacyCanJs();
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
   * Render the component
   * @return {JSX}
   */
  render() {
    return (
      <>
      </>
    );
  }
}

export default CleanupLegacyAppJs;