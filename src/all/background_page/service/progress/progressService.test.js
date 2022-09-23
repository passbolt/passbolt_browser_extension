/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import ProgressService from "./progressService";

describe("AccountRecoveryOrganizationPolicyEntity builder", () => {
  it("should emit the right events with the right information", async() => {
    const title = "Progress bar title";
    const goals = 3;
    const message = "message";
    const mockedWorker = {
      port: {
        emit: jest.fn()
      }
    };
    const progressService = new ProgressService(mockedWorker, title);

    expect.assertions(8);
    progressService.start(goals, message);
    expect(progressService.progress).toBe(0);

    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.open-progress-dialog', title, goals, message);

    await progressService.finishStep(message, true);
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.update', message, 1);
    expect(progressService.progress).toBe(1);

    await progressService.finishStep(null, true);
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.update', null, 2);
    expect(progressService.progress).toBe(2);

    progressService.updateGoals(1);
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.update-goals', 1);

    await progressService.close();
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.close-progress-dialog');
  });

  it("should set the right title if set after construction", () => {
    const title = "Progress bar title";
    const newTitle = "New progress bar title";
    const goals = 3;
    const message = "message";
    const mockedWorker = {
      port: {
        emit: jest.fn()
      }
    };
    const progressService = new ProgressService(mockedWorker, title);
    progressService.start(goals, message);
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.open-progress-dialog', title, goals, message);
    progressService.close();

    progressService.title = newTitle;
    progressService.start(goals, message);
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.open-progress-dialog', newTitle, goals, message);
  });
});
