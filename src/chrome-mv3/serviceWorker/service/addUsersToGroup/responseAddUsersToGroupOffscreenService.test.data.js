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
 * @since         5.13.0
 */

import {
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_ERROR,
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_PROGRESS,
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
  SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER,
  SEND_MESSAGE_TARGET_OFFSCREEN_PROGRESS_SERVICE_HANDLER,
} from "../../../offscreens/service/group/addUsersToGroupOffscreenService";

export const successAddUsersToGroupResponseMessage = (message = {}) => ({
  id: crypto.randomUUID(),
  type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
  target: SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER,
  data: {},
  ...message,
});

export const errorAddUsersToGroupResponseMessage = (message = {}) => ({
  id: crypto.randomUUID(),
  type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_ERROR,
  target: SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER,
  data: {},
  ...message,
});

export const progressAddUsersToGroupResponseMessage = (message = {}) => ({
  id: crypto.randomUUID(),
  type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_PROGRESS,
  target: SEND_MESSAGE_TARGET_OFFSCREEN_PROGRESS_SERVICE_HANDLER,
  data: {},
  ...message,
});
