import {OpenpgpAssertion} from "../../../background_page/utils/openpgp/openpgpAssertions";
import DecryptMessageService from "../../../background_page/service/crypto/decryptMessageService";

// openpgp.config.aeadProtect = true;
// openpgp.config.preferredAEADAlgorithm = openpgp.enums.aead.eax;

/**
 * Service worker that has for aim to generate the server OpenPGP key pair.
 * @param {string} name The key name
 * @param {string} email The key email
 * @param {string} port The communication port to use to return the result.
 * @return {Promise<object>} Object containing the generated key pair
 * @throw Error If the key cannot be generated
 */
onmessage = async ({data: {action, workerProps}, ports: [port]}) => {
  let result;

  switch(action) {
    case 'start':
      break;
    case 'decryptGpgSym':
      result = await decryptGpgSym(workerProps.secretsCount, workerProps.armoredEncryptedMessage);
      break;
    case 'decryptGpgAsym':
      result = await decryptGpgAsym(workerProps.secretsCount, workerProps.armoredDecryptedPrivateKey, workerProps.armoredEncryptedMessage);
      break;
  }

  port.postMessage({result});
}

const decryptGpgAsym = async (secretsCount, armoredDecryptedPrivateKey, armoredEncryptedMessage) => {
  const start = performance.now();
  const decryptedPrivateKey = await OpenpgpAssertion.readKeyOrFail(armoredDecryptedPrivateKey);
  for (let i=0; i<secretsCount; i++) {
    const encryptedMessage = await OpenpgpAssertion.readMessageOrFail(armoredEncryptedMessage);
    await DecryptMessageService.decrypt(encryptedMessage, decryptedPrivateKey);
    // await DecryptMessageService.decryptSymmetrically(encryptedMessage, 'password');
  }
  return performance.now() - start;
}


const decryptGpgSym = async (secretsCount, armoredEncryptedMessage) => {
  const start = performance.now();
  for (let i=0; i<secretsCount; i++) {
    const encryptedMessage = await OpenpgpAssertion.readMessageOrFail(armoredEncryptedMessage);
    await DecryptMessageService.decryptSymmetrically(encryptedMessage, 'password');
    // await DecryptMessageService.decryptSymmetrically(encryptedMessage, 'password');
  }
  return performance.now() - start;
}