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
 * @since         3.3.0
 */
const openpgp = require('openpgp/dist/openpgp');
const textEncoding = require('text-encoding-utf-8');
const {RevokeGpgKeyService} = require("./revokeGpgKeyService");
const {GpgKeyInfoService} = require("./gpgKeyInfoService");
import Validator from 'validator';
import {ExternalGpgKeyEntity} from '../../model/entity/gpgkey/external/externalGpgKeyEntity';

global.TextEncoder = textEncoding.TextEncoder;

const bettyPrivateKey = "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQdGBFWVIFEBEADNf9iYgEVVxHAQ06XTEtx2kpm9jW4kiwBUeJxDEWnUPACEW0Qn\r\n8qA+WAAMeFppxGIjkxW3lyI+TfV0Cclw7h5GTSMlSlIosrNqFRDvj\/q8ghZLAccy\r\n5rcpHfLwHdmGR+S4qzCxfJQ9rkBdZQkde4LpRDmbx1EkFeed1FXwoNuxFfp7cBoo\r\n\/Z5if+mf+6pn1oLAy47PlASYltPvtj\/pK3ZNBatPz5vfBVRjTH9UrdXK8ZjnWypw\r\nACln7pe1vz5mAmNJdpPhxvAMXMx9zWEookYQFCaeOKI9t6t5LX9Vn2wAfHqLV94P\r\n8trrBRHYgAjMI\/fIoOXxcSBEBM98AeJMgMjwQ4\/P1o0bvAhxitNCIgqeLtW2bR4W\r\nG+8SF6ALcZM1kGt8a0DSC9X8dtHpKSvoCT7GgCXtuMl1gptjprzHnM1thhSXZyFI\r\nmVM3e99MC101JG1pQpmyC91KyHPWcwZE\/ugIZTsJQwSjPeLHcGbp+5cLOWArH64Y\r\nVdiUkQ0SwPdB1tsUvfekoNBWQgCNAL9yFTXOsxNM9AsZ+r55kQvp3voMdt49n6z1\r\n9P6sVaPa3+7yj1W5LBIV0stgxixbXBBTnAx19R+23FnmecfHYH8cIiFwJsYWsAYB\r\nCGFzhP9kYzU7Io6TXAZ03LY9KGZW1aRhZTUuY+JErWFYr\/D+9skZ5GE1bQARAQAB\r\n\/gcDAvpdLMN58+dB5Ff26iDBZZ9qd7gqHSfy2hLa+U+M10QmhAugnaAynx+y36GC\r\nhtd1wSXG6mStR9IEDFkgbSuZFGWkXOvvt5gZoKUx6jLkoMiy7VubBwlhyRb6JcjJ\r\nyHJfVq6uVqrxvbUi9lihPat7A+e05b7RoscZEzO3Tc1obdzTaxtvjFWvahT8ShOA\r\n0uI4agFETnWBlm2OcuOMpBYhbft2sKjrfO6Pm4OsV8d5Lx2hfiZQ+9uMsoTNpo2W\r\n+3sAzcrcG3jBGoKM6pnembgc0C9lDfY0ZcAIlXlhScG2pkfrj2I22Gyq7Ln\/oAEN\r\nSzqwwwCa5O9a4\/CXpoRZtAYeu7ldjOXMWRO\/OO3ShOx\/ABJrgPx1QQA5Guk2w5dl\r\nkCc2Sndq508KwGY6DnTzV0ynfpW6ex44PYopmI7bgmAqRc0fqz2E3so2vZ2LPmBD\r\nkeHdt0U407zuTd\/hJ1GOFsLTJZ+ksVOJcYyYQQbScS2Eljl4G9xv2iIQt+xO7w3N\r\nqga8oHL5L2P3BKC7QxzoHyi1h9gV0pGBN0jgTmMvjp1ADI2umewlnNNUCGqpHzse\r\nmY6JSL+kDm0k3W5msLgGtJGe+X6WAQNQ8++OF\/TdVJYzvWbtEnwNkYBjopckLWvU\r\nKUjch6MqrCshdhvoTW5xAz2Trg5L55Lb66b6Ss6KTH+mxgTytwwJY0wt4LUCun5Q\r\nqOTmab5CYmTGifHLkvxq548EfhAV+TqQ8O1BG2uh5qbplYXkYjet\/GSWYoPrSCBh\r\n0qNsha2fijl2SMXZU1mbM+KumEpugU7cQXGwWZVtOlK9KffVvDjJ6UDSNYxdTjMo\r\nAPC8HJuX01Ay6FP1SKi\/RIPRvh5M4VMO7d9OHXT01dPV8i14\/nzNHofXFWmWGmev\r\nIoCtzsW6EkSbCCrjT4\/yzS+ysQbr5j3JPqaSMJeTBLzQevzY3fnjZ6e\/40mCWlzd\r\n3N3Q+V86gpkc7GKfQUOLIzffJ1RHSBfZBLMIWTmd6SfnNQsBX9x5QOq6MBg\/3dl9\r\nvm\/81nsQRH\/0Mh2NEjbE54pkI3OAxrcAd5zqvkT8djT5oiWNkJhhVgK0QSYPcGYH\r\nmVfgZ08tG4GEG+mNg6o9MbWopbMrTAA7pRcCeeRtM2oGtqJZBIGNXXnn54uWLu40\r\nZHpTcNmYwWuUqZG5qc1sM9bBFr7dle3bJMbZ5nS06i91+kRt7RXxPmO23gMcMqTS\r\nTzn4Hdrq5zR0d1c4CqoOZA1IVDYjD\/yw8XmCV\/KmDwshiTNi+OPSbbtiGz3F2DYk\r\nLQprU5DmIICYG0FaMg0CilFUoHFJgWECotI89HkaybnwoZoGHwVf3qx06cPscZ9Q\r\nvTSxoelU6Ve6IxIRJcetYvHdaAhdtTshe1+5lILb6engnTHGtIl4gKzl6Z69rig9\r\nGC7zIeJGiHn47br5c9PXCZNhHtt4c+0NvQqgyVIgKgnd2sdSR62q8lFbbqIbd4vo\r\n9d8+lEdsZF6pHaMxAhYGFABbmCJCdWEQxNKIg6ziAhAgZBmKuKRUeHom0\/ZmUbDi\r\ntzeOERgjgFwi2j78qSjSn0rZnkTYVDPgLajLBO6NIbdESqCbcduF1LoZiyWAX3os\r\nRiMWTyMj+sy4txL+RuBbAhjYqnyh9M+lOFP9TlPyrSt8VpLNo9fVEFp4ExV9VQ2\/\r\nvYwhGUP8HDnxSchX14E1snnmL7mXKz1JRPcJtJlQDOQb36A8LgXS5Zq2jQvk\/Vd2\r\n\/oMu0r7Qw40txGzQKzdctHKDOtsp6Qycm7PabxPD\/xhzR79yRrXuOiy0JEJldHR5\r\nIEhvbGJlcnRvbiA8YmV0dHlAcGFzc2JvbHQuY29tPokCTgQTAQoAOAIbAwULCQgH\r\nAwUVCgkICwUWAgMBAAIeAQIXgBYhBKdUhgw63lqwRZkCXtPx\/kvmHXAJBQJdG5sI\r\nAAoJENPx\/kvmHXAJLuEQAJkxKy7rosbSbzvk7Dh6K8ZBonwJK08YBoaGOB4g1ScR\r\nZYsAF9wYApiFQJ5F4pjqwRIT4SNLuKB6quMwTZjVaG9SC+4I7PW7wSJXiyR57CpX\r\nRx9lHRTYdb2fBqk\/0M2kRWNg+dxOyG9thpTMX31EKPmTGlzLhVZ386dpxt5YYXbB\r\nyuzLpf3OxuQDMfGOrQR8rJm1+eXf+AxWFovTa\/tD061PP+2jRws+ebRhJ8Kl33X5\r\nOj29dCzPwHk4AY6+4QncmLMvfQT\/FzSqoj8yfo20xKyhjddke3nVzzKC1Xk9q8wE\r\npfWS2neFdH6p9egzLl+RPzSE27yB7I3cdxGNhZJqz\/SVXq2ziRkWumtsfpdvbQ7S\r\ny2I2sPQQzhnaFSFBOD78g6P0t7IGL5elHHpLV\/bTq7aPgOURy8twUJSrlEdipzwB\r\n+N0mxoLe30GSYjzMIAk0z6rXkQCRiFV97OfIvMq3Zq9ABH\/tFgSW3gdfaZ8hrfy8\r\niqOX+FwiAg4VGEsb9z5qMwbSLvHC3lt9+5mxfCo4Fkg9NL1EpiObAnTNNRtNHFg4\r\n0FHd10MF8MObf9thyd+omUCkkR0HN16a\/tK1g3lTr5hePGbATclHv6H1r4ZiFDiv\r\nqkGLVDyfr2c5K1DL+KSBCrh3OuXDSNihNyx9iFzW8MDcan257oJVtGf5SgjrUy2b\r\nnQdGBFWVIFEBEAC7y5b+FLndxN3qeQ7jqCXITkw56cYHBfqGz7fc5UNVZLBkmQ7d\r\nT87rFWyl75KUxlj5sqgOUusiPmoQ0W50DBWar5C4tT5BMTrvcUPlIVk\/UO5N7YeO\r\nijezTGYt1BB6AQIJkGeJbCcubOmXz2jC1uuWL6GU3vxVhh7Mjp6\/1ZP8lJBFXgYg\r\nPFs+Nx14sk2KzOlwlHGftJVKiBhrH4bwKMY5lEvRlACaqGLTH80lLtTaSI\/oHA5s\r\n0Y\/VtObAgFrpUXQ1YLTvGdQMneRXRI5PXoSxHwb\/Qe6rUBh7tO8oDDLwDTHyB318\r\nu8iNI5YvS+w69UTMa2He1lmOYwSHArlmkDnvSAQmMOz3NjpYKdHiqYSiwd1khoHs\r\nMb7PIGbQbiy4kAAywgM6IF3IgqdtBEAt6AaK1XC\/cgdN9EpokNMGsQZ0x64TS4cy\r\ntHe9AxYMBSPZzpRXY6sd4+m5xlgsiPXWzbGWGGlt\/bareEinmNDmqybX9cqhK7Ja\r\n5jMBUgqj7soMH+ssBu1SyudFr9iyDDICtqrk1oFwi93zVoO2izEps7UPcEJZ+rZO\r\nQdHBNVH8+EjlEnXLf\/rv7VD5K7W\/YyrD\/DJ+MgxyKhlwNJIRlcNXOj7wnmYgbfPh\r\nyRZxjsvAC7T3JX9FF2R4+8zF7QbP991Q\/VW3hnRbVy47A+sjYwH+CclqKwARAQAB\r\n\/gcDAhoj8T\/UFj3p5CO0XXDZa6dWbhRNxQYsvYM2rE5O1CQ4ZIcaM0VU1OlCm\/9A\r\n2M06vwEW9Ph74Sfcw\/THt0qOkR0R5KK4AC+60nfd2O3O7Vb4HbFz5KLWZCyhBxF7\r\nKMCb01OEXyjR9PUwfNduxl+UwN6MLDvYK+okgOWGqAWLgBpbU1CTwvqLBa4Un5NO\r\n7smOJND3DV2zRtDhUwVRoviR7VKY+6kjEab46nTZEFIxFZr9423yj79nWAykybEE\r\nyLoqg7vI2BJBjlNyRxcI2EZhUKZz4KkQ25EQXBJIqGwxSdE+x8AqT91g4a7CBx+f\r\nwUkElSI4VTBZGuy9a7zxOt2eQ0s79kofoga3Tqr+POx4v7LvuHNKNhwcgxCTcnys\r\nAicAv4dDqYy6UvIDgln9sNB+a\/9mXlUWnvvSL+JNZbrM7oQRaujxUAX80NZaMX7U\r\nDA+Wpa5cpWE0ewiQAnXIYPDqf1qInIyAnVNDnBNuzWmYY5971OVv1Jvlk0xMl7x0\r\nSM2JNKR9ctxO5ySlliDmrebOnKYPPGy9E4qApYryQWvXdlcJCUm0YtRO5Adl+Apf\r\nbTYhsI\/XZKvCN7+G3FecGA1YM9+d+2FsLkFrrRAvqkkVbGKQMxBi\/\/Sq3sEycUry\r\n7UxIfGc0h9Y1QSULbOn1ymxK2GO4HB6kS\/SEOgDw\/PI4YjIpKCbY0vxMfMvVFF7v\r\nicVTxC61AZjIpbZ5GPiX5RKpVcBNzxrQ6+9DumQBvmMDjxoxAg6EtHax1KBs8QD4\r\nnKp8DKDdiLVLSUu3rHeS0S35lu0T\/6UIeAhVIZrWEOTRUZi\/MIbfoJ4Vin5csXA+\r\n8pB1q0TSKr+sbSzsWRxNEHYbJYko64ti+5O1hlDb9wNEBUdie4ObFX0H9Ngsv\/0o\r\nIzCwbSPp3quHTzTtJTcgJOdXcUzf3IWL23PN4DJi+8bqELGp48\/S8i2UTdlrXtKK\r\nPa0evYboB3Oq4jel5DzgT1S7lIT84ZjTQLfL8IOcM30S9f9FxzSmYTmFv\/yB6aKJ\r\naCVLCoQg7oJw5F3NdBhKkyQ27qKno7Y7\/1sPF42FnAtoxu9VLIsQgDyXE8\/XM\/1J\r\nhkqXnnb7x2wUkiLBeQZHVJ\/yKGiyizbexmFe6W408UQ3AC4a53m0St2bQn7vq255\r\ndt4GIvs\/SgJYKD2VAxEvsei\/\/wus5XgHvOWH5NCWXrSY+b1TNK4gnrwhdHPZUZ4I\r\n9uHG\/TGn1ieA1wmIPv1uXtO+C\/GBM1t\/gKjopGXWKZwV\/ugx6ePGfsTfMVeYl5+i\r\nNUGJPPkwqMl4jlzRKJOInMGh3mU7Ev0Z3T+fxcUMcpJVOaze46cQe85EiYugAXCf\r\n6pI0gr8FVighXFZuBS4bT1e25HKac3DL1c5xrC6S1BQRgdPsNEsMfzUtv7tcWJNM\r\ncpqlXC0GkKk+0208t3yQ+qolA4xXudYIp3Mv9PTYSm1mig3uCY0XKa2T6e66trna\r\nvet4cF+WnmpsFbenZZDf\/uGfGxGRAXStF4P9thQTFCboqdCZFL4V4Ph8X7VGCVzw\r\nFQmDk\/r5WMCp+N+EW1p4SkvryZOy4Xaxa8aMSQUEy750ibqEjZy3kML\/xHLrwpx3\r\nHOPADN+g7W1Ew+ZMbAC5VaoLxgS84VyO36CCFOfZn5\/QVWCL03ljrHrrV23BDXv0\r\n0UCBKwFNTkPL4NXm\/j+svtodJ8MC3ASqgJ5vE\/KnLYYTZKkobrAufANRBHFqKoUo\r\nHmWjU+AaSUNZBxyCcJ0Ma1JGEonsDigncWSDxL2OxTi6F+Z9jgjAJ6mJAjYEGAEK\r\nACACGwwWIQSnVIYMOt5asEWZAl7T8f5L5h1wCQUCXRubIAAKCRDT8f5L5h1wCZ7f\r\nD\/4jmmppbAiFqFoDH1opIqQIfTP8X78WORNqlhYQx6hbp6FWWLl3mfz1\/GUa4YK+\r\n8K75Ol2JYrWx1or6Kvc\/4HIV9ZfsY953Fh+icK\/FSUSlk2xcY+mL2zeYFI17JNas\r\ncdKC8VQCzyDSF0bqhWSUaRB2xOO0t4wtVTfhtmd\/yTnKGJlwl5ceuhAPeQT0cUmb\r\neuR1hAP8zcqsEdGWpBtJp7i9eeAPgT7DXDNSN7h3wc5hmwaVtZwu1pm+POH2ZVcy\r\nHAFLAaHdZ\/pyF1HFZ61g\/M8Kj\/we5YWKadaM2\/PrxdYSAw6\/wSTZWVueq70io5SB\r\nE5Kio1giMTgfQWpp68cXpphFn\/Nmg6LI3RpoMB62KX4AzAK7Z7Gftn1QjhoIJifd\r\niND\/M3\/agoklhoNP\/Mc3+EkuU31OHzIyFansR4jil9HIum0Dl+VXykWjzF9NJY2\/\r\ngRM92hSou\/5YIMUgeb0yaqYp7Qm7NfNqf\/A\/WUw1cihFUCCNCT6\/lXcBDtZptMDK\r\nuoiHts5SjPao6qtk7kZrDUu0FJ4oxVNo95W35fS3KRD4sFU0SB5EtGlHP+C5\/iGj\r\ngFKLw0jdIy8AZm5e4B66fq+yUIDxECPD+F44xJ3a4NF9uB3ZVOAABO5yOnWXhn\/C\r\nBF4+ZP5A5CDEiZjLZtnl6SWXD2Bg1VJDgN9IqA2NeH1WPQ==\r\n=G+S0\r\n-----END PGP PRIVATE KEY BLOCK-----";

// Reset the modules before each test.
beforeEach(() => {
  window.openpgp = openpgp;
  window.Validator = Validator;
});

describe("RevokeGpgKey service", () => {
  it("should generate a revoked public key given a decrypted private key", async() => {
    expect.assertions(4);

    const bettyPrivateGpgKey = (await openpgp.key.readArmored(bettyPrivateKey)).keys[0];
    await bettyPrivateGpgKey.decrypt("betty@passbolt.com");

    const validPublicKey = bettyPrivateGpgKey.toPublic();
    const publicKeyInfo = await GpgKeyInfoService.getKeyInfo(new ExternalGpgKeyEntity({armored_key: validPublicKey.armor()}));
    expect(publicKeyInfo.private).toBe(false);
    expect(publicKeyInfo.revoked).toBe(false);

    const revokedPublicKey = await RevokeGpgKeyService.revoke(new ExternalGpgKeyEntity({armored_key: bettyPrivateGpgKey.armor()}));
    const revokedKeyInfo =  await GpgKeyInfoService.getKeyInfo(revokedPublicKey);
    expect(revokedKeyInfo.private).toBe(false);
    expect(revokedKeyInfo.revoked).toBe(true);
  });
});
