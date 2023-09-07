import {OpenpgpAssertion} from "../../../../all/background_page/utils/openpgp/openpgpAssertions";
import DecryptMessageService from "../../../../all/background_page/service/crypto/decryptMessageService";
import {Buffer} from "buffer";
import secrets from "secrets-passbolt";

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
    case 'decryptAes':
      result = await decryptAes(workerProps.secretsCount, workerProps.armoredSecretKey, workerProps.armoredIv, workerProps.armoredEncryptedMessage);
      break;
    case 'encryptAndDecryptAes':
      result = await encryptAndDecryptAes(workerProps.secretsCount, workerProps.armoredSecretKey);
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
  }
  return performance.now() - start;
}

const decryptGpgSym = async (secretsCount, armoredEncryptedMessage) => {
  const start = performance.now();
  for (let i=0; i<secretsCount; i++) {
    const encryptedMessage = await OpenpgpAssertion.readMessageOrFail(armoredEncryptedMessage);
    await DecryptMessageService.decryptSymmetrically(encryptedMessage, 'password');
  }
  return performance.now() - start;
}

const decryptAes = async (secretsCount, armoredSecretKey, armoredIv, armoredEncryptedMessage) => {
  const deserializedSecretKey = JSON.parse(Buffer.from(armoredSecretKey, "base64").toString());
  const deserializedIv = Buffer.from(armoredIv, "base64");
  const encryptedMessage2 = Buffer.from(armoredEncryptedMessage, "base64");
  const serverKey = await crypto.subtle.importKey("jwk", deserializedSecretKey, 'AES-GCM', true, ["encrypt", "decrypt"]);
  const algorithm2 = {
    name: "AES-GCM",
    length: 256,
    iv: deserializedIv
  };
  const start = performance.now();
  for (let i=0; i<secretsCount; i++) {
    await crypto.subtle.decrypt(algorithm2, serverKey, encryptedMessage2);
  }
  return performance.now() - start;
}

const encryptAndDecryptAes = async (secretsCount, armoredSecretKey) => {
  const deserializedSecretKey = JSON.parse(Buffer.from(armoredSecretKey, "base64").toString());
  const secretKey = await crypto.subtle.importKey("jwk", deserializedSecretKey, 'AES-GCM', true, ["encrypt", "decrypt"]);

  const start = performance.now();
  for (let i=0; i<secretsCount; i++) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const algorithm = {
      name: "AES-GCM",
      length: 256,
      iv: iv
    };
    const secret = secrets.random(160);
    const encryptedMessage = await crypto.subtle.encrypt(algorithm, secretKey, (new TextEncoder()).encode(secret));
    await crypto.subtle.decrypt(algorithm, secretKey, encryptedMessage);
  }
  return performance.now() - start;
}