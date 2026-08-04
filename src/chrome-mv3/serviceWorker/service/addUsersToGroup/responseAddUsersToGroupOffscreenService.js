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
} from "../../../offscreens/service/group/addUsersToGroupOffscreenService";

const ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPES = [
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_PROGRESS,
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_ERROR,
];

export default class ResponseAddUsersToGroupOffscreenService {
  /**
   * Progress services registered per offscreen request id.
   * @type {Object<string, ProgressService>}
   * @private
   */
  static _progressServices = {};

  /**
   * Handle add user to group decryption and encryption response
   * @param {object} message.
   * @param {{resolve: function, reject: function}} callbacks the offscreen response callback.
   * @return {void}
   */
  static handleAddUsersToGroupResponse(message, callbacks) {
    ResponseAddUsersToGroupOffscreenService.assertMessage(message);

    const { type, data } = message;

    // The request is over (success or error): the progress service is no longer needed.
    delete ResponseAddUsersToGroupOffscreenService._progressServices[message.id];

    if (type === ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_SUCCESS) {
      callbacks.resolve(data);
    } else {
      callbacks.reject(ResponseAddUsersToGroupOffscreenService.rebuildError(data));
    }
  }

  /**
   * Rebuild the error thrown in the offscreen document from its serialized form.
   * The contextual message (carrying the resource/user ids) is always restored; the original name and
   * the underlying cause (e.g. the openpgp reason) are restored when the serialized error is present.
   * @param {{name: string, message: string, error: string}} data The error response data.
   * @returns {Error}
   * @private
   */
  static rebuildError(data) {
    const error = new Error(data.message);
    if (data.name) {
      error.name = data.name;
    }

    if (data.error) {
      try {
        const serialized = JSON.parse(data.error);
        if (serialized?.cause) {
          error.cause = new Error(serialized.cause.message);
          if (serialized.cause.name) {
            error.cause.name = serialized.cause.name;
          }
          error.cause.stack = serialized.cause.stack;
        }
      } catch {
        // Ignore a malformed serialized error and keep the message-only error.
      }
    }

    return error;
  }

  /**
   * Handle progress message offscreen response.
   * @param {object} message.
   * @return {void}
   */
  static handleAddUsersToGroupProgress(message) {
    ResponseAddUsersToGroupOffscreenService.assertMessage(message);

    const { type, data } = message;

    if (type === ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_PROGRESS) {
      ResponseAddUsersToGroupOffscreenService._progressServices[message.id]?.updateStepMessage(data.message);
    }
  }

  /**
   * Register the progress service for a given offscreen request id.
   * @param {string} requestId The offscreen request id.
   * @param {ProgressService} progressService
   * @returns {void}
   */
  static setProgressService(requestId, progressService) {
    ResponseAddUsersToGroupOffscreenService._progressServices[requestId] = progressService;
  }

  /**
   * Assert message data.
   * @param {object} message The message.
   * @throws {Error} If the message.data is not an object.
   * @throws {Error} If the message.type is not valid.
   * @private
   */
  static assertMessage(message) {
    if (!ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPES.includes(message?.type)) {
      throw new Error(
        `ResponseAddUsersToGroupOffscreenService: message.type should be one of the following ${ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPES.join(", ")}.`,
      );
    }

    if (!(message?.data instanceof Object)) {
      throw new Error("ResponseAddUsersToGroupOffscreenService: message.data should be an object.");
    }
  }
}
