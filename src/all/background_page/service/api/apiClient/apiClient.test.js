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
 * @since         2.13.0
 */
import ApiClient from "./apiClient";
import ApiClientOptions from "./apiClientOptions";
import PassboltServiceUnavailableError from '../../../error/passboltServiceUnavailableError';
import each from "jest-each";

const scenarios = [
  {baseUrl: "http://local.passbolt.dev", resourceName: "/resource", expected: "http://local.passbolt.dev/resource"},
  {baseUrl: "http://local.passbolt.dev/", resourceName: "/resource", expected: "http://local.passbolt.dev/resource"},
  {baseUrl: "http://local.passbolt.dev", resourceName: "resource", expected: "http://local.passbolt.dev/resource"},
  {baseUrl: "http://local.passbolt.dev/", resourceName: "resource", expected: "http://local.passbolt.dev/resource"},
  {baseUrl: "http://local.passbolt.dev", resourceName: "/resource/other", expected: "http://local.passbolt.dev/resource/other"},
  {baseUrl: "http://local.passbolt.dev/", resourceName: "/resource/other", expected: "http://local.passbolt.dev/resource/other"},
  {baseUrl: "http://local.passbolt.dev", resourceName: "resource/other", expected: "http://local.passbolt.dev/resource/other"},
  {baseUrl: "http://local.passbolt.dev/", resourceName: "resource/other", expected: "http://local.passbolt.dev/resource/other"},
  {baseUrl: "http://local.passbolt.dev", resourceName: "/resource/other/", expected: "http://local.passbolt.dev/resource/other"},
  {baseUrl: "http://local.passbolt.dev/", resourceName: "/resource/other/", expected: "http://local.passbolt.dev/resource/other"},
  {baseUrl: "http://local.passbolt.dev", resourceName: "resource/other/", expected: "http://local.passbolt.dev/resource/other"},
  {baseUrl: "http://local.passbolt.dev/", resourceName: "resource/other/", expected: "http://local.passbolt.dev/resource/other"},
  {baseUrl: "http://local.passbolt.dev/subfolder", resourceName: "/resource", expected: "http://local.passbolt.dev/subfolder/resource"},
  {baseUrl: "http://local.passbolt.dev/subfolder/", resourceName: "/resource", expected: "http://local.passbolt.dev/subfolder/resource"},
  {baseUrl: "http://local.passbolt.dev/subfolder", resourceName: "resource", expected: "http://local.passbolt.dev/subfolder/resource"},
  {baseUrl: "http://local.passbolt.dev/subfolder/", resourceName: "resource", expected: "http://local.passbolt.dev/subfolder/resource"},
  {baseUrl: "http://local.passbolt.dev/subfolder", resourceName: "/resource/other", expected: "http://local.passbolt.dev/subfolder/resource/other"},
  {baseUrl: "http://local.passbolt.dev/subfolder/", resourceName: "/resource/other", expected: "http://local.passbolt.dev/subfolder/resource/other"},
  {baseUrl: "http://local.passbolt.dev/subfolder", resourceName: "resource/other", expected: "http://local.passbolt.dev/subfolder/resource/other"},
  {baseUrl: "http://local.passbolt.dev/subfolder/", resourceName: "resource/other", expected: "http://local.passbolt.dev/subfolder/resource/other"},
  {baseUrl: "http://local.passbolt.dev/subfolder", resourceName: "/resource/other/", expected: "http://local.passbolt.dev/subfolder/resource/other"},
  {baseUrl: "http://local.passbolt.dev/subfolder/", resourceName: "/resource/other/", expected: "http://local.passbolt.dev/subfolder/resource/other"},
  {baseUrl: "http://local.passbolt.dev/subfolder", resourceName: "resource/other/", expected: "http://local.passbolt.dev/subfolder/resource/other"},
  {baseUrl: "http://local.passbolt.dev/subfolder/", resourceName: "resource/other/", expected: "http://local.passbolt.dev/subfolder/resource/other"},
];

describe("Integration test with real fetch", () => {
  it("should throw an error if base url is missing", () => {
    expect.assertions(1);
    expect(() => {
      new ApiClient();
    }).toThrow(TypeError);
  });

  it("should throw an error if resource identifier is missing", () => {
    expect.assertions(1);
    expect(() => {
      const options = (new ApiClientOptions())
        .setBaseUrl('https://cloud.passbolt.com/passbolt-monitor/');
      new ApiClient(options);
    }).toThrow(TypeError);
  });

  it("should respond 200 to healthcheck status ping", async() => {
    expect.assertions(2);
    const options = (new ApiClientOptions())
      .setBaseUrl('https://cloud.passbolt.com/passbolt-monitor/')
      .setResourceName('healthcheck/status');
    const testClient = new ApiClient(options);
    const response = await testClient.findAll();
    expect(response.header.code).toBe(200);
    expect(response.body).toBe('OK');
  });

  it("should respond PassboltServiceUnavailableError to not reachable url", async() => {
    expect.assertions(1);
    const options = (new ApiClientOptions())
      .setBaseUrl('https://notavaliddomain.passbolt.com')
      .setResourceName('nope');
    const testClient = new ApiClient(options);
    try {
      await testClient.findAll();
    } catch (error) {
      expect(error).toBeInstanceOf(PassboltServiceUnavailableError);
    }
  });

  it("should respond 404 to wrong url", async() => {
    expect.assertions(1);
    const options = (new ApiClientOptions())
      .setBaseUrl('https://cloud.passbolt.com/passbolt-monitor/')
      .setResourceName('healthcheck/notfound');
    const testClient = new ApiClient(options);
    try {
      await testClient.findAll();
    } catch (error) {
      expect(error.data.code).toBe(404);
    }
  });

  it("should respond 401 to unauthorized url", async() => {
    expect.assertions(2);
    const options = (new ApiClientOptions())
      .setBaseUrl('https://cloud.passbolt.com/passbolt-monitor/')
      .setResourceName('users');
    const testClient = new ApiClient(options);
    try {
      await testClient.findAll();
    } catch (error) {
      expect(error.data.code).toBe(401);
      /*
       * TODO find out why we can't use:
       *   expect(error).toBeInstanceOf(PassboltApiFetchError)
       */
      expect(error.name).toBe('PassboltApiFetchError');
    }
  });

  each(scenarios).describe("Should set a proper baseUrl with ending slashes in baseUrl and starting slash in resource name", scenario => {
    it(`with the URL: ${scenario.baseUrl}/${scenario.resourceName}`, async() => {
      expect.assertions(1);
      const options = (new ApiClientOptions())
        .setBaseUrl(scenario.baseUrl)
        .setResourceName(scenario.resourceName);
      const apiClient = new ApiClient(options);

      expect(apiClient.baseUrl.toString()).toStrictEqual(scenario.expected);
    });
  });
});
