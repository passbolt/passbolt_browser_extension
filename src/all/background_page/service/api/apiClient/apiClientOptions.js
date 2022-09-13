import CsrfToken from "../../../utils/csrfToken/csrfToken";

class ApiClientOptions {
  /**
   * Set base url
   *
   * @param {string|URL} baseUrl
   * @throws {TypeError} if baseUrl is empty, or not a string or valid URL
   * @returns {ApiClientOptions}
   * @public
   */
  setBaseUrl(baseUrl) {
    if (!baseUrl) {
      throw new TypeError('ApiClientOption baseUrl is required.');
    }
    if (typeof baseUrl === 'string') {
      try {
        this.baseUrl = new URL(baseUrl);
      } catch (e) {
        throw new TypeError('ApiClientOption baseUrl is invalid.');
      }
    } else {
      if (baseUrl instanceof URL) {
        this.baseUrl = baseUrl;
      } else {
        throw new TypeError('ApiClientOptions baseurl should be a string or URL');
      }
    }
    return this;
  }

  /**
   * Set CSRF Token
   *
   * @throws {TypeError} if csrfToken is empty or not a string or CsrfToken object
   * @param {string|CsrfToken} csrfToken
   * @public
   */
  setCsrfToken(csrfToken) {
    if (!csrfToken) {
      throw new TypeError('ApiClientOption csrfToken is required.');
    }
    if (typeof csrfToken === 'string') {
      this.csrfToken = new CsrfToken(csrfToken);
    } else {
      if (csrfToken instanceof CsrfToken) {
        this.csrfToken = csrfToken;
      } else {
        throw new TypeError('ApiClientOption csrfToken should be a string or a valid CsrfToken.');
      }
    }
    return this;
  }

  /**
   * Set the resource name
   *
   * @throws {TypeError} if resourceName is empty, or not a string
   * @param {string} resourceName name
   * @returns {ApiClientOptions}
   * @public
   */
  setResourceName(resourceName) {
    if (!resourceName) {
      throw new TypeError('ApiClientOptions.setResourceName resourceName is required.');
    }
    if (typeof resourceName !== 'string') {
      throw new TypeError('ApiClientOptions.setResourceName resourceName should be a valid string.');
    }
    this.resourceName = resourceName;
    return this;
  }

  /**
   * @returns {URL} baseUrl
   * @public
   */
  getBaseUrl() {
    return this.baseUrl;
  }

  /**
   * @returns {string} resourceName
   * @public
   */
  getResourceName() {
    return this.resourceName;
  }

  /**
   * @returns {CsrfToken}
   * @public
   */
  getCsrfToken() {
    return this.csrfToken;
  }

  /**
   * Returns the relevant client options as fetch options headers
   *
   * @returns {*}
   */
  getHeaders() {
    if (this.csrfToken) {
      return this.csrfToken.toFetchHeaders();
    }
  }
}
export default ApiClientOptions;

