/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
import UserSettings from "./userSettings";

jest.mock('../config', () => ({
  getItem: item => item,
  read: item => item
}));

describe("User settings validation security token", () => {
  const userSettings = new UserSettings();

  it("should throw an error if security token is empty", () => {
    const t = () => {
      userSettings.validateSecurityToken(undefined);
    };
    expect(t).toThrow('A token cannot be empty.');
  });

  it("should throw an error if security token code is empty", () => {
    const t = () => {
      userSettings.validateSecurityToken({'test': 'test'});
    };
    expect(t).toThrow('A token code cannot be empty.');
  });

  it("should throw an error if security token code is not ASCII chars", () => {
    const t = () => {
      userSettings.validateSecurityToken({'code': '🔥'});
    };
    expect(t).toThrow('The token code should only contain ASCII characters.');
  });

  it("should throw an error if security token code does not contain at least 3 characters", () => {
    const t = () => {
      userSettings.validateSecurityToken({'code': '12'});
    };
    expect(t).toThrow('The token code should only contain 3 characters.');
  });

  it("should throw an error if security token code contains more than 3 characters", () => {
    const t = () => {
      userSettings.validateSecurityToken({'code': '1223'});
    };
    expect(t).toThrow('The token code should only contain 3 characters.');
  });

  it("should throw an error if security token color is not set", () => {
    const t = () => {
      userSettings.validateSecurityToken({'code': '123'});
    };
    expect(t).toThrow('The token color cannot be empty.');
  });

  it("should throw an error if security token color is not hex color", () => {
    const t = () => {
      userSettings.validateSecurityToken({'code': '123', 'color': '#RRR'});
    };
    expect(t).toThrow('This is not a valid token color: #RRR');
  });

  it("should throw an error if security token text color empty", () => {
    const t = () => {
      userSettings.validateSecurityToken({'code': '123', 'color': '#000'});
    };
    expect(t).toThrow('The token text color cannot be empty.');
  });

  it("should throw an error if security token text color is not hex color", () => {
    const t = () => {
      userSettings.validateSecurityToken({'code': '123', 'color': '#66CC00', 'textcolor': '#RRR'});
    };
    expect(t).toThrow('This is not a valid token text color: #RRR.');
  });

  it("should return true if data is valid", () => {
    const t = userSettings.validateSecurityToken({'code': '123', 'color': '#000', 'textcolor': '#FFF'});
    expect(t).toBe(true);
  });
});
