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
const {GpgKeyInfoService} = require("./gpgKeyInfoService");
import Validator from 'validator';

global.TextEncoder = textEncoding.TextEncoder;

const dto = {
  "armored_key": "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nVersion: OpenPGP.js v4.10.9\r\nComment: https://openpgpjs.org\r\n\r\nxsFNBFXHTB8BEADAaRMUn++WVatrw3kQK7/6S6DvBauIYcBateuFjczhwEKX\r\nUD6ThLm7nOv5/TKzCpnB5WkP+UZyfT/+jCC2x4+pSgog46jIOuigWBL6Y9F6\r\nKkedApFKxnF6cydxsKxNf/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWq\r\nco7anGhWYj8KKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ/0MhO+\r\nDFuLMITXbhxgQC/eaA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn\r\n9DxlMs6WDXGc6IElSfhCnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM\r\n7Y7y8OieOJeTI22yFkZpCM8itL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60\r\nGXTrpTMkJzJHlvjMk0wapNdDM1q3jKZC+9HAFvyVf0UsU156JWtQBfkE1lqA\r\nYxFvMR/ne+kI8+6ueIJNcAtScqh0LpA5uvPjiIjvlZygqPwQ/LUMgxS0P7sP\r\nNzaKiWc9OpUNl4/P3XTboMQ6wwrZ3wOmSYuhFN8ez51U8UpHPSsI8tcHWx66\r\nWsiiAWdAFctpeR/ZuQcXMvgEad57pz/jNN2JHycA+awesPIJieX5QmG44sfx\r\nkOvHqkB3l193yzxu/awYRnWinH71ySW4GJepPQARAQABzR9BZGEgTG92ZWxh\r\nY2UgPGFkYUBwYXNzYm9sdC5jb20+wsGlBBMBCgA4AhsDBQsJCAcDBRUKCQgL\r\nBRYCAwEAAh4BAheAFiEEA/YOlY9MspcjrN92E1O1sV2bBU8FAl0bmi8AIQkQ\r\nE1O1sV2bBU8WIQQD9g6Vj0yylyOs33YTU7WxXZsFT46TD/9v89FVPPT+GB1q\r\nBxU1g+f+VyUMW7DCpqfK9i7rLowCItWfoJS3F9TsYfZpLBlKvsP/jpNKUEe/\r\nFW82VhE4zHuh1suCrjs4nF9QMbk4+LstmCy4TzOKMI9RFlNm7bSb6tq2yJ5X\r\nTOKuL7ElXT3EmuN2Rcd1fY+uRTRh4nGETnQm4xHWt/sQd8KnjmdZtegzgf4u\r\ndp0YLXNIdrVaFImR5pjD2OnWCH3cEoPz6SZSubpwoSPE3nhimCMXBJ0DrRv4\r\nFmBdsyADfuA1AKdliOTu2hpAKVRuosxpDEc8iMRMH5mMk0o5ifvjQ3YtNG0K\r\nLeKitpA2BdARTu1axcZLS24ww3vDjJrUjqxhXd8K1+LJcXB+5ieOMbOfmFe1\r\nOOI4sn7aR3Lk6Y1lz3Cl/oikq/v8XZFTAuwFR8fiid001exx2QHpmiPUfG3X\r\npOmQedisqxJa2g6z3QmeXBhseeSLpH+B6RhFJFKkP/JtJxANEBJDRo6FuLvV\r\na7IVstkX3Y/WYQrkYicl6IWMpqJ+8nwX6hqAj2GJhweBfqCGS1o+sA1rYN46\r\nOZ6xDRaMgeKvMUrHdq9giQ4XAqny/opPPKcARDxdSpmaoSE2MSBUocfSDewL\r\n4QJn8cYsexFEg3WyJickZqGuuQ2zuUUjktOoHIeHnZuKyZjcAMt6bEfpWir4\r\nOiS9CfgfFM7BTQRVx0wfARAAwVZm+WzCgL50QUhIGEkvPRelNHkzzgwKfX2z\r\n8guOnp0Y9sK+UZxPk6X/AvjdPeEwvxvOrXwxEaCTOHCwGRRc74TuNV4+O4YW\r\n9HBLlb5BjAK4CbAOKMN0yGt6/Wat1UrrW//ZT2S3l9oRNbxkhgi8BYtrD+Uw\r\ndtWYo5rflkIglZw2yu+iujaQZSSUzo2rUlDJT6m4Y8e6+b7XLBnOkAfmrnmk\r\nyB8770mMxTdcWz56q/otXID9jpPtkrUfyKdtQ+b/bqxK+ZixP/jE1WiwL+Fr\r\n2UUQBqzP+ttWDu2F9+N7gtY5ckGjjSIFOUew1sIazkF80LTCXvX0kMDhXybC\r\nEYic20RMKsbCDeYGUOuTmNisOrkgxWTJfhnpPwV3Z8seZSvaQVzi8L3q0ZAa\r\nE2tsBr8R5oCRYx4XKn9g5bRndfa3PkD6Wb6p68lncdxB37txrqY9OthJVVeF\r\nyXBKTIIuWFEnATBLGuf5rZlOhg2i0uzW4TLq04tsjKEUFA2xHqZNra22R3/z\r\n3An6v2ztdgM7KJtNDJQaA5e7/SXUrSNNEQqUL3XAqSZ3D+UmSNkIgxz8pMeI\r\nHV7t/k10W3HAStOgRk4tW6ainQWNGrMehdkhH04JIxTNSYyykYdqUTvUZ/AH\r\n0OQCWC+gk+iHKKKkn89rDek7K1mdv/sD8+hFKMQuAM08mHEAEQEAAcLBjQQY\r\nAQoAIAIbDBYhBAP2DpWPTLKXI6zfdhNTtbFdmwVPBQJdG5o+ACEJEBNTtbFd\r\nmwVPFiEEA/YOlY9MspcjrN92E1O1sV2bBU8V9BAAwDfZa3h4BL7JeCSvPSas\r\nAS47xnlxkzZh7H3MwkywLrVXXvi39KgAgISoRtCfDpq7to1ZFKj4ZEXGk32j\r\nyqKU9ilPBn4yrrgJSfgcx+6FKv8Mu9LdobIJQGAcr+MtHpsJxshQvFTcNhXv\r\nlopdsuXfAyPFxxqdGwF3oY09ku/79ZRMqXoohDW4QJxhveGcsMMIptEZbcjS\r\nlzoBnk+Jq6GMQC9M3k2l/fS3Ifg6smng6veIOLH4QFbxk9iiQ0/Ob0d6DWwd\r\nFOcJWyj2vm1JfAqJBA46qw5nWTjrP1DtpnOOVd1+UTUbaTWTARjybMTikBMR\r\nDmZ3DlbGO2ai63nLkfFCQUJ4T3dWqM9xwiaaWjyNNriDVskC7AqIE3/p0Fpy\r\n8jfai606K4moTXGZQ37iQkVSk0NYMNZZEjdyGUUpAbkWEXtOVEvguvCTChz/\r\ntVzCjIEDNl0e6+J6DCSi2lVM3y17jyFh9sTXYGF3CDkkY4gDZCL+Du5VjMV/\r\nbw+i5JYo63qTJeeTprtG4Rea0Z9lQLm38SoSbNHkJ+vfjVmlVKzTENO/Jxfv\r\nBik+rx99qvYvX6Vd/F2JcDPahGtIpecH60sD7g3eb5hoJPQDpUhM2NrxNZL6\r\ne5RLdU3W92XwGozzDtyKL+XcL5tM4SQ0BxaO0hYuYx9D4JOGwHfRwZgfLIqM\r\nS+E=\r\n=cqUt\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n",
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

// Reset the modules before each test.
beforeEach(() => {
  window.openpgp = openpgp;
  window.Validator = Validator;
});

describe("GpgKeyInfo service", () => {
  it("should provide the right information given an armored key", () => {
    const keyInfo = GpgKeyInfoService.getKeyInfo({armoredKey: dto.armored_key});
    return expect(keyInfo).resolves.toEqual(dto);
  });

  it("should throw an exception if the key is not properly formatted", () => {
    const keyInfo = GpgKeyInfoService.getKeyInfo({armored_key: ":D"});
    return expect(keyInfo).rejects.toEqual(new Error("Misformed armored text"));
  });
});
