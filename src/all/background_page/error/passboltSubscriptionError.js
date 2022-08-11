/**
 * Application error
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * The passbolt subscription error to handle key expired, invalid or no key found
 */
class PassboltSubscriptionError extends Error {
  constructor(message, subscription = {}) {
    super(message);
    this.name = 'PassboltSubscriptionError';
    this.subscription = subscription;
  }
}

export default PassboltSubscriptionError;
