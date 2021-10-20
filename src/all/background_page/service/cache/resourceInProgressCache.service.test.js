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
 * @since         3.3.0
 */
import {ResourceInProgressCacheService} from "./resourceInProgressCache.service";
import Validator from 'validator';
const {ExternalResourceEntity} = require("../../model/entity/resource/external/externalResourceEntity");

jest.useFakeTimers();

const fakeResourceDto = {
  "name": "",
  "username": "",
  "uri": "",
  "secret_clear": ""
};

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("ResourceInProgressCache service", () => {
  it("should trigger a reset after a logout", () => {
    const spy = jest.spyOn(ResourceInProgressCacheService, "reset");
    const fakeResource = new ExternalResourceEntity(fakeResourceDto);

    expect(spy).not.toHaveBeenCalled();

    ResourceInProgressCacheService.set(fakeResource, Number.MAX_SAFE_INTEGER);
    expect(spy).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('passbolt.auth.after-logout'));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should do a reset after a period of time", () => {
    const spy = jest.spyOn(ResourceInProgressCacheService, "reset");
    const timeoutDelay = 5000;
    const fakeResource = new ExternalResourceEntity(fakeResourceDto);

    expect(spy).not.toHaveBeenCalled();

    ResourceInProgressCacheService.set(fakeResource, timeoutDelay);
    expect(spy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(timeoutDelay);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should do a reset after having consumed the cached resource", () => {
    const spy = jest.spyOn(ResourceInProgressCacheService, "reset");
    const fakeResource = new ExternalResourceEntity(fakeResourceDto);

    expect(spy).not.toHaveBeenCalled();

    ResourceInProgressCacheService.set(fakeResource, Number.MAX_SAFE_INTEGER);
    expect(spy).toHaveBeenCalledTimes(1);

    ResourceInProgressCacheService.consume();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should have cleared the cached memory after a reset", () => {
    const fakeResource = new ExternalResourceEntity(fakeResourceDto);

    const emptyResource = ResourceInProgressCacheService.consume();
    expect(emptyResource).toBe(null);

    ResourceInProgressCacheService.set(fakeResource, Number.MAX_SAFE_INTEGER);
    const cachedResource = ResourceInProgressCacheService.consume();
    expect(cachedResource).toEqual(fakeResource.toDto());

    const clearedResource = ResourceInProgressCacheService.consume();
    expect(clearedResource).toBe(null);
  });
});
