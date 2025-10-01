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
 * @since         4.12.0
 */

export const defaultProgressService = (data = {}) => ({
  start: jest.fn(),
  finishStep: jest.fn(),
  finishSteps: jest.fn(),
  close: jest.fn(),
  goals: 2,
  updateGoals: jest.fn(),
  updateStepMessage: jest.fn(),
  ...data,
});
