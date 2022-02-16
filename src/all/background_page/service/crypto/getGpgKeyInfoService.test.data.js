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
 * @since         3.6.0
 */

const validKeyDto = {
  "armored_key": "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nVersion: OpenPGP.js v4.10.9\r\nComment: https://openpgpjs.org\r\n\r\n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\r\nS+E=\r\n=cqUt\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n",
  "key_id": "5d9b054f",
  "user_ids": [{
    email: "ada@passbolt.com",
    name: "Ada Lovelace"
  }],
  "fingerprint": "03f60e958f4cb29723acdf761353b5b15d9b054f",
  "expires": "Never",
  "created": "2015-08-09T12:48:31.000Z",
  "algorithm": "RSA",
  "length": 4096,
  "curve": null,
  "private": false,
  "revoked": false
};

const expiredKeyDto = {
  "armored_key": "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nVersion: OpenPGP.js v4.10.9\r\nComment: https:\/\/openpgpjs.org\r\n\r\nxsBNBEs9LUEBCAC9Bof7j0yScVLK2zII0HNXxiwJmIzzR6bJC69GeEJWj+6O\r\nlL1v+kDt63WN4w1BHezykZtzMsKbpE\/Mdq6hGTQyv6haX\/SIfrtlCQgTM1A+\r\nn8vvnDZgoaDBCZCQi\/5ccTijf10KORHrUgByBb3ChXBobTqajE\/bu7iPrT\/a\r\nYu4scasnn3V8o2Oht5fRfoad2eqdgFD+ESVSxDX0ERe4Y9nFWb1tdFqPra+R\r\nU1tMAKKzp0qCFZZnwNs42m7ihdZDFArrVoTykT1sBKPTN4xNi82TiV6jtiii\r\nZLVFC2u+czQcHOVtSOdCSqYUOBwubNG+PDNyJ0J6jNgZuwkzgnNi7G\/xABEB\r\nAAHNTGV4cGlyZWQga2V5IChUaGlzIGlzIGFuIGV4cGlyZWQga2V5IGZvciB0\r\nZXN0IHB1cnBvc2UpIDxleHBpcmVkQHBhc3Nib2x0LmNvbT7CwKsEEwEIAD4W\r\nIQRd2JOcNL2u76CxcylKH4mS1\/OTVwUCSz0tQQIbAwUJAAFRgAULCQgHAgYV\r\nCgkICwIEFgIDAQIeAQIXgAAhCRBKH4mS1\/OTVxYhBF3Yk5w0va7voLFzKUof\r\niZLX85NXG9kH\/3VtqVvJmEj2MBNDtW5iU0ipQWhZcEEH0x3qw9epgrTTxdh4\r\nyGhY5KHmwFf6s+XX0uNCla4U\/p+jN79npgUI7uazQtSGxpmaIGW3aP1F\/ACU\r\n2b09\/iwrvJtrWlCHgiAWwwJpxQGOHthknPjr9QeaCcXARd2x45MBR0+bLCjA\r\nB95vD9lv4v+LvUtECYMgmc3hkTCzZdSdPjnyP2Bjt1NvTuyii9lZfMgV8LCU\r\nH7Cur2j3DUM0tWpInU5iIBzaDuMX8VTF8EMn1dIkXBy+8kt6nOkInazgiUp0\r\nTQ2GBOat2R1o+LcN06RoQT4odyYpb8y98LPRBKccaqpIlI+iWfgaolPOwE0E\r\nSz0tQQEIAL5XAv\/YAlFnVBZ4d41M9+4Eb9BZrP3h5aYnYUacsP7ron6fzTg1\r\noz6JjQf74+rpiEUoxBHeIpqxb7K4xV0fUwACAe41974oTCeJUpnjNiZL+wuz\r\nDV1etZimZbKKhsbRKfMf4QUf23wRS0DkayqSlnUhSrFeVNDUoQQxfHYO\/+nJ\r\ns+71\/T5I9mLRyHEYLrOsHNwXRPwgQDBjTlTQk6\/+\/2WFZ47aO4LXIW8wFGtg\r\n50kbbuNEzU3lR9G4vGviCZCvu7+UzZU3yT429CdIAhWPjyqVZGqWTO9aKsrZ\r\nriWKO8oYcSETFlXU5YMfRgiBjfHWJ\/F1Z0Hk855p6QE+vPlH44kAEQEAAcLA\r\nkwQYAQgAJhYhBF3Yk5w0va7voLFzKUofiZLX85NXBQJLPS1BAhsMBQkAAVGA\r\nACEJEEofiZLX85NXFiEEXdiTnDS9ru+gsXMpSh+Jktfzk1eOgQf\/fwPYxqg7\r\ngfoz5xlllFnX81IeT9REKYKVRE8W9stfXsoLGzbLo7U2AETNwsXRPh7O0kJn\r\nG03apvwScEhOwXfVx9VdXqtfenq8I0nOGpt\/SmqaNA4vHBP\/ujBVef9eVaiv\r\nipQi8P\/XNFIXRaeMt3x0SzDGxptj0BLJPa0Ygi3AmRwLgmDZ62Dw3pB9p3Bq\r\nPORyRa346UM+9YjCKEuUuoYNtLJu6FYbMfnHT68X4j2dC2G73RRucKhw6Piy\r\n2qQd70moquGzQ0vWmUk7A2HKKRvWzShIrXjIT0AIyQFIgE2pYzUkbECBdWu5\r\nvkWbjmViJmvpsLNanSVQ87vZjEggu0wa0w==\r\n=qb7f\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n",
  "key_id": "d7f39357",
  "user_ids": [{
    email: "expired@passbolt.com",
    name: "expired key (This is an expired key for test purpose)"
  }],
  "fingerprint": "5dd8939c34bdaeefa0b173294a1f8992d7f39357",
  "expires": "2010-01-01T23:01:21.000Z",
  "created": "2009-12-31T23:01:21.000Z",
  "algorithm": "RSA",
  "length": 2048,
  "curve": null,
  "private": false,
  "revoked": false
};

