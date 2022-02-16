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
 * @since         3.6.0
 */

const {ProgressService} = require('./progressService');

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

    expect.assertions(9);
    await progressService.start(goals, message);
    expect(progressService.progress).toBe(0);

    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.open-progress-dialog', title, goals, message);

    await progressService.finishStep(message);
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.update', message, 1);
    expect(progressService.progress).toBe(1);

    await progressService.finishStep();
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.update', undefined, 2);
    expect(progressService.progress).toBe(2);

    await progressService.updateGoals(1);
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.update-goals', 1);

    await progressService.close();
    expect(mockedWorker.port.emit).toHaveBeenCalledWith('passbolt.progress.close-progress-dialog');
    expect(progressService.progress).toBe(0);
  });
});
