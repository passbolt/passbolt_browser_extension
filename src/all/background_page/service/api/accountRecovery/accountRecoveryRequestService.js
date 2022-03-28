/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
const {AbstractService} = require('../abstract/abstractService');
const {v4: uuidv4} = require("uuid");

const ACCOUNT_RECOVERY_REQUEST_SERVICE_RESOURCE_NAME = '/account-recovery/requests';

class AccountRecoveryRequestService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryRequestService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_REQUEST_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported filters for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [
      'has-users',
    ];
  }

  /**
   * Find the requests of account recovery by user
   *
   * @param {string} id The request Id
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findById(id) {
    // @todo @debug @mock for account-recovery
    if (typeof jest === 'undefined') {
      return {
        "id": id,
        "authentication_token_id": uuidv4(),
        "armored_key": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n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\n=Kwft\n-----END PGP PUBLIC KEY BLOCK-----",
        "fingerprint": "03F60E958F4CB29723ACDF761353B5B15D9B054F",
        "status": "pending",
        "created": "2020-05-04T20:31:45+00:00",
        "modified": "2020-05-04T20:31:45+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "account_recovery_private_key_passwords": [
          {
            "id": uuidv4(),
            "recipient_foreign_model": "AccountRecoveryOrganizationKey",
            "recipient_foreign_key": uuidv4(),
            "data": "-----BEGIN PGP MESSAGE-----\n\nwcFMA1P90Qk1JHA+AQ/9FnvB+RTDqavNjsJLHGK1/xNuOmH+Wasbtdxu8ZdS\ncP1NjTPTKsuh5VJUfYA148qxYckSg4PMnDkSNdEwGeMYBEEMEo24qG/vDPFL\nSfAvbhLiv1xRA6cTp5V1WN6VfRVI9TimIkdFwovbhNIsgBZh/vL9ztY7Icc8\nfWXl6wc4ai8lvY+MdpPrGbDiihWCvlgKG70VbbaElynZnrrDH+C5sT9g8u/R\nndPThj6o+UsygzN3DgLxWn9O47RDEur5DGfTFcBrk0DSPJ0gQ3t4QOzIBtQ4\nbo31L/p3GBAQ6jBsC+hXz3lxzPtFmXBdMqWebS/ZxZUjGYmsBt4C0VWXWeX8\n6XuJg6CH/nv0DyikxjF651SjIFB/0N2iVaAqs8Ay4Ud/ArT6iLkyEAV/ET4n\n/Q1+ZWWkwz0wxLRuBjihqi3SKNunL+6ezbXwFatYdq/ygmy+/dUlTmKtgcFq\nKTR1jeMroyLN9pGf8+mJsTB306yrIAk46ze3WafprbmYG4l9BEBRUUkB6xef\ndGXErG/G1RQGw+9s/Y7xIf1TIu4nFx7t8gRbFhV/tRvPrBt8YYZVBl0GZh67\n3NhpAkjXrZCpyghblRO7gi3VvVFmO7GEzEvAVnFYk4AUoUNPNz5naS1WqSML\nWbgYybUR91xQE/JqzOafGzvPuqv/yb3DGE2iQ7vHOA7Swj0BVedRtqnH1R78\nRwVmeuyBCXYkJ+mdMnAkc5kQfZDb0aDJ5K1D/oCrNScuwd+iWKdSLeVMnM8D\ndDY3Y982X4jRpt8dEnvGf2101OH+QKr+9lXC+lbUubMjwsYCmVPtG8+lfMIM\nT1vGqcL11VhfHPF4KcznHiEuFN2X1AL68HDQfKkE5TdYoXfFuNxiL3e3gGlQ\nGO9SJlCaHa5imMO39/TC5CHFZ911s4Iwdc19mUuN+fbZYwh6rC99+qdaIrty\nUjgH2s0KCYwmuowcyFR5kL4/psqDT99O/RrxiIsjeWwuWzDtApsTTcXkXzmH\nWU018TVhUNHT5Cl3f7kHueMFMB7jZ9ntqd6as/nzoo+XTqsxUbwJRsb2tTU1\nsumYaceENzzapeUMkwzvXT0xekPOf5t2iOepscMddBTuZ4q76qlBY+WQ1iHs\nBJVhxOZXkUiSu/4e8HmJfP6HmDx81Jz8O4XTaHUQZ8/7k5VcvfCNzHGsekm/\nBmbycmnfEg40QGPi1l9KUnz4AoDtQ4bl9VW6T6Euy+j6gJ6FDlFxNUTcHOe8\nS89pmiQHEMuY8OHqv2pTxAnnaAd6Dq+tI+UsJ8EcdBUf/fGoE2uQfQ30Hh5U\n19qXWnqDWUbqDhVojPBLDeajXBk/fGkXMZp+Kwh8iC44ttUApleVO41p/sDo\nnOKOnJnyTDqmsb+IcZvEvIdYmn+S4OaZBZUANxx+q/hzQJsIzpi7ApuX8VfH\nMOIbgu5B0BGBqdQgPK5OtQgIWprOHCJMEhravBaR5cN3ajLDV+U7YtyIjkwn\nGQRjZ6iIyFaBojCBtljtE1Mm/cXuqCYhRt+6TCP7gH/eM/I4Ta+ibBVvDjsl\nr1IV5AGypmyAbHFyuG8CiczZMwhhYl2FtCTeJgwpewudeHgGhMTIMh2pBLJY\nahVHxt9mlvOtzoYqilLl49bXufQdnrVYBqHOvswp+4zVge26aAinYuUhYAK3\nmSJHhm/Kd/tgzizJPI5MCw9QfAv70eERPjFsWqO2fGeszr4=\n=/oK6\n-----END PGP MESSAGE-----\n"
          }
        ]
      };
    }

    const response = await this.apiClient.get(id);
    return response.body;
  }

  /**
   * Find the requests of account recovery by user
   *
   * @param {object} filters The additional filters to provide to the API
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findByUser(filters) {
    filters = filters ? this.formatFilterOptions(filters, AccountRecoveryRequestService.getSupportedFiltersOptions()) : null;
    const options = {...filters};
    const response = await this.apiClient.findAll(options);
    return response.body;
  }

  /**
   * Create an account recovery request.
   * @param {Object} accountRecoveryRequestDto The request dto
   * @returns {Promise<object>} response
   * @throws {Error} if options are invalid or API error
   */
  async create(accountRecoveryRequestDto) {
    const response = await this.apiClient.create(accountRecoveryRequestDto);
    return response.body;
  }
}

exports.AccountRecoveryRequestService = AccountRecoveryRequestService;
