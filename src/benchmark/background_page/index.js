import {pgpKeys} from "../../../test/fixtures/pgpKeys/keys";
import DecryptPrivateKeyService from "../../all/background_page/service/crypto/decryptPrivateKeyService";
import {OpenpgpAssertion} from "../../all/background_page/utils/openpgp/openpgpAssertions";
import secrets from "secrets-passbolt";
import EncryptMessageService from "../../all/background_page/service/crypto/encryptMessageService";
import {Buffer} from "buffer";
import * as openpgp from "openpgp";

class Index {
  static async execute() {
    const workersCount = 7;
    const secretsCount = 1430;
    // For session key test
    const sessionKeysCount = 1;

    const workers = await this.initWorkers(workersCount);
    // await this.benchmark(
    //   'EDDSA ED25519',
    //   () => this.decryptGpgAsym(workers, secretsCount, pgpKeys.eddsa_ed25519.private, pgpKeys.eddsa_ed25519.passphrase));
    // await this.benchmark(
    //   'RSA 3072',
    //   () => this.decryptGpgAsym(workers, secretsCount, pgpKeys.rsa_3072.private, pgpKeys.rsa_3072.passphrase));
    // await this.benchmark(
    //   'RSA 4096',
    //   () => this.decryptGpgAsym(workers, secretsCount, pgpKeys.rsa_4096.private, pgpKeys.rsa_4096.passphrase));
    // await this.benchmark(
    //   'ECDSA P256',
    //   () => this.decryptGpgAsym(workers, secretsCount, pgpKeys.ecdsa_p256.private, pgpKeys.ecdsa_p256.passphrase));
    // await this.benchmark(
    //   'ECDSA P384',
    //   () => this.decryptGpgAsym(workers, secretsCount, pgpKeys.ecdsa_p384.private, pgpKeys.ecdsa_p384.passphrase));
    // await this.benchmark(
    //   'GPG symmetric',
    //   () => this.decryptGpgSym(workers, secretsCount));
    await this.benchmark(
      'GPG ENCRYPT & DECRYPT symmetric',
      () => this.encryptAndDecryptGpgSym(workers, secretsCount, sessionKeysCount));
    // await this.benchmark(
    //   'AES',
    //   () => this.decryptAes(workers, secretsCount));
    // await this.benchmark(
    //   'AES ENCRYPT & DECRYPT',
    //   () => this.encryptAndDecryptAes(workers, secretsCount));
    // not supported
    // await this.benchmark(
    //   'EDDSA SECO256K1',
    //   () => this.decryptGpgAsym(workers, secretsCount, pgpKeys.ecdsa_secp256k1.private, pgpKeys.ecdsa_secp256k1.passphrase));

    this.terminateWorkers(workers);
  }

  static async initWorkers(workersCount) {
    const workers = [];

    for (let i=0; i<workersCount; i++) {
      const worker = await this.initWorker();
      workers.push(worker);
    }

    return workers;
  }

  static async initWorker() {
    const worker = new Worker(chrome.runtime.getURL('/webAccessibleResources/js/dist/worker.js'));
    await this.requestWorker(worker, 'start');
    return worker;
  }

  static async requestWorker(worker, action, workerProps) {
    async function delegate(workerProps) {
      return new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = function({ data }) {
          if (data.error !== undefined) {
            reject(new Error(data.error));
          } else {
            resolve(data.result);
          }
        };
        worker.postMessage(workerProps, [channel.port2]);
      });
    }
    return delegate({action: action, workerProps});
  }

  static async benchmark(scenario, callback) {
    const start = performance.now();
    await (callback());
    const stop = performance.now();
    console.log(`${scenario} (ms): ${stop-start}`);
  }

  static terminateWorkers(workers) {
    workers.forEach(worker => worker.terminate);
  }

  static async decryptGpgAsym(workers, secretsCount, armoredPrivateKey, privateKeyPasshrase) {
    const promises = [];

    const privateKey = await OpenpgpAssertion.readKeyOrFail(armoredPrivateKey);
    const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(privateKey, privateKeyPasshrase);
    const secret = secrets.random(16);
    const armoredEncryptedMessage = await EncryptMessageService.encrypt(secret, decryptedPrivateKey.toPublic());

    for (let i=0; i<workers.length; i++) {
      const workerProps = {secretsCount, armoredDecryptedPrivateKey: decryptedPrivateKey.armor(), armoredEncryptedMessage};
      const promise = this.requestWorker(workers[i], 'decryptGpgAsym', workerProps);
      promises.push(promise);
    }

    return Promise.all(promises);
  }

  static async decryptGpgSym(workers, secretsCount) {
    const promises = [];
    const secret = secrets.random(16);
    const armoredEncryptedMessage = await EncryptMessageService.encryptSymmetrically(secret, 'password');

    for (let i=0; i<workers.length; i++) {
      const workerProps = {secretsCount, armoredEncryptedMessage};
      const promise = this.requestWorker(workers[i], 'decryptGpgSym', workerProps);
      promises.push(promise);
    }

    return Promise.all(promises);
  }

  static async encryptAndDecryptGpgSym(workers, secretsCount, sessionKeysCount) {
    const promises = [];

    for (let i=0; i<workers.length; i++) {
      const workerProps = {secretsCount, sessionKeysCount};
      const promise = this.requestWorker(workers[i], 'encryptAndDecryptGpgSym', workerProps);
      promises.push(promise);
    }

    return Promise.all(promises);
  }

  static async decryptAes(workers, secretsCount) {
    const promises = [];
    const secret = secrets.random(16);
    const algorithm = {
      name: "AES-GCM",
      length: 256
    };
    const capabilities = ["encrypt", "decrypt"];
    const secretKey = await crypto.subtle.generateKey(algorithm, true, capabilities);
    const exportedSecretKey = await crypto.subtle.exportKey("jwk", secretKey);
    const armoredSecretKey = Buffer.from(JSON.stringify(exportedSecretKey)).toString("base64");

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const armoredIv = Buffer.from(iv).toString("base64");
    const encryptedMessage = await crypto.subtle.encrypt({
      name: "AES-GCM",
      iv: iv
    }, secretKey, (new TextEncoder()).encode(secret));
    const armoredEncryptedMessage = Buffer.from(encryptedMessage).toString("base64");

    for (let i=0; i<workers.length; i++) {
      const workerProps = {secretsCount, armoredSecretKey, armoredIv, armoredEncryptedMessage};
      const promise = this.requestWorker(workers[i], 'decryptAes', workerProps);
      promises.push(promise);
    }

    return Promise.all(promises);
  }

  static async encryptAndDecryptAes(workers, secretsCount) {
    const promises = [];
    const algorithm = {
      name: "AES-GCM",
      length: 256
    };
    const secretKey = await crypto.subtle.generateKey(algorithm, true, ["encrypt", "decrypt"]);
    const exportedSecretKey = await crypto.subtle.exportKey("jwk", secretKey);
    const armoredSecretKey = Buffer.from(JSON.stringify(exportedSecretKey)).toString("base64");

    for (let i=0; i<workers.length; i++) {
      const workerProps = {secretsCount, armoredSecretKey};
      const promise = this.requestWorker(workers[i], 'encryptAndDecryptAes', workerProps);
      promises.push(promise);
    }

    return Promise.all(promises);
  }
}

Index.execute();
