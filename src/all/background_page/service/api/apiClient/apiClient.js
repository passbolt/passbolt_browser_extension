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
import PassboltBadResponseError from "../../../error/passboltBadResponseError";
import PassboltApiFetchError from "../../../error/passboltApiFetchError";
import PassboltServiceUnavailableError from "../../../error/passboltServiceUnavailableError";

/**
 * @deprecated since v4.1.0. ApiClient was moved to the styleguide project.
 */
class ApiClient {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} options
   * @throws {TypeError} if baseUrl is empty or not a string
   * @public
   */
  constructor(options) {
    this.options = options;
    if (!this.options.getBaseUrl()) {
      throw new TypeError('ApiClient constructor error: baseUrl is required.');
    }
    if (!this.options.getResourceName()) {
      throw new TypeError('ApiClient constructor error: resourceName is required.');
    }
    try {
      let rawBaseUrl = this.options.getBaseUrl().toString();
      if (rawBaseUrl.endsWith('/')) {
        rawBaseUrl = rawBaseUrl.slice(0, -1);
      }
      let resourceName = this.options.getResourceName();
      if (resourceName.startsWith('/')) {
        resourceName = resourceName.slice(1);
      }
      if (resourceName.endsWith('/')) {
        resourceName = resourceName.slice(0, -1);
      }
      this.baseUrl = `${rawBaseUrl}/${resourceName}`;
      this.baseUrl = new URL(this.baseUrl);
    } catch (typeError) {
      throw new TypeError('ApiClient constructor error: b.');
    }

    this.apiVersion = 'api-version=v2';
  }

  /**
   * @returns {Object} fetchOptions.headers
   * @private
   */
  getDefaultHeaders() {
    return {
      'Accept': 'application/json',
      'content-type': 'application/json'
    };
  }

  /**
   * @returns {Object} fetchOptions
   */
  buildFetchOptions() {
    return {
      credentials: 'include',
      headers: {...this.getDefaultHeaders(), ...this.options.getHeaders()}
    };
  }

  /**
   * Find a resource by id
   *
   * @param {string} id most likely a uuid
   * @param {Object} [urlOptions] Optional url parameters for example {"contain[something]": "1"}
   * @throws {TypeError} if id is empty or not a string
   * @throws {TypeError} if urlOptions key or values are not a string
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @returns {Promise<*>}
   * @public
   */
  async get(id, urlOptions) {
    this.assertValidId(id);
    const url = this.buildUrl(`${this.baseUrl}/${id}`, urlOptions || {});
    return this.fetchAndHandleResponse('GET', url);
  }

  /**
   * Delete a resource by id
   *
   * @param {string} id most likely a uuid
   * @param {Object} [body] (will be converted to JavaScript Object Notation (JSON) string)
   * @param {Object} [urlOptions] Optional url parameters for example {"contain[something]": "1"}
   * @param {Boolean} [dryRun] optional, default false, checks if the validity of the operation prior real delete
   * @throws {TypeError} if id is empty or not a string
   * @throws {TypeError} if urlOptions key or values are not a string
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @returns {Promise<*>}
   * @public
   */
  async delete(id, body, urlOptions, dryRun) {
    this.assertValidId(id);
    let url;
    if (typeof dryRun === 'undefined') {
      dryRun = false;
    }
    if (!dryRun) {
      url = this.buildUrl(`${this.baseUrl}/${id}`, urlOptions || {});
    } else {
      url = this.buildUrl(`${this.baseUrl}/${id}/dry-run`, urlOptions || {});
    }
    const bodyString = body ? this.buildBody(body) : undefined;
    return this.fetchAndHandleResponse('DELETE', url, bodyString);
  }

  /**
   * Find all the resources
   *
   * @param {Object} [urlOptions] Optional url parameters for example {"contain[something]": "1"}
   * @throws {TypeError} if urlOptions key or values are not a string
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @returns {Promise<*>}
   * @public
   */
  async findAll(urlOptions) {
    const url = this.buildUrl(this.baseUrl.toString(), urlOptions || {});
    return await this.fetchAndHandleResponse('GET', url);
  }

  /**
   * Create a resource
   *
   * @param {Object} body (will be converted to JavaScript Object Notation (JSON) string)
   * @param {Object} [urlOptions] Optional url parameters for example {"contain[something]": "1"}
   * @throws {TypeError} if body is empty or cannot converted to valid JSON string
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @returns {Promise<*>}
   * @public
   */
  async create(body, urlOptions) {
    const url = this.buildUrl(this.baseUrl.toString(), urlOptions || {});
    const bodyString = this.buildBody(body);
    return this.fetchAndHandleResponse('POST', url, bodyString);
  }

  /**
   * Update a resource
   *
   * @param {string} id most likely a uuid
   * @param {Object} body (will be converted to JavaScript Object Notation (JSON) string)
   * @param {Object} [urlOptions] Optional url parameters for example {"contain[something]": "1"}
   * @param {Boolean?} [dryRun] optional, default false, checks if the validity of the operation prior real update
   * @throws {TypeError} if id is empty or not a string
   * @throws {TypeError} if body is empty or cannot converted to valid JSON string
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @returns {Promise<*>}
   * @public
   */
  async update(id, body, urlOptions, dryRun) {
    this.assertValidId(id);
    let url;
    if (typeof dryRun === 'undefined') {
      dryRun = false;
    }
    if (!dryRun) {
      url = this.buildUrl(`${this.baseUrl}/${id}`, urlOptions || {});
    } else {
      url = this.buildUrl(`${this.baseUrl}/${id}/dry-run`, urlOptions || {});
    }
    const bodyString = body ? this.buildBody(body) : undefined;
    return this.fetchAndHandleResponse('PUT', url, bodyString);
  }

  /**
   * Assert that an id is a valid non empty string
   *
   * @throws {TypeError} if id is empty or not a string
   * @param {string} id
   * @return {void}
   * @public
   */
  assertValidId(id) {
    if (!id) {
      throw new TypeError('ApiClient.assertValidId error: id cannot be empty');
    }
    if (typeof id !== 'string') {
      throw new TypeError('ApiClient.assertValidId error: id should be a string');
    }
  }

  /**
   * @throw TypeError
   * @param method
   * @private
   */
  assertMethod(method) {
    if (typeof method !== 'string') {
      new TypeError('ApiClient.assertValidMethod method should be a string.');
    }
    const supportedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (supportedMethods.indexOf(method) < 0) {
      new TypeError(`ApiClient.assertValidMethod error: method ${method} is not supported.`);
    }
  }

  /**
   * Url paramter assertion
   * @param {*} url
   * @throw TypeError
   * @private
   */
  assertUrl(url) {
    if (!url) {
      throw new TypeError('ApliClient.assertUrl error: url is required.');
    }
    if (!(url instanceof URL)) {
      throw new TypeError('ApliClient.assertUrl error: url should be a valid URL object.');
    }
  }

  /**
   * Body parameter assertion
   * @param body
   * @throws {TypeError} if body is not a string
   * @private
   */
  assertBody(body) {
    if (typeof body !== 'string' && !(body instanceof FormData)) {
      new TypeError(`ApiClient.assertBody error: body should be a string or an instance of FormData.`);
    }
  }

  /**
   * Build body object
   *
   * @param {Object} body
   * @throws {TypeError} if body is empty or cannot converted to valid JSON string
   * @return {string} JavaScript Object Notation (JSON) string
   * @public
   */
  buildBody(body) {
    return JSON.stringify(body);
  }

  /**
   * Return a URL object from string url and this.baseUrl and this.apiVersion
   * Optionally append urlOptions to the URL object
   *
   * @param {string|URL} url
   * @param {Object} [urlOptions] Optional url parameters for example {"contain[something]": "1"}
   * @throws {TypeError} if urlOptions key or values are not a string
   * @returns {URL}
   * @public
   */
  buildUrl(url, urlOptions) {
    if (typeof url !== 'string') {
      throw new TypeError('ApiClient.buildUrl error: url should be a string.');
    }
    const urlObj = new URL(`${url}.json?${this.apiVersion}`);

    urlOptions = urlOptions || {};
    for (const [key, value] of Object.entries(urlOptions)) {
      if (typeof key !== 'string') {
        throw new TypeError('ApiClient.buildUrl error: urlOptions key should be a string.');
      }
      if (typeof value === 'string') {
        // Example "filter[has-tag]": "<string>"
        urlObj.searchParams.append(key, value);
      } else {
        // Example "filter[has-id][]": "<uuid>"
        if (Array.isArray(value)) {
          value.forEach(v => {
            urlObj.searchParams.append(key, v);
          });
        } else {
          throw new TypeError('ApiClient.buildUrl error: urlOptions value should be a string or array.');
        }
      }
    }
    return urlObj;
  }

  /**
   * Send a request to the API without handling the response
   *
   * @param {string} method example 'GET', 'POST'
   * @param {URL} url object
   * @param {*} [body] (optional)
   * @param {Object} [options] (optional) more fetch options
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @returns {Promise<*>}
   * @public
   */
  async sendRequest(method, url, body, options) {
    this.assertUrl(url);
    this.assertMethod(method);
    if (body) {
      this.assertBody(body);
    }

    const fetchOptions = {...this.buildFetchOptions(), ...options};
    fetchOptions.method = method;
    if (body) {
      fetchOptions.body = body;
    }
    try {
      return await fetch(url.toString(), fetchOptions);
    } catch (error) {
      // Catch Network error such as connection lost.
      throw new PassboltServiceUnavailableError(error.message);
    }
  }

  /**
   * fetchAndHandleResponse
   *
   * @param {string} method example 'GET', 'POST'
   * @param {URL} url object
   * @param {*} [body] (optional)
   * @param {Object} [options] (optional) more fetch options
   * @throws {TypeError} if method, url are not defined or of the wrong type
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @returns {Promise<*>}
   * @public
   */
  async fetchAndHandleResponse(method, url, body, options) {
    let responseJson;
    const response = await this.sendRequest(method, url, body, options);

    try {
      responseJson = await response.json();
    } catch (error) {
      console.error(url.toString(), error);
      /*
       * If the response cannot be parsed, it's not a Passbolt API response.
       * It can be a for example a proxy timeout error (504).
       */
      throw new PassboltBadResponseError(error, response);
    }

    if (!response.ok) {
      const message = responseJson.header.message;
      throw new PassboltApiFetchError(message, {
        code: response.status,
        body: responseJson.body
      });
    }

    return responseJson;
  }
}

export default ApiClient;
