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

import {InvalidMasterPasswordError} from "../../error/invalidMasterPasswordError";
import {ExternalGpgKeyEntity} from "../../model/entity/gpgkey/external/externalGpgKeyEntity";
import {CheckPassphraseController} from "./checkPassphraseController";
const mockedAdaPrivateKey = new ExternalGpgKeyEntity({
  armored_key: "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQdGBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\n\/gcDAligwbAF+isJ5IWTOSV7ntMBT6hJX\/lTLRlZuPR8io9niecrRE7UtbHRmW\/K\r\n02MKr8S9roJF1\/DBPCXC1NBp0WMciZHcqr4dh8DhtvCeSPjJd9L5xMGk9TOrK4Bv\r\nLurtbly+qWzP4iRPCLkzX1AbGnBePTLS+tVPHxy4dOMRPqfvzBPLsocHfYXN62os\r\nJDtcHYoFVddQAOPdjsYYptPEI6rFTXNQJTFzwkigqMpTaaqjloM+PFcQNEiabap\/\r\nGRCmD4KLUjCw0MJhikJpNzJHU17Oz7mBkkQy0gK7tvXt23TeVZNj3\/GXdur7IUni\r\nP0SAdSI6Yby8NPp48SjJ6e5O4HvVMDtBJBiNhHWWepLTPVnd3YeQ+1DYPmbpTu1z\r\nrF4+Bri0TfCuDwcTudYD7UUuS62aOwbE4px+RwBjD299gebnI8YAlN975eSAZM4r\r\n5me1dlfDMm47zD9dEmwT+ZwrGfol8oZoUwzYsQaCCmZqaba88ieRAZY30R\/089RS\r\nhR5WSieo2iIckFTILWiK\/E7VrreCUD8iacutVJqgRdzDgP4m+Zm3yRJYw2OiFe1Z\r\nwzD+Fb0gKDSB67G0i4KuZhXSTvn7QjqDWcVmgDTcTcrzzTwveeeLYe4aHaMUQGfl\r\ng+7hsGSt5on\/zqrU4DCQtUtFOn3Rsfyi3H4Fi9IA1w1knKVJ5IsIoxdBnRDvM3ZK\r\n6STr53I8CIJYB5Jj0cZuJ97pQ2YrFNbP5rgJCEnGwRuCRzlgaVeji+g27pZpJMJ4\r\nMdxAAw1AYo0IOPoNbuts5D\/5u5NzeiXxdQn5i\/sfUpYWvVJDnYPpXRT3v4amUpx+\r\nNIE5rF2QoHgc0wiw4hpqGVoin3WycfvlbnsHFJoR1YI9qS3z09Ihu\/NC6TejhgGf\r\ncJyRY5ghTvbqjCJmKPya2\/TfvgYtZmQ7toNpAL4VlLKDE55qXmqVbDo0cCuDnXcK\r\n\/gidC9VEaOxUb3Bxx0GQkxfiEhp\/S\/ndxLgyeG8otkGRat6aVjqPoAWj4Eu9w8XV\r\nysWPDJVv7hZ6rEm05a7eqQTUFg8PHw\/PdD2CWWYPHVTB+T9ihLwxUHMj4j6Uwvpy\r\nm2QyIzdsENkC52KY23SWNFE7WjdQmOS8ki1arVNIP9vcmh7nHGrRwPhmFTeTYzM1\r\n3jERti8DtvVyqnEf4c6CxfupOKLwRXvtJM9vhgFBD39oP\/bPVMee8R8Uj0QUM1ah\r\nVly3WEZK2enFqa\/+ChyZ1IOpVm3o2oCZs\/SWk\/FFsqOsdqJduI\/xbk2YG51FI6bw\r\nv2vCXx9+B+VdjDujtwyTpsy+sy2HqTv+SvYMuMFgpkGa7JDa7iuYqZg0179vEoJJ\r\nq2E04GSsjpg+IxddtjqMsdM0eCCgbY9QgnMxF1GA01Ij\/JC4H8g08jNU6RQ4KUaV\r\nmwdZvR8BhqNR6Ecx6BfzC415q+klaHf9IiPMFCxy96w\/wG6tGzS2tsczejtDoXmX\r\nr8FO+eoDWgzd5uO5f+m1G+dYN4RGUjcVAbC3oePYr3X6oXxu6Cb7tWFzu0ttr2GE\r\nRFDNy4zeN9UlUbbHGiylMdY9NsuGxC58oBgtHLsAsxlbw1oQvpXbBWZzfRwowv\/z\r\nnBdfEDm6JoSUnv1pyhBrM6sItolNaY244FKBmVW46T8U6+sOLSCRAKbKF3BuV6iH\r\nZsCtinXvN4asQ\/vUepuS59tPhSmqTSIAK5SCg6FDH\/tSOxrG9q187P190Nvc2Yyh\r\naolGQmHPK3mkc829sctNIrUJuAyYB4+WXpM\/K0x0u0\/GDJsKW26BZvi0H0FkYSBM\r\nb3ZlbGFjZSA8YWRhQHBhc3Nib2x0LmNvbT6JAk4EEwEKADgCGwMFCwkIBwMFFQoJ\r\nCAsFFgIDAQACHgECF4AWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaLwAKCRAT\r\nU7WxXZsFT46TD\/9v89FVPPT+GB1qBxU1g+f+VyUMW7DCpqfK9i7rLowCItWfoJS3\r\nF9TsYfZpLBlKvsP\/jpNKUEe\/FW82VhE4zHuh1suCrjs4nF9QMbk4+LstmCy4TzOK\r\nMI9RFlNm7bSb6tq2yJ5XTOKuL7ElXT3EmuN2Rcd1fY+uRTRh4nGETnQm4xHWt\/sQ\r\nd8KnjmdZtegzgf4udp0YLXNIdrVaFImR5pjD2OnWCH3cEoPz6SZSubpwoSPE3nhi\r\nmCMXBJ0DrRv4FmBdsyADfuA1AKdliOTu2hpAKVRuosxpDEc8iMRMH5mMk0o5ifvj\r\nQ3YtNG0KLeKitpA2BdARTu1axcZLS24ww3vDjJrUjqxhXd8K1+LJcXB+5ieOMbOf\r\nmFe1OOI4sn7aR3Lk6Y1lz3Cl\/oikq\/v8XZFTAuwFR8fiid001exx2QHpmiPUfG3X\r\npOmQedisqxJa2g6z3QmeXBhseeSLpH+B6RhFJFKkP\/JtJxANEBJDRo6FuLvVa7IV\r\nstkX3Y\/WYQrkYicl6IWMpqJ+8nwX6hqAj2GJhweBfqCGS1o+sA1rYN46OZ6xDRaM\r\ngeKvMUrHdq9giQ4XAqny\/opPPKcARDxdSpmaoSE2MSBUocfSDewL4QJn8cYsexFE\r\ng3WyJickZqGuuQ2zuUUjktOoHIeHnZuKyZjcAMt6bEfpWir4OiS9CfgfFJ0HRgRV\r\nx0wfARAAwVZm+WzCgL50QUhIGEkvPRelNHkzzgwKfX2z8guOnp0Y9sK+UZxPk6X\/\r\nAvjdPeEwvxvOrXwxEaCTOHCwGRRc74TuNV4+O4YW9HBLlb5BjAK4CbAOKMN0yGt6\r\n\/Wat1UrrW\/\/ZT2S3l9oRNbxkhgi8BYtrD+UwdtWYo5rflkIglZw2yu+iujaQZSSU\r\nzo2rUlDJT6m4Y8e6+b7XLBnOkAfmrnmkyB8770mMxTdcWz56q\/otXID9jpPtkrUf\r\nyKdtQ+b\/bqxK+ZixP\/jE1WiwL+Fr2UUQBqzP+ttWDu2F9+N7gtY5ckGjjSIFOUew\r\n1sIazkF80LTCXvX0kMDhXybCEYic20RMKsbCDeYGUOuTmNisOrkgxWTJfhnpPwV3\r\nZ8seZSvaQVzi8L3q0ZAaE2tsBr8R5oCRYx4XKn9g5bRndfa3PkD6Wb6p68lncdxB\r\n37txrqY9OthJVVeFyXBKTIIuWFEnATBLGuf5rZlOhg2i0uzW4TLq04tsjKEUFA2x\r\nHqZNra22R3\/z3An6v2ztdgM7KJtNDJQaA5e7\/SXUrSNNEQqUL3XAqSZ3D+UmSNkI\r\ngxz8pMeIHV7t\/k10W3HAStOgRk4tW6ainQWNGrMehdkhH04JIxTNSYyykYdqUTvU\r\nZ\/AH0OQCWC+gk+iHKKKkn89rDek7K1mdv\/sD8+hFKMQuAM08mHEAEQEAAf4HAwIG\r\nvhenLc6sMuTV+xomYhFDNmDMH1L9x\/8WG+NGjbYEIO0ezLgMizb7HlQVR4pPy+Tx\r\nxQDu8cZEtkxONaI9DDKTjoTD0UtKhELNM8HeJ4SljDbdU76z66BoBf1VIUocGbx8\r\nw6cjaPCALZf8Jl+3YhvJjW9NQcq9WTg1bU4Dga4C7sE1\/1fSK6DR8jKDxkf+zCt9\r\nHAWNtGv0P6IQEVB852M2O47RZkrJS17vBCsjEW9WGfa+i6tdSxS+IDshm+o6PYUG\r\nqUsfdiiRosTM10q1V6bNu2XKNOXvDzfAJPEhacbkkBpmfOhdc7okPqI17cLf0Mne\r\n1pJHXIZxUVUGisPS+yGoCPPuqISC9+EEZcBe8aCwyu4qWvTkNfwZm4SqFd0PiqQq\r\nU44Mf4diqbV3sQKQ3U+r0iZdCTQDBy+OIsmjJWPEvspC7UkaqsPze8eSdYNHB0tf\r\nqBdIidWeJ80131KWBMuweb0lHdxbiifxWMohymgj6mQf34w1Ffslak7c4ABeRTKR\r\njUqmX0bFp4KPFvyLSiArV7\/ohNn14sLq+HV0Kp19fGb8zh5E4x9LAHi0qd4+AcqI\r\ndQMG03XMF0Kih8dYxwIrcze6EmpzYSw5xms6fFangnf\/bWhKchfTb1qCT0npbPOp\r\nON6s3DE0vIdgnFOdxGGGWK0IRckOzf4c7NAMrtnSsuff3ogi25JvAAbxq\/XoCiv0\r\nGXiRJajREv4p4RXkIjZkhwOdMK+ovV8fEEHRyLTGyzx\/0Sv48ebVLVFf2iBW1t5o\r\nEwU2ElJmeMXbLRtFu8KAfr0hzIHPRjEZcQHBh3JdZOMHEwTdVQEeARNpQM51IZoP\r\nYiHRWaYE3XneotdWE07y6Npvc6eigxTy+cTHY+tafKHyNo63HGxhT+E4ZETT3sRn\r\nETkqjDeuaFQgpQmTlK8m+pvPT9CqgEPKSi2FH8bTPXmyO0i713NrBExzpHkmc8LH\r\nRSiXn\/K3Hbw8KQ+aNpMwFF4v2X16gQLQkDCO8PpKwpa9cAdw9vd+J+Hd\/NlEC6JR\r\ng8H7TPcVqtz+ucjW4v00bvoqj+RTWBDv9veUDrQBR862x9aX0TxqzaNr0z9dfpM8\r\nGpGzCLkqMOcqR7QRFX\/MxE\/Vf6wZRi7YvoNgLaikQxLAOfV9quYCcHio3e8AIsVk\r\nDCWeLzdu\/PZ4q+ubdxoWzM4BMHoo0FfBGqp0\/vKwwv5T3HbUpWdwRqqbQCsA1C1a\r\nzsIixUp4\/LkfXtJgqt8AYRMlEBOSM0QCJ1gpTO0+cjdQGgjrUtc2\/\/AhnQLhP4pw\r\n7hncQMR5lm6XGrKoNsair15N0R1hYS90NTi\/4zLQ62+7Q1SDveOKxuXgmGQsG9+p\r\n6GfHwClYuWMAF\/Nxkj+moEmJ39b2qrbO7fCU2ttewjAJZLYr7CN8C9nLTz6YC4by\r\nopW4JsEcHU5979ckpwMVaY8EqMi32NueKCcIj8rYKSKJ4vUyqgjXYmfd+jMrc5F\/\r\nDgSWqTe6xt01X\/nBWxWBlvAWwHJIqt0Toj7IizNS0jBcrmwu+4hPQHN8y+xAXxtI\r\nKzeq\/tcuRz30Oh7zA4vQOMB4ahUfNZlxVMSJAkr55Jwy9ZC4RWD46EhbmBgUSE18\r\n53y2vzihjWsVJvgAQCRrE6HKVvF0EE0PO8hUFLuVpdLhnGD\/xzmFYKxBpqj9IOk2\r\nqN+5UxfiQ+ACE5+WOlrV52ux2D6jcKPFh4R62I8l9zWvbI3rR+FUC3JU7dzIffyj\r\nSg+vmujAqvXwDwRHzdRzZ1u5Og3A3PqEYDtW4dfUmlwMTqd+iQI2BBgBCgAgAhsM\r\nFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0bmj4ACgkQE1O1sV2bBU8V9BAAwDfZ\r\na3h4BL7JeCSvPSasAS47xnlxkzZh7H3MwkywLrVXXvi39KgAgISoRtCfDpq7to1Z\r\nFKj4ZEXGk32jyqKU9ilPBn4yrrgJSfgcx+6FKv8Mu9LdobIJQGAcr+MtHpsJxshQ\r\nvFTcNhXvlopdsuXfAyPFxxqdGwF3oY09ku\/79ZRMqXoohDW4QJxhveGcsMMIptEZ\r\nbcjSlzoBnk+Jq6GMQC9M3k2l\/fS3Ifg6smng6veIOLH4QFbxk9iiQ0\/Ob0d6DWwd\r\nFOcJWyj2vm1JfAqJBA46qw5nWTjrP1DtpnOOVd1+UTUbaTWTARjybMTikBMRDmZ3\r\nDlbGO2ai63nLkfFCQUJ4T3dWqM9xwiaaWjyNNriDVskC7AqIE3\/p0Fpy8jfai606\r\nK4moTXGZQ37iQkVSk0NYMNZZEjdyGUUpAbkWEXtOVEvguvCTChz\/tVzCjIEDNl0e\r\n6+J6DCSi2lVM3y17jyFh9sTXYGF3CDkkY4gDZCL+Du5VjMV\/bw+i5JYo63qTJeeT\r\nprtG4Rea0Z9lQLm38SoSbNHkJ+vfjVmlVKzTENO\/JxfvBik+rx99qvYvX6Vd\/F2J\r\ncDPahGtIpecH60sD7g3eb5hoJPQDpUhM2NrxNZL6e5RLdU3W92XwGozzDtyKL+Xc\r\nL5tM4SQ0BxaO0hYuYx9D4JOGwHfRwZgfLIqMS+E=\r\n=9Gmn\r\n-----END PGP PRIVATE KEY BLOCK-----",
});
const passphrase = "ada@passbolt.com";

const mockFindPrivate = jest.fn();
jest.mock('../../model/keyring', () => ({
  Keyring: jest.fn().mockImplementation(() => ({
    findPrivate: mockFindPrivate
  }))
}));

describe("CheckPassphraseController", () => {
  it(`Should decrypt current user's key with the right passphrase`, () => {
    expect.assertions(1);
    mockFindPrivate.mockImplementation(() => mockedAdaPrivateKey);
    const controller = new CheckPassphraseController();
    const promise = controller.exec(passphrase);
    return expect(promise).resolves.not.toThrow();
  });

  it(`Should throw an exception if the given passphrase doesn't match the key`, async() => {
    expect.assertions(1);
    mockFindPrivate.mockImplementation(() => mockedAdaPrivateKey);
    const controller = new CheckPassphraseController();
    const promise = controller.exec("wrong passphrase");
    return expect(promise).rejects.toThrowError(new InvalidMasterPasswordError());
  });

  it(`Should throw an exception if no private key is found`, async() => {
    expect.assertions(1);
    mockFindPrivate.mockImplementation(() => null);
    const controller = new CheckPassphraseController();
    const promise = controller.exec("wrong passphrase");
    return expect(promise).rejects.toThrowError(new Error("Private key not found."));
  });
});
