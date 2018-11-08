/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
var Keyring = require('../../../../src/all/background_page/model/keyring').Keyring;
var keyring = new Keyring();

describe("Keyring", () => {

  describe("generateKeyPair() ", () => {
    it('generates gpg key pair', () => {
      const data = [
        {
          ownerName: 'Ada Lovelace',
          ownerEmail: 'ada@passbolt.com',
          comment: 'The world\'s first computer programmer',
          length: '2048',
          algorithm: 'RSA-DSA'
        },
        {
          ownerName: '傅 苹',
          ownerEmail: 'ping.fu@passbolt.com',
          comment: '是一家设计和制造3D软件技术的软件开发公司杰魔公司的联合创始人和CEO',
          length: '2048',
          algorithm: 'RSA-DSA'
        },
        {
          ownerName: 'Borka Jerman Blažič',
          ownerEmail: 'borka@passbolt.com',
          comment: 'Borka Jerman Blažič je leta 1970 diplomirala iz inženirske tehnologije na Tehnološko-metalurški fakulteti.',
          length: '2048',
          algorithm: 'RSA-DSA'
        },
        {
          ownerName: 'Aurore Avarguès-Weber',
          ownerEmail: 'aurore@passbolt.com',
          comment: 'Borka Jerman Blažič je leta 1970 diplomirala iz inženirske tehnologije na Tehnološko-metalurški fakulteti.',
          length: '2048',
          algorithm: 'RSA-DSA'
        }
      ];

      return data.reduce((promise, item) =>
        promise.then(result => {
          if (result != 'init') {
            return keyring.keyInfo(result.key.privateKeyArmored)
              .then(keyInfo => {
                expect(keyInfo.userIds[0].name).to.be.equal(result.item.ownerName);
                expect(keyInfo.userIds[0].email).to.be.equal(result.item.ownerEmail);
                return keyring.generateKeyPair(item, item.ownerEmail).then(key => {return {key, item}});
              })
          }
          return keyring.generateKeyPair(item, item.ownerEmail).then(key => {return {key, item}});
        }), Promise.resolve('init'));
    }).timeout(200000);
  });
});
