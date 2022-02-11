
/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.5.0
 */

/**
 * Unit tests on ConfirmSaveAccountRecoverySettings in regard of specifications
 */


window.Validator = require('validator');
window.openpgp = require('openpgp/dist/openpgp');
import textEncoding from 'text-encoding-utf-8';
import {ReEncryptMessageService} from './reEncryptMessageService';
import {pgpKeys} from '../../../tests/fixtures/pgpKeys/keys';
import {DecryptPrivateKeyService} from './decryptPrivateKeyService';
import {PrivateGpgkeyEntity} from '../../model/entity/gpgkey/privateGpgkeyEntity';
import {DecryptMessageService} from './decryptMessageService';

global.TextEncoder = textEncoding.TextEncoder;

beforeEach(() => {
  jest.resetModules();
});

async function getDecryptedKey(armored_key, passphrase) {
  const entity = new PrivateGpgkeyEntity({armored_key: armored_key, passphrase: passphrase});
  return (await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(entity)).armoredKey;
}

describe("ReEncryptMessage service", () => {
  it('should reencrypt a given message with a new key', async() => {
    const clearTextMessage = 'user1password';
    //clear text: 'user1password' (encrypted with betty's key and signed with ada's key)
    const encryptedMessage = "-----BEGIN PGP MESSAGE-----\r\n\r\nhQIMAw0P12ReHhxtAQ\/\/ZJv0fAfw5peXWl5CiTjHpVIdkfBP89lPAH3Fsndl2BD5\r\nU\/M8X02wZNEKyMf2NglGM8p0\/MuhNK+L6L4HMXLjQW96B+qfsFYAALo6NUTUyiaV\r\nNClT\/FS20oFDWC9jU9pQNftpITHoXi09uGRN\/u0Mo+ZnpUbCaNvkQ9QeMmZyu\/lw\r\ntiBRDtRDmi2dJNix54cVlSif9A4fj3aKmOwdriBG3n2JdKBA5oFQ\/QWMo6NOOYGB\r\nehnF8kDJ7CJUcaQ\/lzOz\/d71MFZSg6gvg3OEUUMgE\/MeC2MjMtpE4tcqJ+mhTHw3\r\nn\/hzU06BD0te+rV+9A0ivwiPosqdvUKp4v9zbYiQcroHMPN7IAIT+vmXNrJEeAE4\r\nq08ty9znRbCTUN1pSFEpIke7aej+ZNhXDWh6q4DYUyY6eEcAR9WrppmQEfpAxXnk\r\nHm5ovzIvv07wZkjo8bdUIDwcQmeoOSKh2GNx3KcgjYcD2Vr46o73D\/hBTFC\/3J32\r\nc3H1CMcp4FDynAEmN3fYQygTEzpM\/\/FAdnypzTvoNgGh3CoxmYJ2vysPvoCxqF7A\r\n8UuqEfv7Tl9m9Is+bNSWvz5qClCGjfWbt1OxVYb\/\/i4FGPj708zVM+ARU4OjGDao\r\nlfxg420v6kDK1+AmaH7jGbzhcg4DsWSPKidZlDreDu1\/DaAOsHBAHX9mqUHLWcDS\r\n6QG1kHRGFzRdMtunHonmP9Zf2sUizKCPb5BDtws6V8VcZMG8J8a7hSou\/r2Cj4UX\r\nE6Z22neSosJ9M+ZovGXsNsoZTem5KAFOGnPN+jO1pcbdBe8sMTfwVd8qsjEwS5M7\r\nPzhzy2jQu+yTBn+hDoarK5Qci71zpbj\/j\/CTpdru4b1PDX0jRJhCfkJJIBHXCJPh\r\nKhnfhZU1N0gg3ONPyeItihRO\/iz5M5qJDHwne2+n+NqU+x9VsBvCZ1zWPeh9gbyp\r\nnTLolOzQepyEzGbBmKyx3nH60VcoGS225H471gmulZxh9qvc7gXPpT+ZEA2sKFlD\r\nzmaKA5KEFiE+fiRKVg8LlLI5Pmv\/fU3UcYbe9iRXjpe8YyHVcrWh5sf\/vOAT+8uB\r\nsHBzE40bLb+cuFt+EQ\/QWKgrVPmEbi17tXem8YUFUuJasxTFZlXM0Mi\/TXIqybNL\r\nmv8iKubmYCyC4BFvuermzcACyo1gsilmxnu9V9WOEO6aECjI7LZCQuSG\/XFkc5Mj\r\nmA2tlXJxSQ59fg6IBYm+lDUqSGZTYGcU11CBN0ZkVHKh815zphBQeuI+PydfeO0Y\r\nuJBg+0o1jvw2EqL6Cvn79aXpcUp8Y+9\/ht+MwTI3TsKqLVaeUv5J8zf3FWfC2A0E\r\nou\/FrH\/n4cYMPAPBglk4TJbU74SvKIjTLYiVyyooY7ztoheyK7m1ZlxhCrfzhrv3\r\nbdgUOfyjci5l4SOL92YutX1HDZK2FOq+TXOGNEfMUOA9B\/XBieKTiYxAfa8Bzt5W\r\nf7h6F\/yQQQBZjtOSvDhQa\/mKWgKCg7rncdmTRFPpS7sFSRnLbapEVk\/2NTGLZFuO\r\nAzLVD2e3pfwJvIiCMTsJTicAkt6\/qhrByACgQGTSs9FJO5lCXWwC\/jCa4uRpj4uR\r\nc9rmiQ==\r\n=oVjQ\r\n-----END PGP MESSAGE-----";

    const currentDecryptionKey = await getDecryptedKey(pgpKeys.betty.private, "betty@passbolt.com");
    const signinKey = await getDecryptedKey(pgpKeys.ada.private, "ada@passbolt.com");
    const newEncryptionKey = pgpKeys.admin.public;
    const resultingMessage = await ReEncryptMessageService.reEncrypt(encryptedMessage, newEncryptionKey, currentDecryptionKey, signinKey);

    const newDecryptionKey = await getDecryptedKey(pgpKeys.admin.private, "admin@passbolt.com");
    const decryptedMessage = await DecryptMessageService.decrypt(resultingMessage.data, newDecryptionKey, signinKey);

    expect(decryptedMessage.data).toBe(clearTextMessage);
  });
});
