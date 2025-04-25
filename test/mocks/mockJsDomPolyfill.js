/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.1.0
 */
import {File} from "formdata-node";

/**
 * Node environement lacks a FileReader and this breaks some tests
 */
class MockedFileReader {
  onload = null;
  onloadend = null;

  async readAsDataURL(blob) {
    const data = await blob.text();
    const event = {
      target: {
        result: `data:text/plain;base64,${btoa(data)}`
      }
    };
    this.result = event.target.result;
    this.onload?.(event);
    this.onloadend?.();
  }
}

/**
 * a minimal window object made available globally for some necessary tests
 * that requires to check for the current URL location
 */
const mockedWindow = {
  location: {
    href: "https://localhost",
  }
};

Object.defineProperty(global, "FileReader", {value: MockedFileReader});
Object.defineProperty(global, "File", {value: File});
Object.defineProperty(global, "self", {value: global});
Object.defineProperty(global, "window", {value: mockedWindow});
