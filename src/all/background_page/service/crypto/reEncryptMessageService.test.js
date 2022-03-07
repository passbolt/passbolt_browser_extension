/**
 * @jest-environment node
 */
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
import {ReEncryptMessageService} from './reEncryptMessageService';
import {pgpKeys} from '../../../tests/fixtures/pgpKeys/keys';
import {DecryptPrivateKeyService} from './decryptPrivateKeyService';
import {PrivateGpgkeyEntity} from '../../model/entity/gpgkey/privateGpgkeyEntity';
import {DecryptMessageService} from './decryptMessageService';

beforeEach(() => {
  jest.resetModules();
});

async function getDecryptedKey(armored_key, passphrase) {
  const entity = new PrivateGpgkeyEntity({armored_key: armored_key, passphrase: passphrase});
  return DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(entity);
}

describe("ReEncryptMessage service", () => {
  it('should reencrypt a given message with a new key', async() => {
    const cleartextMessage = 'user1password';
    //clear text: 'user1password' (encrypted with betty's key and signed with ada's key)
    const encryptedMessage = "-----BEGIN PGP MESSAGE-----\n\nhQIMAw0P12ReHhxtAQ\/\/ZJv0fAfw5peXWl5CiTjHpVIdkfBP89lPAH3Fsndl2BD5\nU\/M8X02wZNEKyMf2NglGM8p0\/MuhNK+L6L4HMXLjQW96B+qfsFYAALo6NUTUyiaV\nNClT\/FS20oFDWC9jU9pQNftpITHoXi09uGRN\/u0Mo+ZnpUbCaNvkQ9QeMmZyu\/lw\ntiBRDtRDmi2dJNix54cVlSif9A4fj3aKmOwdriBG3n2JdKBA5oFQ\/QWMo6NOOYGB\nehnF8kDJ7CJUcaQ\/lzOz\/d71MFZSg6gvg3OEUUMgE\/MeC2MjMtpE4tcqJ+mhTHw3\nn\/hzU06BD0te+rV+9A0ivwiPosqdvUKp4v9zbYiQcroHMPN7IAIT+vmXNrJEeAE4\nq08ty9znRbCTUN1pSFEpIke7aej+ZNhXDWh6q4DYUyY6eEcAR9WrppmQEfpAxXnk\nHm5ovzIvv07wZkjo8bdUIDwcQmeoOSKh2GNx3KcgjYcD2Vr46o73D\/hBTFC\/3J32\nc3H1CMcp4FDynAEmN3fYQygTEzpM\/\/FAdnypzTvoNgGh3CoxmYJ2vysPvoCxqF7A\n8UuqEfv7Tl9m9Is+bNSWvz5qClCGjfWbt1OxVYb\/\/i4FGPj708zVM+ARU4OjGDao\nlfxg420v6kDK1+AmaH7jGbzhcg4DsWSPKidZlDreDu1\/DaAOsHBAHX9mqUHLWcDS\n6QG1kHRGFzRdMtunHonmP9Zf2sUizKCPb5BDtws6V8VcZMG8J8a7hSou\/r2Cj4UX\nE6Z22neSosJ9M+ZovGXsNsoZTem5KAFOGnPN+jO1pcbdBe8sMTfwVd8qsjEwS5M7\nPzhzy2jQu+yTBn+hDoarK5Qci71zpbj\/j\/CTpdru4b1PDX0jRJhCfkJJIBHXCJPh\nKhnfhZU1N0gg3ONPyeItihRO\/iz5M5qJDHwne2+n+NqU+x9VsBvCZ1zWPeh9gbyp\nnTLolOzQepyEzGbBmKyx3nH60VcoGS225H471gmulZxh9qvc7gXPpT+ZEA2sKFlD\nzmaKA5KEFiE+fiRKVg8LlLI5Pmv\/fU3UcYbe9iRXjpe8YyHVcrWh5sf\/vOAT+8uB\nsHBzE40bLb+cuFt+EQ\/QWKgrVPmEbi17tXem8YUFUuJasxTFZlXM0Mi\/TXIqybNL\nmv8iKubmYCyC4BFvuermzcACyo1gsilmxnu9V9WOEO6aECjI7LZCQuSG\/XFkc5Mj\nmA2tlXJxSQ59fg6IBYm+lDUqSGZTYGcU11CBN0ZkVHKh815zphBQeuI+PydfeO0Y\nuJBg+0o1jvw2EqL6Cvn79aXpcUp8Y+9\/ht+MwTI3TsKqLVaeUv5J8zf3FWfC2A0E\nou\/FrH\/n4cYMPAPBglk4TJbU74SvKIjTLYiVyyooY7ztoheyK7m1ZlxhCrfzhrv3\nbdgUOfyjci5l4SOL92YutX1HDZK2FOq+TXOGNEfMUOA9B\/XBieKTiYxAfa8Bzt5W\nf7h6F\/yQQQBZjtOSvDhQa\/mKWgKCg7rncdmTRFPpS7sFSRnLbapEVk\/2NTGLZFuO\nAzLVD2e3pfwJvIiCMTsJTicAkt6\/qhrByACgQGTSs9FJO5lCXWwC\/jCa4uRpj4uR\nc9rmiQ==\n=oVjQ\n-----END PGP MESSAGE-----";

    const currentDecryptionKey = await getDecryptedKey(pgpKeys.betty.private, "betty@passbolt.com");
    const signinKey = await getDecryptedKey(pgpKeys.ada.private, "ada@passbolt.com");
    const newEncryptionKey = pgpKeys.admin.public;
    const resultingMessage = await ReEncryptMessageService.reEncrypt(encryptedMessage, newEncryptionKey, currentDecryptionKey, signinKey);

    const newDecryptionKey = await getDecryptedKey(pgpKeys.admin.private, "admin@passbolt.com");
    const decryptedMessage = await DecryptMessageService.decrypt(resultingMessage, newDecryptionKey, signinKey);

    expect(decryptedMessage).toBe(cleartextMessage);
  });
});