const revokedKeyDto = {
  "armored_key": "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nVersion: OpenPGP.js v4.10.9\r\nComment: https:\/\/openpgpjs.org\r\n\r\nxsBNBGIL068BCACakIxe1peyDh2hwSB7klFegt4EuU+z1SOLUYcRfNemRQ5F\r\nUEvZRMEIpp2QdM\/w9tn35cS9e+oml\/jEM69l5caqD\/CsEyT32XGIx0znm3Wr\r\ndXNZ2VoMhejY8QzMQZ6YK9bLPfjGSENTgOOLD6owEgKg7Y7VTacnA6zzyAYW\r\nnEcGcqAqhTwa7bL\/g7rSiwa1z8\/5kvgJzbcPKux+X8Dup9Ro6iSTSX61X5N6\r\nzrN4BY3DfhipXmB78X3VwuTQYogO22i+Ix90iZJjwjkaeYuw9iYiQHAYTwID\r\ny4yF09cUs5+wtwnhJ0+Aw0m51b+K\/1kQpZ1hWvHzCL+Gk2zErg+AdIPDABEB\r\nAAHCwI0EIAEIACAWIQQa187XdB\/7ycVGpCdgQ57ft3rkdgUCYgvTwgIdAAAh\r\nCRBgQ57ft3rkdhYhBBrXztd0H\/vJxUakJ2BDnt+3euR2pssH+wflfp98CMhG\r\nkalO8LEZkbhMCBQZ8+d5JBVh2Hm8XxG3ddl\/Vmf5fiRXC9SI4v9rH4RVQce1\r\nG0pnk1D0Nx7RtX76PGuQxZ4rCy\/3xVgDoY5wX81JkY1zY8KSy1gtThELmkUo\r\nKf95S+knqKIMEfySpMoEbuFpnog2L5g7R856nshyqhWHGsu+zB+qvUkDpg+t\r\nQrhsB3thMInmlgBh7Db2Or0dYGTTGK9G4wSRR7YPAIAH9G7Mn09ToyBUmmDj\r\nLEhq+OkTemq3\/5rETgDCRlBRWZ9fIjZAv3xjEZi7t4UI5tWb\/ObI1t1WyXij\r\nu2XGKG30c0R5U\/uhNevpUKbFlf3FcWrNIlJldm9rZWQga2V5IDxyZXZva2Vk\r\nQHBhc3Nib2x0LmNvbT7CwKUEEwEIADgWIQQa187XdB\/7ycVGpCdgQ57ft3rk\r\ndgUCYgvTrwIbAwULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAhCRBgQ57ft3rk\r\ndhYhBBrXztd0H\/vJxUakJ2BDnt+3euR2srUH\/jpNC5rsQFBX8g+WD2qYGVwG\r\n\/hUiB+tRhGla8zIwJSsJNr21BR6+orcNUt0pUphDj6eTmaFtqZEKUdhKzGoV\r\nWO57EJUPekjeXqBXRkcI+EOE7eBehfUuCbh7Gx290jnXSTSJUvP83R8q6BOi\r\nyDd0hZoTSXZ9GaYHf5p0J0E5mGD3Fy9g4YmnwOYJFKQN6KHUTkWSxjCI4DTC\r\nqPJZEs58O2iypKrH6AuFU5oTLVAf94GLvfXxJDG9A0Sq8LKY+PwhxNneCND8\r\nV0qb41vMVf0dS4TyNJFnBh9bsEtpNAc1GVOqPdV2LaxPffdjz6iQFXXBJ1\/R\r\ndim3LPd12DU9yGj3hTnOwE0EYgvTrwEIALITlk5b35vOmFwZkNUZ8JbSrcW\/\r\nsFwVjLzs4vPvalMqVzR9Sd4KA0kXVXkdq8k5GwGbceQ5etKGvzaI4kp44eR7\r\nc5qO1hbDi3hUFkJgvXwl5i3R2R3Iei8fjvx7VISjgzf6woQ1HYy11FdcGoBE\r\nSOErzvN2m2ZN7tRJuDTrjrgxW23rutlfnTRDBUFHxz\/zX0rxyLeQoT73BmdC\r\nXXLrLzX3UGc3NIb9F7b71EzQWjaxRBaMFkZbV5q70+1XWAAfl9IrdyByKpZk\r\nQn4jLu19\/0rc+tDo36TXexrZeAl2lERdYw2hmTjFAESq3ApPaP1yiv+3kOfo\r\nnzsTnYiMHv8J9isAEQEAAcLAjQQYAQgAIBYhBBrXztd0H\/vJxUakJ2BDnt+3\r\neuR2BQJiC9OvAhsMACEJEGBDnt+3euR2FiEEGtfO13Qf+8nFRqQnYEOe37d6\r\n5HZopAf9EMOrLGqFcKL4JMFw7eq9mtO5MgOfUUfKDyeo00WRxYcrPQ0xUCQC\r\nCYfvp9vLRMaDap5c8MqcZlR9QZceixZmKZkRiLvOmHKeYpo08AXTX4dxUZWV\r\nIY93W95jnvV9gyVqgvpOSC9YN5j2VAQoDkQ\/OJSKc9K60RidIgMz2WJdTmtE\r\nTlPvNswFTIw0FvTUplUFMokfGp1MyL5xyaKNaqz5uD5JIeQQCxrRC66E1XiA\r\nLQb52ZMgECwKyDjjQB85Rz1FPiGitDFFJbtX0TPEiCvvhaiWFGxhzOTh5ZBo\r\nWZIpQaAk11CxELFmamKuQU5F+4SVGQ6kWc1GLSJCgLNF6B0YPA==\r\n=mUcJ\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n",
  "key_id": "b77ae476",
  "user_ids": [{
    email: "revoked@passbolt.com",
    name: "Revoked key"
  }],
  "fingerprint": "1ad7ced7741ffbc9c546a42760439edfb77ae476",
  "created": "2022-02-15T16:24:15.000Z",
  "expires": "Never",
  "algorithm": "RSA",
  "length": 2048,
  "curve": null,
  "private": false,
  "revoked": true
};

