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
 * @since         3.5.0
 */
const {AbstractService} = require('../abstract/abstractService');
const {ExternalGpgKeyEntity} = require("../../../model/entity/gpgkey/external/externalGpgKeyEntity");
const {GpgKeyInfoService} = require("../../crypto/gpgKeyInfoService");
const {GpgAuth} = require('../../../model/gpgauth');
const {Keyring} = require('../../../model/keyring');

const ACCOUNT_RECOVERY_ORGANIZATION_POLICY_SERVICE_RESOURCE_NAME = '/account-recovery/organization-policies';

class AccountRecoveryOrganizationPolicyService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryOrganizationPolicyService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_ORGANIZATION_POLICY_SERVICE_RESOURCE_NAME;
  }

  /**
   * Find an organization settings of an accountRecovery
   *
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async find() {
    return {
      policy: 'opt-in',
      account_recovery_organization_public_key: {
        armored_key: "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\nmQINBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\ntB9BZGEgTG92ZWxhY2UgPGFkYUBwYXNzYm9sdC5jb20+iQJOBBMBCgA4AhsDBQsJ\r\nCAcDBRUKCQgLBRYCAwEAAh4BAheAFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0b\r\nmi8ACgkQE1O1sV2bBU+Okw\/\/b\/PRVTz0\/hgdagcVNYPn\/lclDFuwwqanyvYu6y6M\r\nAiLVn6CUtxfU7GH2aSwZSr7D\/46TSlBHvxVvNlYROMx7odbLgq47OJxfUDG5OPi7\r\nLZgsuE8zijCPURZTZu20m+ratsieV0ziri+xJV09xJrjdkXHdX2PrkU0YeJxhE50\r\nJuMR1rf7EHfCp45nWbXoM4H+LnadGC1zSHa1WhSJkeaYw9jp1gh93BKD8+kmUrm6\r\ncKEjxN54YpgjFwSdA60b+BZgXbMgA37gNQCnZYjk7toaQClUbqLMaQxHPIjETB+Z\r\njJNKOYn740N2LTRtCi3ioraQNgXQEU7tWsXGS0tuMMN7w4ya1I6sYV3fCtfiyXFw\r\nfuYnjjGzn5hXtTjiOLJ+2kdy5OmNZc9wpf6IpKv7\/F2RUwLsBUfH4ondNNXscdkB\r\n6Zoj1Hxt16TpkHnYrKsSWtoOs90JnlwYbHnki6R\/gekYRSRSpD\/ybScQDRASQ0aO\r\nhbi71WuyFbLZF92P1mEK5GInJeiFjKaifvJ8F+oagI9hiYcHgX6ghktaPrANa2De\r\nOjmesQ0WjIHirzFKx3avYIkOFwKp8v6KTzynAEQ8XUqZmqEhNjEgVKHH0g3sC+EC\r\nZ\/HGLHsRRIN1siYnJGahrrkNs7lFI5LTqByHh52bismY3ADLemxH6Voq+DokvQn4\r\nHxS5Ag0EVcdMHwEQAMFWZvlswoC+dEFISBhJLz0XpTR5M84MCn19s\/ILjp6dGPbC\r\nvlGcT5Ol\/wL43T3hML8bzq18MRGgkzhwsBkUXO+E7jVePjuGFvRwS5W+QYwCuAmw\r\nDijDdMhrev1mrdVK61v\/2U9kt5faETW8ZIYIvAWLaw\/lMHbVmKOa35ZCIJWcNsrv\r\noro2kGUklM6Nq1JQyU+puGPHuvm+1ywZzpAH5q55pMgfO+9JjMU3XFs+eqv6LVyA\r\n\/Y6T7ZK1H8inbUPm\/26sSvmYsT\/4xNVosC\/ha9lFEAasz\/rbVg7thffje4LWOXJB\r\no40iBTlHsNbCGs5BfNC0wl719JDA4V8mwhGInNtETCrGwg3mBlDrk5jYrDq5IMVk\r\nyX4Z6T8Fd2fLHmUr2kFc4vC96tGQGhNrbAa\/EeaAkWMeFyp\/YOW0Z3X2tz5A+lm+\r\nqevJZ3HcQd+7ca6mPTrYSVVXhclwSkyCLlhRJwEwSxrn+a2ZToYNotLs1uEy6tOL\r\nbIyhFBQNsR6mTa2ttkd\/89wJ+r9s7XYDOyibTQyUGgOXu\/0l1K0jTREKlC91wKkm\r\ndw\/lJkjZCIMc\/KTHiB1e7f5NdFtxwErToEZOLVumop0FjRqzHoXZIR9OCSMUzUmM\r\nspGHalE71GfwB9DkAlgvoJPohyiipJ\/Paw3pOytZnb\/7A\/PoRSjELgDNPJhxABEB\r\nAAGJAjYEGAEKACACGwwWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaPgAKCRAT\r\nU7WxXZsFTxX0EADAN9lreHgEvsl4JK89JqwBLjvGeXGTNmHsfczCTLAutVde+Lf0\r\nqACAhKhG0J8Omru2jVkUqPhkRcaTfaPKopT2KU8GfjKuuAlJ+BzH7oUq\/wy70t2h\r\nsglAYByv4y0emwnGyFC8VNw2Fe+Wil2y5d8DI8XHGp0bAXehjT2S7\/v1lEypeiiE\r\nNbhAnGG94Zywwwim0RltyNKXOgGeT4mroYxAL0zeTaX99Lch+DqyaeDq94g4sfhA\r\nVvGT2KJDT85vR3oNbB0U5wlbKPa+bUl8CokEDjqrDmdZOOs\/UO2mc45V3X5RNRtp\r\nNZMBGPJsxOKQExEOZncOVsY7ZqLrecuR8UJBQnhPd1aoz3HCJppaPI02uINWyQLs\r\nCogTf+nQWnLyN9qLrToriahNcZlDfuJCRVKTQ1gw1lkSN3IZRSkBuRYRe05US+C6\r\n8JMKHP+1XMKMgQM2XR7r4noMJKLaVUzfLXuPIWH2xNdgYXcIOSRjiANkIv4O7lWM\r\nxX9vD6LklijrepMl55Omu0bhF5rRn2VAubfxKhJs0eQn69+NWaVUrNMQ078nF+8G\r\nKT6vH32q9i9fpV38XYlwM9qEa0il5wfrSwPuDd5vmGgk9AOlSEzY2vE1kvp7lEt1\r\nTdb3ZfAajPMO3Iov5dwvm0zhJDQHFo7SFi5jH0Pgk4bAd9HBmB8sioxL4Q==\r\n=Kwft\r\n-----END PGP PUBLIC KEY BLOCK-----"
      },
      creator: {
        username: "ada@passbolt.com",
        profile: {
          first_name: "ada",
          last_name: "lovelace"
        },
        gpgkey: {
          user_id: "fa69d48f-1a3d-4f9f-b7a0-709dce039e96",
          armored_key: "faked armored key",
          fingerprint: "848E95CC7493129AD862583129B81CA8936023DD"
        }
      },
      modified: "2022-01-13T13:19:04.661Z"
    };
    /*
     * const response = this.apiClient.findAll();
     * return response.body;
     */
  }

  /**
   * Save organization settings of an accountRecovery using Passbolt API
   *
   * @param {Object} accountRecoveryOrganizationPolicyDto
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if account recovery organization policy dto is null
   * @public
   */
  async saveOrganizationSettings(accountRecoveryOrganizationPolicyDto) {
    // @todo @debug @mock for account-recovery
    this.assertNonEmptyData(accountRecoveryOrganizationPolicyDto);
    return accountRecoveryOrganizationPolicyDto;
    /*
     * const response = await this.apiClient.create(accountRecoveryOrganizationPolicyDto);
     * return response.body;
     */
  }

  /**
   * Validate the new ORK by checking that the key:
   * - uses the right algorithm
   * - is public
   * - is not revoked
   * - is not expired
   * - size/length is at least 4096
   * - it's not the server key
   * - it's not already used by a user
   * - it's not the previous ORK
   *
   * @param {AccountRecoveryOrganizationPublicKeyDto} newAccountRecoveryOrganizationPublicKeyDto
   * @param {AccountRecoveryOrganizationPublicKeyDto} currentAccountRecoveryOrganizationPublicKeyDto
   * @throws {Error} if any of the checks are wrong
   */
  static async validatePublicKey(newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto) {
    const keyEntity = new ExternalGpgKeyEntity(newAccountRecoveryOrganizationPublicKeyDto);
    const keyInfo = await GpgKeyInfoService.getKeyInfo(keyEntity);

    if (keyInfo.algorithm !== "RSA") {
      throw new Error(`The algorithm used for the key is ${keyInfo.algorithm} but, must be RSA.`);
    }

    if (keyInfo.private) {
      throw new Error(`The key must be a public key.`);
    }

    if (keyInfo.revoked) {
      throw new Error(`The key is revoked.`);
    }

    if (keyInfo.expires !== "Never") {
      const now = Date.now();
      const expirationDate = new Date(keyInfo.expires);

      if (expirationDate < now) {
        throw new Error(`The key is expired.`);
      }
    }

    if (keyInfo.length < 4096) {
      throw new Error(`The key size is of ${keyInfo.length} bits but, must be at least of 4096 bits.`);
    }

    const keyring = new Keyring();
    const gpgAuth = new GpgAuth(keyring);

    const serverKey = await gpgAuth.getServerKey();

    if (serverKey.fingerprint.toLowerCase() === keyInfo.fingerprint) {
      throw new Error("The key is the current server key, the organization recovery key must be a new one.");
    }

    await keyring.sync();
    const publicKeys = keyring.getPublicKeysFromStorage();
    for (const id in publicKeys) {
      const publicKey = publicKeys[id];
      if (publicKey.fingerprint === keyInfo.fingerprint) {
        throw new Error("The key is already being used, the organization recovery key must be a new one.");
      }
    }

    if (!currentAccountRecoveryOrganizationPublicKeyDto) {
      return;
    }

    const currentOrkEntity = new ExternalGpgKeyEntity(currentAccountRecoveryOrganizationPublicKeyDto);
    const currentOrkInfo = await GpgKeyInfoService.getKeyInfo(currentOrkEntity);
    if (currentOrkInfo.fingerprint === keyInfo.fingerprint) {
      throw new Error("The key is the current organization recovery key, you must provide a new one.");
    }
  }
}

exports.AccountRecoveryOrganizationPolicyService = AccountRecoveryOrganizationPolicyService;
