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
        "armored_key": "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\n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\r\n=Kwft\r\n-----END PGP PUBLIC KEY BLOCK-----",
        "fingerprint": "03f60e958f4cb29723acdf761353b5b15d9b054f",
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
            "data": "-----BEGIN PGP MESSAGE-----\r\nVersion: OpenPGP.js v4.10.9\r\nComment: https://openpgpjs.org\r\n\r\nwcFMA1P90Qk1JHA+AQ/9FnvB+RTDqavNjsJLHGK1/xNuOmH+Wasbtdxu8ZdS\r\ncP1NjTPTKsuh5VJUfYA148qxYckSg4PMnDkSNdEwGeMYBEEMEo24qG/vDPFL\r\nSfAvbhLiv1xRA6cTp5V1WN6VfRVI9TimIkdFwovbhNIsgBZh/vL9ztY7Icc8\r\nfWXl6wc4ai8lvY+MdpPrGbDiihWCvlgKG70VbbaElynZnrrDH+C5sT9g8u/R\r\nndPThj6o+UsygzN3DgLxWn9O47RDEur5DGfTFcBrk0DSPJ0gQ3t4QOzIBtQ4\r\nbo31L/p3GBAQ6jBsC+hXz3lxzPtFmXBdMqWebS/ZxZUjGYmsBt4C0VWXWeX8\r\n6XuJg6CH/nv0DyikxjF651SjIFB/0N2iVaAqs8Ay4Ud/ArT6iLkyEAV/ET4n\r\n/Q1+ZWWkwz0wxLRuBjihqi3SKNunL+6ezbXwFatYdq/ygmy+/dUlTmKtgcFq\r\nKTR1jeMroyLN9pGf8+mJsTB306yrIAk46ze3WafprbmYG4l9BEBRUUkB6xef\r\ndGXErG/G1RQGw+9s/Y7xIf1TIu4nFx7t8gRbFhV/tRvPrBt8YYZVBl0GZh67\r\n3NhpAkjXrZCpyghblRO7gi3VvVFmO7GEzEvAVnFYk4AUoUNPNz5naS1WqSML\r\nWbgYybUR91xQE/JqzOafGzvPuqv/yb3DGE2iQ7vHOA7Swj0BVedRtqnH1R78\r\nRwVmeuyBCXYkJ+mdMnAkc5kQfZDb0aDJ5K1D/oCrNScuwd+iWKdSLeVMnM8D\r\ndDY3Y982X4jRpt8dEnvGf2101OH+QKr+9lXC+lbUubMjwsYCmVPtG8+lfMIM\r\nT1vGqcL11VhfHPF4KcznHiEuFN2X1AL68HDQfKkE5TdYoXfFuNxiL3e3gGlQ\r\nGO9SJlCaHa5imMO39/TC5CHFZ911s4Iwdc19mUuN+fbZYwh6rC99+qdaIrty\r\nUjgH2s0KCYwmuowcyFR5kL4/psqDT99O/RrxiIsjeWwuWzDtApsTTcXkXzmH\r\nWU018TVhUNHT5Cl3f7kHueMFMB7jZ9ntqd6as/nzoo+XTqsxUbwJRsb2tTU1\r\nsumYaceENzzapeUMkwzvXT0xekPOf5t2iOepscMddBTuZ4q76qlBY+WQ1iHs\r\nBJVhxOZXkUiSu/4e8HmJfP6HmDx81Jz8O4XTaHUQZ8/7k5VcvfCNzHGsekm/\r\nBmbycmnfEg40QGPi1l9KUnz4AoDtQ4bl9VW6T6Euy+j6gJ6FDlFxNUTcHOe8\r\nS89pmiQHEMuY8OHqv2pTxAnnaAd6Dq+tI+UsJ8EcdBUf/fGoE2uQfQ30Hh5U\r\n19qXWnqDWUbqDhVojPBLDeajXBk/fGkXMZp+Kwh8iC44ttUApleVO41p/sDo\r\nnOKOnJnyTDqmsb+IcZvEvIdYmn+S4OaZBZUANxx+q/hzQJsIzpi7ApuX8VfH\r\nMOIbgu5B0BGBqdQgPK5OtQgIWprOHCJMEhravBaR5cN3ajLDV+U7YtyIjkwn\r\nGQRjZ6iIyFaBojCBtljtE1Mm/cXuqCYhRt+6TCP7gH/eM/I4Ta+ibBVvDjsl\r\nr1IV5AGypmyAbHFyuG8CiczZMwhhYl2FtCTeJgwpewudeHgGhMTIMh2pBLJY\r\nahVHxt9mlvOtzoYqilLl49bXufQdnrVYBqHOvswp+4zVge26aAinYuUhYAK3\r\nmSJHhm/Kd/tgzizJPI5MCw9QfAv70eERPjFsWqO2fGeszr4=\r\n=/oK6\r\n-----END PGP MESSAGE-----\r\n"
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
   * @param {string} userId The user Id
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findByUser(userId) {
    // @todo @debug @mock for account-recovery
    if (typeof jest === 'undefined') {
      return [{
        "id": userId,
        "user_id": "d4c0e643-3967-443b-93b3-102d902c4511",
        "armored_key": "-----BEGIN PGP MESSAGE-----\r\nVersion: OpenPGP.js v4.6.2\r\nComment: https:\/\/openpgpjs.org\r\n\r\nwcFMAxYTR81eetNbAQ\/\/TEWCA7W1kx7IzcZi4nmT92IZbdpzCBSQt5htSCoJ\r\nFfzGd27yeDT2GoEtmxmkG+gEak8ci0Jxa9FECaYDBzG4ixEDfDMfWqw\/WK2w\r\nj04oja+0qCAimV2nyItSYoaK5aZj8vL97V6U\/7YcraC9QTNY1Kd8RDPeL32D\r\nO2dpquPDLx5uMAmMoSZWruNCGqqJPjxMcxc2PBco+GJMcaGcYa5Y3+YueNpZ\r\nIIS0PbMpgiJlVvYzZywYC5lkIKFadVeV6MNkMmJfWB4VHq2Hoo3poZVP1rZV\r\n6cU7a7UuG4W3UUmezxQGQ6WAjh+qzkQHXrwI3cgU14du9sTCh8occwcPhG1C\r\nj8ljcTJqexQxA91TSj2UqhAnyB9yzZRcoh38bj\/OyGQmtiwxEFIzUymSi2pt\r\nysjJOZ7lB1Oh2l4vbgxJoNxtgvzY+3dsNXL510x793Hev3X2YcbO\/TJoy6G9\r\n89cuocJ1dlLIHqrfri43y1V0ZTfoa\/vigma4Qa5kUtB1tN0j38z+6tcjiz\/s\r\n8RJmXUK2bfHhvEbuc\/YnDDltpiZHc3QUtbj5TV2m+fO0ad2jVqxsi4eZid\/V\r\n\/WDUrAxRzY7xNRTRQQDbnT831NZeZbYobCpfPqU8ylF9iv\/V4lsyNYFrU0ne\r\n37JRFzl3cOY+jlqxGHaAF9\/mC3b3D3DmlZ+kOOQ7lE\/SwaoBAuDaJRsKzNqj\r\nTz8UFif5iwrEQY5BNzYd+zwGVzMlVP\/RNXR2YlAHx5lPMylgI73RDMoMZ4RT\r\nb7AQB9DqgobZI3dh3B90XqjkRiy3VJ\/nMhwknaZc6onJQgl2O\/ULie9kh69U\r\n1ojIkN+SHFCl42T1iT2eN08QUPffDVTMvT103WlX+MW8FV6CmF+TcDRUexs3\r\nT\/2EvFlxP6QTG41vLk4Sm3xce7rEZHiJ9hRrF26xVfT5jM+7z149lP5J8mgA\r\nARSBj2jlO7P1afQX+5RyYR+guD9LN95qMsNJwukTCzIo1AhE7yywf7b8v3a6\r\nXyanZo+TbDqxnJlozEMsdyGBwBn7UX6Erv072cZadO\/ZG2RBkbgiBGZ5hAjg\r\nPqwRAkfzDNa4WhsE9Crqs5ROy6IsDBGuAa8\/as0oCzIV+Ou4BPzKHfQDQS6U\r\nT0R+48sVAZAYY7TqaNHvf+3nlqMyssaK0SPm2fg3DZXPM2pcDatCFb4gVElC\r\n1qbG8pRIBmS\/NYr8m7IBnazDs9L6lYAjybuHes6cPqasDmHKha6DKl1P6jX+\r\nEeDxA0AVL4rZdUCt1fpEcFR\/R\/o4uDDLO8NGiHwM3MnbNI8G0SQy8q\/NhI11\r\nzWXyDeAR6hHKYC4h6WCCTFxe364PWLjQ5PGOLeAfeWEPCDZmP6U99kwoiOUu\r\ni8UuoIAFon3lIOXZnJ3ZtAcQ5UJ3gNcJH1EImZFdYtRgLo3GOPjBcNqGbmCu\r\n4xo+yMGy9Y8YJZM9HakKAChmHf01J3DAwNfUm8Rhx5w+NBQRm0aJ319wsACH\r\nlLEYvv+bVfPkNTvW\/vWND9eOPGI0Q8o=\r\n=AOt0\r\n-----END PGP MESSAGE-----\r\n",
        "fingerprint": "0C1D1761110D1E33C9006D1A5B1B332ED06426D3",
        "authentication_token_id": "d4c0e643-3967-443b-93b3-102d902c4512",
        "status": "pending",
        "created": "2020-05-04T20:31:45+00:00",
        "modified": "2020-05-04T20:31:45+00:00",
        "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
      }];
    }

    const urlOptions = {user_id: userId};
    const response = await this.apiClient.findAll(urlOptions);
    return response.body;
  }

  /**
   * Create an account recovery request.
   * @param {Object} accountRecoveryRequestDto The request dto
   * @returns {Promise<object>} response
   * @throws {Error} if options are invalid or API error
   */
  async create(accountRecoveryRequestDto) {
    const response = this.apiClient.create(accountRecoveryRequestDto);
    return response.body;
  }
}

exports.AccountRecoveryRequestService = AccountRecoveryRequestService;
