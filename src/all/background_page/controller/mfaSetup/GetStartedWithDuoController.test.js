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
 * @since         5.10.0
 */

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetStartedWithDuoController from "./GetStartedWithDuoController";

describe("GetStartedWithDuoController", () => {
  let controller;

  beforeEach(() => {
    controller = new GetStartedWithDuoController(null, null, defaultApiClientOptions());
  });

  it("Should call the duo user settings service to start setup", async () => {
    expect.assertions(1);
    jest.spyOn(controller.duoUserSettingsService, "startSetup").mockImplementation(() => {});

    await controller.exec();

    expect(controller.duoUserSettingsService.startSetup).toHaveBeenCalled();
  });
});