const validKeyWithExpirationDateDto = {
  "armored_key": "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nVersion: OpenPGP.js v4.10.9\r\nComment: https:\/\/openpgpjs.org\r\n\r\nxsBNBGIL2NEBCADFx0cnRRpRIdGk\/D8\/37O8FBniKPXMajj7ZfiWj0UzyyqQ\r\n5Kp8PMntCpgOmKu3a8fZ4nOevywuJQWEZtEUanJFwZAkto6Iy7uNeAydZ5Y0\r\nqfP+wQHrqAjQILQiB47bsLcFJXe+p8cUBsRy3zg\/ZE8LMiWKp9sYSNLGTh49\r\nrQ0nX9TC9AgvDd0njO85NJ++ISTSG8GjSOs0O8c+cxwL6lXaHjO8hx4mY9sl\r\nzcjaRRAz7oMV8\/5hKjgdPx9FsRfS7+1pb6AaZ\/RWb07QtTwkUitUAJhw42u3\r\nARcg9lIBpIL17Ld7uoy6vgYM1o5V+xQwSLq801sG1714Rs9cXk+u64mLABEB\r\nAAHNMkxvbmcgZHVyYXRpb24ga2V5IDxsb25nLWR1cmF0aW9uLWtleUBwYXNz\r\nYm9sdC5jb20+wsCrBBMBCAA+FiEEUR3nUU8ouNre1g\/aziGgUUaYPWsFAmIL\r\n2NECGwMFCV38DwAFCwkIBwIGFQoJCAsCBBYCAwECHgECF4AAIQkQziGgUUaY\r\nPWsWIQRRHedRTyi42t7WD9rOIaBRRpg9a5Z7B\/wO7SHBNMamUDxERerx1\/Rq\r\n2LTnnHMNQv0bspyEyILsIf3MBz+Nw5WtrDZ4rJ3uLsU05HdA3n6ds4bsqJwj\r\nECKdPe7cmUww8qmnwJhQaWhZfaf9j3F9V5eM9Z46YzZwz5DXmFHCRFMw+P5q\r\nPGuw\/WtR5MEvIR7CMdn0RDALm5MqJxdlY4CN00tw9ar27WhMaAYIe7nu8ERZ\r\nRQv2pCuqJUvrv7IhwzS+5YXP1d3xGsEaoP8KzgalHIyct2KmnZxOLU\/9Q783\r\nMN3G444T6asDfpOXasIQaApBSrzjnQYuL2KY0k+LOddV0QThoQtbnsVanREo\r\nZ8yfo\/cL\/oUO2L5STP0gzsBNBGIL2NEBCADSa5A2uxXt7BZZblbn8U5tQF3C\r\n03QS0eQee\/5EsM3XYjdT1maPovrbsUjUL9kkRAEtOxN6tsfOXAsNVXg2THi4\r\nOuZBcexrBejh3bz+hpYPTBvhYAQAT01irTYZB2S8t0QfEtYtIXOE8tG+II65\r\ncSEDVLLdo1vLR2wAm9fqyxFzR24vWWsYJrX7112RZMtp4MIgeVU+USR1cFbU\r\nkZkd0BPzwZ0i4V2MliAhTnSdWRy5luy1NRLXAfLFVd4FdM24bQZdU8S5JNVN\r\nCWS72sslrkmuKmdpZTtFZ3\/F\/0o3hXEs59U0emo+DzBAiqgHofGzqfeAiHeD\r\npjRX7nK5ei\/Lv+bHABEBAAHCwJMEGAEIACYWIQRRHedRTyi42t7WD9rOIaBR\r\nRpg9awUCYgvY0QIbDAUJXfwPAAAhCRDOIaBRRpg9axYhBFEd51FPKLja3tYP\r\n2s4hoFFGmD1rxRcIAJri7boulq+SQLC1OpDQexYqn+GepZFkA9w+5A7YEkDd\r\nEMptw0EGJlWKC8nAbmDQe\/Zlx6VfsvLaIoxslK9DqJmHmDVHE0ldl0wYiKlg\r\nEdLR2JO8V2HvlkyZVYVkYeQvTvS\/3PbRLgLXMf29F8om5rBMTxEMUAvB7knd\r\n1cdtjNqugtglRtD6A2ZQVyDwY5MIZHzdbst7ZFkZH923iy1\/5Pu1zR\/B3ImW\r\n9JYpy9eryOgzJXHKuc\/PQksrkbZvMn\/UdhqcFPgraO8QfT5mK9OcO1oVtmzv\r\nDclw9QNwdclvraSLQatN4tMqr\/2+ioaDjH5NJNSQYJO9NWAHTXz+wrWi\/O4=\r\n=dCaT\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n",
  "key_id": "46983d6b",
  "user_ids": [{
    email: "long-duration-key@passbolt.com",
    name: "Long duration key"
  }],
  "fingerprint": "511de7514f28b8daded60fdace21a05146983d6b",
  "expires": "2072-02-03T16:46:09.000Z",
  "created": "2022-02-15T16:46:09.000Z",
  "algorithm": "RSA",
  "length": 2048,
  "curve": null,
  "private": false,
  "revoked": false
};

exports.keyInfoDtos = {
  validKeyDto: validKeyDto,
  expiredKeyDto: expiredKeyDto,
  revokedKeyDto: revokedKeyDto,
  validKeyWithExpirationDateDto: validKeyWithExpirationDateDto
};
