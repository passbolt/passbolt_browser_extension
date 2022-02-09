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
import {ApiClientOptions} from "../../service/api/apiClient/apiClientOptions";

const openpgp = require("openpgp/dist/openpgp");
import textEncoding from 'text-encoding-utf-8';
import Validator from "validator";
import {Worker} from "../../sdk/worker";
import {AccountRecoveryResponseController} from "./accountRecoveryResponseController";

// Required to use openpgpjs with jest.
global.TextEncoder = textEncoding.TextEncoder;

jest.mock("../passphrase/passphraseController.js", () => ({
  request: jest.fn().mockImplementation(() => {})
}));

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator; // Required by Account entity schema validation
  window.openpgp = openpgp; // Required by Uuid.get to generate uuid
});

describe("AccountRecoveryResponseController", () => {
  describe("AccountRecoveryResponseController::saveReview", () => {
    it("Should assert AccountRecoveryResponse contains required data.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryResponseController(mockWorker, apiClientOptions);
      const accountRecoveryResponseDto = {
        "id": "d4c0e643-3967-443b-93b3-102d902c4510",
        "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
        "responder_foreign_model": "AccountRecoveryOrganizationKey",
        "status": "approved"
      };
      const privateKeyDto = {
        armored_key: "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQdGBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\n\/gcDAligwbAF+isJ5IWTOSV7ntMBT6hJX\/lTLRlZuPR8io9niecrRE7UtbHRmW\/K\r\n02MKr8S9roJF1\/DBPCXC1NBp0WMciZHcqr4dh8DhtvCeSPjJd9L5xMGk9TOrK4Bv\r\nLurtbly+qWzP4iRPCLkzX1AbGnBePTLS+tVPHxy4dOMRPqfvzBPLsocHfYXN62os\r\nJDtcHYoFVddQAOPdjsYYptPEI6rFTXNQJTFzwkigqMpTaaqjloM+PFcQNEiabap\/\r\nGRCmD4KLUjCw0MJhikJpNzJHU17Oz7mBkkQy0gK7tvXt23TeVZNj3\/GXdur7IUni\r\nP0SAdSI6Yby8NPp48SjJ6e5O4HvVMDtBJBiNhHWWepLTPVnd3YeQ+1DYPmbpTu1z\r\nrF4+Bri0TfCuDwcTudYD7UUuS62aOwbE4px+RwBjD299gebnI8YAlN975eSAZM4r\r\n5me1dlfDMm47zD9dEmwT+ZwrGfol8oZoUwzYsQaCCmZqaba88ieRAZY30R\/089RS\r\nhR5WSieo2iIckFTILWiK\/E7VrreCUD8iacutVJqgRdzDgP4m+Zm3yRJYw2OiFe1Z\r\nwzD+Fb0gKDSB67G0i4KuZhXSTvn7QjqDWcVmgDTcTcrzzTwveeeLYe4aHaMUQGfl\r\ng+7hsGSt5on\/zqrU4DCQtUtFOn3Rsfyi3H4Fi9IA1w1knKVJ5IsIoxdBnRDvM3ZK\r\n6STr53I8CIJYB5Jj0cZuJ97pQ2YrFNbP5rgJCEnGwRuCRzlgaVeji+g27pZpJMJ4\r\nMdxAAw1AYo0IOPoNbuts5D\/5u5NzeiXxdQn5i\/sfUpYWvVJDnYPpXRT3v4amUpx+\r\nNIE5rF2QoHgc0wiw4hpqGVoin3WycfvlbnsHFJoR1YI9qS3z09Ihu\/NC6TejhgGf\r\ncJyRY5ghTvbqjCJmKPya2\/TfvgYtZmQ7toNpAL4VlLKDE55qXmqVbDo0cCuDnXcK\r\n\/gidC9VEaOxUb3Bxx0GQkxfiEhp\/S\/ndxLgyeG8otkGRat6aVjqPoAWj4Eu9w8XV\r\nysWPDJVv7hZ6rEm05a7eqQTUFg8PHw\/PdD2CWWYPHVTB+T9ihLwxUHMj4j6Uwvpy\r\nm2QyIzdsENkC52KY23SWNFE7WjdQmOS8ki1arVNIP9vcmh7nHGrRwPhmFTeTYzM1\r\n3jERti8DtvVyqnEf4c6CxfupOKLwRXvtJM9vhgFBD39oP\/bPVMee8R8Uj0QUM1ah\r\nVly3WEZK2enFqa\/+ChyZ1IOpVm3o2oCZs\/SWk\/FFsqOsdqJduI\/xbk2YG51FI6bw\r\nv2vCXx9+B+VdjDujtwyTpsy+sy2HqTv+SvYMuMFgpkGa7JDa7iuYqZg0179vEoJJ\r\nq2E04GSsjpg+IxddtjqMsdM0eCCgbY9QgnMxF1GA01Ij\/JC4H8g08jNU6RQ4KUaV\r\nmwdZvR8BhqNR6Ecx6BfzC415q+klaHf9IiPMFCxy96w\/wG6tGzS2tsczejtDoXmX\r\nr8FO+eoDWgzd5uO5f+m1G+dYN4RGUjcVAbC3oePYr3X6oXxu6Cb7tWFzu0ttr2GE\r\nRFDNy4zeN9UlUbbHGiylMdY9NsuGxC58oBgtHLsAsxlbw1oQvpXbBWZzfRwowv\/z\r\nnBdfEDm6JoSUnv1pyhBrM6sItolNaY244FKBmVW46T8U6+sOLSCRAKbKF3BuV6iH\r\nZsCtinXvN4asQ\/vUepuS59tPhSmqTSIAK5SCg6FDH\/tSOxrG9q187P190Nvc2Yyh\r\naolGQmHPK3mkc829sctNIrUJuAyYB4+WXpM\/K0x0u0\/GDJsKW26BZvi0H0FkYSBM\r\nb3ZlbGFjZSA8YWRhQHBhc3Nib2x0LmNvbT6JAk4EEwEKADgCGwMFCwkIBwMFFQoJ\r\nCAsFFgIDAQACHgECF4AWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaLwAKCRAT\r\nU7WxXZsFT46TD\/9v89FVPPT+GB1qBxU1g+f+VyUMW7DCpqfK9i7rLowCItWfoJS3\r\nF9TsYfZpLBlKvsP\/jpNKUEe\/FW82VhE4zHuh1suCrjs4nF9QMbk4+LstmCy4TzOK\r\nMI9RFlNm7bSb6tq2yJ5XTOKuL7ElXT3EmuN2Rcd1fY+uRTRh4nGETnQm4xHWt\/sQ\r\nd8KnjmdZtegzgf4udp0YLXNIdrVaFImR5pjD2OnWCH3cEoPz6SZSubpwoSPE3nhi\r\nmCMXBJ0DrRv4FmBdsyADfuA1AKdliOTu2hpAKVRuosxpDEc8iMRMH5mMk0o5ifvj\r\nQ3YtNG0KLeKitpA2BdARTu1axcZLS24ww3vDjJrUjqxhXd8K1+LJcXB+5ieOMbOf\r\nmFe1OOI4sn7aR3Lk6Y1lz3Cl\/oikq\/v8XZFTAuwFR8fiid001exx2QHpmiPUfG3X\r\npOmQedisqxJa2g6z3QmeXBhseeSLpH+B6RhFJFKkP\/JtJxANEBJDRo6FuLvVa7IV\r\nstkX3Y\/WYQrkYicl6IWMpqJ+8nwX6hqAj2GJhweBfqCGS1o+sA1rYN46OZ6xDRaM\r\ngeKvMUrHdq9giQ4XAqny\/opPPKcARDxdSpmaoSE2MSBUocfSDewL4QJn8cYsexFE\r\ng3WyJickZqGuuQ2zuUUjktOoHIeHnZuKyZjcAMt6bEfpWir4OiS9CfgfFJ0HRgRV\r\nx0wfARAAwVZm+WzCgL50QUhIGEkvPRelNHkzzgwKfX2z8guOnp0Y9sK+UZxPk6X\/\r\nAvjdPeEwvxvOrXwxEaCTOHCwGRRc74TuNV4+O4YW9HBLlb5BjAK4CbAOKMN0yGt6\r\n\/Wat1UrrW\/\/ZT2S3l9oRNbxkhgi8BYtrD+UwdtWYo5rflkIglZw2yu+iujaQZSSU\r\nzo2rUlDJT6m4Y8e6+b7XLBnOkAfmrnmkyB8770mMxTdcWz56q\/otXID9jpPtkrUf\r\nyKdtQ+b\/bqxK+ZixP\/jE1WiwL+Fr2UUQBqzP+ttWDu2F9+N7gtY5ckGjjSIFOUew\r\n1sIazkF80LTCXvX0kMDhXybCEYic20RMKsbCDeYGUOuTmNisOrkgxWTJfhnpPwV3\r\nZ8seZSvaQVzi8L3q0ZAaE2tsBr8R5oCRYx4XKn9g5bRndfa3PkD6Wb6p68lncdxB\r\n37txrqY9OthJVVeFyXBKTIIuWFEnATBLGuf5rZlOhg2i0uzW4TLq04tsjKEUFA2x\r\nHqZNra22R3\/z3An6v2ztdgM7KJtNDJQaA5e7\/SXUrSNNEQqUL3XAqSZ3D+UmSNkI\r\ngxz8pMeIHV7t\/k10W3HAStOgRk4tW6ainQWNGrMehdkhH04JIxTNSYyykYdqUTvU\r\nZ\/AH0OQCWC+gk+iHKKKkn89rDek7K1mdv\/sD8+hFKMQuAM08mHEAEQEAAf4HAwIG\r\nvhenLc6sMuTV+xomYhFDNmDMH1L9x\/8WG+NGjbYEIO0ezLgMizb7HlQVR4pPy+Tx\r\nxQDu8cZEtkxONaI9DDKTjoTD0UtKhELNM8HeJ4SljDbdU76z66BoBf1VIUocGbx8\r\nw6cjaPCALZf8Jl+3YhvJjW9NQcq9WTg1bU4Dga4C7sE1\/1fSK6DR8jKDxkf+zCt9\r\nHAWNtGv0P6IQEVB852M2O47RZkrJS17vBCsjEW9WGfa+i6tdSxS+IDshm+o6PYUG\r\nqUsfdiiRosTM10q1V6bNu2XKNOXvDzfAJPEhacbkkBpmfOhdc7okPqI17cLf0Mne\r\n1pJHXIZxUVUGisPS+yGoCPPuqISC9+EEZcBe8aCwyu4qWvTkNfwZm4SqFd0PiqQq\r\nU44Mf4diqbV3sQKQ3U+r0iZdCTQDBy+OIsmjJWPEvspC7UkaqsPze8eSdYNHB0tf\r\nqBdIidWeJ80131KWBMuweb0lHdxbiifxWMohymgj6mQf34w1Ffslak7c4ABeRTKR\r\njUqmX0bFp4KPFvyLSiArV7\/ohNn14sLq+HV0Kp19fGb8zh5E4x9LAHi0qd4+AcqI\r\ndQMG03XMF0Kih8dYxwIrcze6EmpzYSw5xms6fFangnf\/bWhKchfTb1qCT0npbPOp\r\nON6s3DE0vIdgnFOdxGGGWK0IRckOzf4c7NAMrtnSsuff3ogi25JvAAbxq\/XoCiv0\r\nGXiRJajREv4p4RXkIjZkhwOdMK+ovV8fEEHRyLTGyzx\/0Sv48ebVLVFf2iBW1t5o\r\nEwU2ElJmeMXbLRtFu8KAfr0hzIHPRjEZcQHBh3JdZOMHEwTdVQEeARNpQM51IZoP\r\nYiHRWaYE3XneotdWE07y6Npvc6eigxTy+cTHY+tafKHyNo63HGxhT+E4ZETT3sRn\r\nETkqjDeuaFQgpQmTlK8m+pvPT9CqgEPKSi2FH8bTPXmyO0i713NrBExzpHkmc8LH\r\nRSiXn\/K3Hbw8KQ+aNpMwFF4v2X16gQLQkDCO8PpKwpa9cAdw9vd+J+Hd\/NlEC6JR\r\ng8H7TPcVqtz+ucjW4v00bvoqj+RTWBDv9veUDrQBR862x9aX0TxqzaNr0z9dfpM8\r\nGpGzCLkqMOcqR7QRFX\/MxE\/Vf6wZRi7YvoNgLaikQxLAOfV9quYCcHio3e8AIsVk\r\nDCWeLzdu\/PZ4q+ubdxoWzM4BMHoo0FfBGqp0\/vKwwv5T3HbUpWdwRqqbQCsA1C1a\r\nzsIixUp4\/LkfXtJgqt8AYRMlEBOSM0QCJ1gpTO0+cjdQGgjrUtc2\/\/AhnQLhP4pw\r\n7hncQMR5lm6XGrKoNsair15N0R1hYS90NTi\/4zLQ62+7Q1SDveOKxuXgmGQsG9+p\r\n6GfHwClYuWMAF\/Nxkj+moEmJ39b2qrbO7fCU2ttewjAJZLYr7CN8C9nLTz6YC4by\r\nopW4JsEcHU5979ckpwMVaY8EqMi32NueKCcIj8rYKSKJ4vUyqgjXYmfd+jMrc5F\/\r\nDgSWqTe6xt01X\/nBWxWBlvAWwHJIqt0Toj7IizNS0jBcrmwu+4hPQHN8y+xAXxtI\r\nKzeq\/tcuRz30Oh7zA4vQOMB4ahUfNZlxVMSJAkr55Jwy9ZC4RWD46EhbmBgUSE18\r\n53y2vzihjWsVJvgAQCRrE6HKVvF0EE0PO8hUFLuVpdLhnGD\/xzmFYKxBpqj9IOk2\r\nqN+5UxfiQ+ACE5+WOlrV52ux2D6jcKPFh4R62I8l9zWvbI3rR+FUC3JU7dzIffyj\r\nSg+vmujAqvXwDwRHzdRzZ1u5Og3A3PqEYDtW4dfUmlwMTqd+iQI2BBgBCgAgAhsM\r\nFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0bmj4ACgkQE1O1sV2bBU8V9BAAwDfZ\r\na3h4BL7JeCSvPSasAS47xnlxkzZh7H3MwkywLrVXXvi39KgAgISoRtCfDpq7to1Z\r\nFKj4ZEXGk32jyqKU9ilPBn4yrrgJSfgcx+6FKv8Mu9LdobIJQGAcr+MtHpsJxshQ\r\nvFTcNhXvlopdsuXfAyPFxxqdGwF3oY09ku\/79ZRMqXoohDW4QJxhveGcsMMIptEZ\r\nbcjSlzoBnk+Jq6GMQC9M3k2l\/fS3Ifg6smng6veIOLH4QFbxk9iiQ0\/Ob0d6DWwd\r\nFOcJWyj2vm1JfAqJBA46qw5nWTjrP1DtpnOOVd1+UTUbaTWTARjybMTikBMRDmZ3\r\nDlbGO2ai63nLkfFCQUJ4T3dWqM9xwiaaWjyNNriDVskC7AqIE3\/p0Fpy8jfai606\r\nK4moTXGZQ37iQkVSk0NYMNZZEjdyGUUpAbkWEXtOVEvguvCTChz\/tVzCjIEDNl0e\r\n6+J6DCSi2lVM3y17jyFh9sTXYGF3CDkkY4gDZCL+Du5VjMV\/bw+i5JYo63qTJeeT\r\nprtG4Rea0Z9lQLm38SoSbNHkJ+vfjVmlVKzTENO\/JxfvBik+rx99qvYvX6Vd\/F2J\r\ncDPahGtIpecH60sD7g3eb5hoJPQDpUhM2NrxNZL6e5RLdU3W92XwGozzDtyKL+Xc\r\nL5tM4SQ0BxaO0hYuYx9D4JOGwHfRwZgfLIqMS+E=\r\n=9Gmn\r\n-----END PGP PRIVATE KEY BLOCK-----",
        passphrase: "ada@passbolt.com"
      };

      expect.assertions(1);
      try {
        await controller.saveReview(accountRecoveryResponseDto, privateKeyDto);
      } catch (error) {
        expect(error.message).toEqual("Could not validate entity AccountRecoveryResponse.");
      }
    });

    it("Should assert passphrase is valid.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryResponseController(mockWorker, apiClientOptions);
      const accountRecoveryResponseDto = {
        "id": "d4c0e643-3967-443b-93b3-102d902c4510",
        "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
        "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
        "responder_foreign_model": "AccountRecoveryOrganizationKey",
        "status": "approved"
      };
      const privateKeyDto = {
        armored_key: "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQPGBFwOKS0BCAC+co6QH6A8IAdDESHfFZGHcVe\/PdU3EGXlQOxguyMTFQBinGZI\r\nbnuNuxFRJmqjkRor0N83zBS5OYyRB0uGFt4lomsPE7gYwFj1v\/\/3Zd3OOLskA5RW\r\niBj6djhoyR88ZReIgchjTUaH0h0KzUOSSrTT2t1\/D3BE8RMh+xeoD6MN8M282JsR\r\nWiGVA8iWehrYE7u2RY+m5InlwmVm9mplKyHpew91CNcjaZqRiRlH3wdUgzj7fvx6\r\ngvCDbCO10f39KS5959HGM4rbSs0A9+I+Yf81Zcdv4IJgvK8r9ARi3Omk03Tfp1lw\r\nO+hN8kpOrJfk8SSdMZBt+rtEHv70GLXp8Z09ABEBAAH+BwMC3ojn6Ehp33b\/wFH5\r\nmqi1zSJBViLQT2hzN47lEfrxIIHvIxmYG9mdfTC2Y0bNqHSK8gwdBGNAA23e1qHZ\r\nF7gjk1XeYknA0pGw2iOVt292NsLK5RkawQIE2RQ3EjO5kWtWjsbTqskgREf5YZb1\r\nPTP3AH9o5Qnl2QbKydbY0mINJolasrh6Al0rqbTLSyKkvG+Poxo1eo4ltnZMXSjb\r\naMr2IFt0WJkj+9B2g9zndnGtn1xlN5hvyAc8s7EULE6XfvMpxeU1BDgI\/sYarxfU\r\nJwYRokmlIAOymrds6jwaIPCLEL0B2\/sv2GU26yNi6pMZ9N1OAomH3XTHccAtR9No\r\nis1YLuw8hJuxIiFS8yKKaQ9yX71MQrTdzfjIC5RQ5djrhZIKUMPXzb63aqadqHL8\r\n6KW8r2WvfSTkfYI864YBnzGFF6opnKAJ2o7RZveWuh2RRxouahU5IleyMJWZ39BC\r\nDjm3X4a7jfAvWKlIxgxMATQvrYmO54L6MpNAi9PbeDUDORDBrCanItvgErjmg+YX\r\nXrW3rq0hg02NZWrZwouSBbrrmxnOojgEhY9XIe+4IoGKIqbiup4RzwJkIhhZ4O+Z\r\nmFZb9cKE2jU+R9FmVAUiZb3Yr2qGrSKIIgQUBMrCPqBgj\/WrPiAN\/8EDB5ObZYt6\r\n97FVxpjUuWPCQRJXiNIuwz14W9ugGTmph\/6Vy7bT0rGkVMN3BfD7fwmjUHYR\/JEl\r\nr7eB+Cm9OWjK0eF\/ADjeuQgerCpPw194eUF2xIODPbmJfV+sxXouMMBpf6\/XrTCt\r\n45WvxLa57+9GHpJgIxQST53EREIWx94B7Msxh9eLfRiajWGv3+NBQ3MS6j5D59x+\r\no+5mjdkG7D8KLq86Qn0KWuDzCcmg73uz4kHWuIDdLr5n053RXqw6SAuCauEQ4i19\r\nNjH3reVZ+3XVtDFGaXJzdCBuYW1lIDYzIExhc3QgbmFtZSA2MyA8dXNlcl82M0Bw\r\nYXNzYm9sdC5jb20+iQFOBBMBCgA4FiEELQM6xreHYrjlSrrMdOn74WRD7qIFAlwO\r\nKS0CGwMFCwkIBwIGFQoJCAsCBBYCAwECHgECF4AACgkQdOn74WRD7qKLfQf+Kikd\r\ni\/U2\/6l1\/hd+HPUDoakqTitLCUm6kRfJtFGUyjIGVjJF2+DaKl8a8gg75hlKYPhO\r\nX6aQInr\/24R5qEm51A79bHAfSA+WCxd4gyqAX+5r1EYaMEN\/R9Rfb7GexAxFzOwr\r\nMVSzgiM5sxTs6P1KXUS53uT7O4CykSYQUvPNy4IF0+psys8BkTjfS\/ArnEeYHICC\r\nDW2jNst0NGCxV+Qh92pBomHrjYIDbU\/sgnyAta3KPZUDmgzdx0jUexJCPJb5xPnh\r\ngJ9DVe7TAsjL+1CZMTM+WnWJelyVa6sgwYN\/adCZZnLNVgS20\/okiyjICg9Ubd8g\r\nEHkgXi5R9i+dHlLBaZ0DxgRcDiktAQgAwkC8+bFzB8ID3yEFDSr\/fzL6e4tVdqJH\r\n2SK+7aVui+7bM+\/ZrtBY93nX3cvseQbKUYFmOwC+KuRr\/F4LxvklEbnA0yct4KlZ\r\neiE13SwLxLOf03vQQXj\/02Xk43MuY58pKRNJQxN93Te2\/9zEDLpt5W2y\/MBAWbwy\r\nje7HHd3WNXkpkh22lW+RmnUu5TLOhFFf08yrxiWASN2ZrHgFNc4KLgnHBw6tzaJl\r\nEpuieY5mBHnlZgBd6gdsQcl3zAonzeTWR27g85XXSKQLhIzhZ18YkpFV7CyWjAte\r\n8cs3efcx5wsPoc6uhQYKO6Pn\/Rw8NyC+QbuplT0t1YW8Cogh\/mbdBwARAQAB\/gcD\r\nAr0YALyuZEVs\/yOuCAZXNOZVAFgIZQihdhgRh6cqN0HCrwxWXtLJ9JPKUuZ0Zxq6\r\nd1Z3pqcIGCEAFUkxkh0rw0QmAeIHVNnq3uEXk+yrEi0LN49td8qjEdZu7GCIdCl+\r\nq3kCxC1nA6MFenWeI47DsBzXgvcidPBKuTHgcRU7kFYyTtlWvT+aboAYchH1TZ1Q\r\nY6v0q3kmSLMt\/N24LJkaBD4ABeE9\/GWnj2\/Klevl1Xrt7ETXbEfQxA7j8JP\/EpMo\r\nLx7YmLoPo1egamzava21xdQu\/CC5kSjZ\/5RcxHeN9t8LhSnaVyVZXAbUzXwUixq1\r\nlvjhT70MWqF+uHsd2veUiSRl1k1wKMz2M\/7I4Z+APSrSwVyteQ3ic6W\/s0Ksw1FA\r\nJwEOjnHYz8R\/k9EosBWRd8+UruK2Kqqz5OmIPk3flk1SV4UnpeDWTcxlZj3r1RDf\r\ngISA5SZPmiuXt4U1tdDNwMNXGUUsH1xErBWj\/q7KCHdGOv4uyNcX50sCMRV+WuFg\r\nw3Cgk9q8QMx7NTIGZuiL+hLlnTQpjvcWzLak\/C18OnTC6+7i03KsJS0qq8b3Q0OT\r\nMuct1Fi0aUkpvqRpAeLIao+ovir7U\/7GGO\/P6LPJeLYbj1CXPt8MAxMEvE1qBldp\r\nszJmMi55x1TUCTCMmE16qDNk5JyPSoNC81OTCu1\/N6nBJrDpOFEjM4G+Z4Tzh3G4\r\nkS9b2hCGrpLiJCT8IkwxaCcViIAc53FuBFY13NEghC+sgEmiZVMbT+AAC0Sf4deS\r\n2DKzBovxffSuPYHmHdcjFPd8TVlAyg5TWrTauT8MHYsud6GPPQXzJgfNGJlGooyP\r\n8B6nM34iDvmInc7+8LUH8LSQsKocnESmUsO5s6bf4tnNo1tGD\/e4OrXKMGDOrmTj\r\nDPlIlUH2eGXLyAR0QW94ehS2\/Bun5YkBNgQYAQoAIBYhBC0DOsa3h2K45Uq6zHTp\r\n++FkQ+6iBQJcDiktAhsMAAoJEHTp++FkQ+6ilV0H\/1uHkClUMrNR+QeWC\/nzteUS\r\ngXbLJyyvh6flgL2pwWMrPJ1JSvMH28yPq6RSkWvKCs\/xpE7YXT0FnWimzh\/XIhxQ\r\nlLSKrkdrysQx5nwb7YHH+FPxJa25s0xsyGuzPyv7007RmkIhnF7uAosFyptSfuWe\r\n8k3dHMxkB+CSfncNvTMQQ1lm3ur\/RawVKitQ\/CrucZK2iQhkGoYEgIYk7RIHS+2T\r\noA2WOmNnbej1Vyl8wEbrydn+LkAcRrzi8fCyGaEiDGNhG4WrCMz3DnsxuR78qnQV\r\nUGCxbnuK3Z0Ns4BzlZpXPZ3+ceWFxMOV0pynMahRjYTooBYYX0sigWdVgaZbg5c=\r\n=ZVIz\r\n-----END PGP PRIVATE KEY BLOCK-----\r\n",
        passphrase: "passphrase"
      };

      expect.assertions(1);
      try {
        await controller.saveReview(accountRecoveryResponseDto, privateKeyDto);
      } catch (error) {
        expect(error.message).toEqual("This is not a valid passphrase");
      }
    });

    it("Should assert private key is valid to decrypt.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryResponseController(mockWorker, apiClientOptions);
      const accountRecoveryResponseDto = {
        "id": "d4c0e643-3967-443b-93b3-102d902c4510",
        "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
        "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
        "responder_foreign_model": "AccountRecoveryOrganizationKey",
        "status": "approved"
      };
      const privateKeyDto = {
        armored_key: "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQdGBFWVIFEBEADNf9iYgEVVxHAQ06XTEtx2kpm9jW4kiwBUeJxDEWnUPACEW0Qn\r\n8qA+WAAMeFppxGIjkxW3lyI+TfV0Cclw7h5GTSMlSlIosrNqFRDvj\/q8ghZLAccy\r\n5rcpHfLwHdmGR+S4qzCxfJQ9rkBdZQkde4LpRDmbx1EkFeed1FXwoNuxFfp7cBoo\r\n\/Z5if+mf+6pn1oLAy47PlASYltPvtj\/pK3ZNBatPz5vfBVRjTH9UrdXK8ZjnWypw\r\nACln7pe1vz5mAmNJdpPhxvAMXMx9zWEookYQFCaeOKI9t6t5LX9Vn2wAfHqLV94P\r\n8trrBRHYgAjMI\/fIoOXxcSBEBM98AeJMgMjwQ4\/P1o0bvAhxitNCIgqeLtW2bR4W\r\nG+8SF6ALcZM1kGt8a0DSC9X8dtHpKSvoCT7GgCXtuMl1gptjprzHnM1thhSXZyFI\r\nmVM3e99MC101JG1pQpmyC91KyHPWcwZE\/ugIZTsJQwSjPeLHcGbp+5cLOWArH64Y\r\nVdiUkQ0SwPdB1tsUvfekoNBWQgCNAL9yFTXOsxNM9AsZ+r55kQvp3voMdt49n6z1\r\n9P6sVaPa3+7yj1W5LBIV0stgxixbXBBTnAx19R+23FnmecfHYH8cIiFwJsYWsAYB\r\nCGFzhP9kYzU7Io6TXAZ03LY9KGZW1aRhZTUuY+JErWFYr\/D+9skZ5GE1bQARAQAB\r\n\/gcDAvpdLMN58+dB5Ff26iDBZZ9qd7gqHSfy2hLa+U+M10QmhAugnaAynx+y36GC\r\nhtd1wSXG6mStR9IEDFkgbSuZFGWkXOvvt5gZoKUx6jLkoMiy7VubBwlhyRb6JcjJ\r\nyHJfVq6uVqrxvbUi9lihPat7A+e05b7RoscZEzO3Tc1obdzTaxtvjFWvahT8ShOA\r\n0uI4agFETnWBlm2OcuOMpBYhbft2sKjrfO6Pm4OsV8d5Lx2hfiZQ+9uMsoTNpo2W\r\n+3sAzcrcG3jBGoKM6pnembgc0C9lDfY0ZcAIlXlhScG2pkfrj2I22Gyq7Ln\/oAEN\r\nSzqwwwCa5O9a4\/CXpoRZtAYeu7ldjOXMWRO\/OO3ShOx\/ABJrgPx1QQA5Guk2w5dl\r\nkCc2Sndq508KwGY6DnTzV0ynfpW6ex44PYopmI7bgmAqRc0fqz2E3so2vZ2LPmBD\r\nkeHdt0U407zuTd\/hJ1GOFsLTJZ+ksVOJcYyYQQbScS2Eljl4G9xv2iIQt+xO7w3N\r\nqga8oHL5L2P3BKC7QxzoHyi1h9gV0pGBN0jgTmMvjp1ADI2umewlnNNUCGqpHzse\r\nmY6JSL+kDm0k3W5msLgGtJGe+X6WAQNQ8++OF\/TdVJYzvWbtEnwNkYBjopckLWvU\r\nKUjch6MqrCshdhvoTW5xAz2Trg5L55Lb66b6Ss6KTH+mxgTytwwJY0wt4LUCun5Q\r\nqOTmab5CYmTGifHLkvxq548EfhAV+TqQ8O1BG2uh5qbplYXkYjet\/GSWYoPrSCBh\r\n0qNsha2fijl2SMXZU1mbM+KumEpugU7cQXGwWZVtOlK9KffVvDjJ6UDSNYxdTjMo\r\nAPC8HJuX01Ay6FP1SKi\/RIPRvh5M4VMO7d9OHXT01dPV8i14\/nzNHofXFWmWGmev\r\nIoCtzsW6EkSbCCrjT4\/yzS+ysQbr5j3JPqaSMJeTBLzQevzY3fnjZ6e\/40mCWlzd\r\n3N3Q+V86gpkc7GKfQUOLIzffJ1RHSBfZBLMIWTmd6SfnNQsBX9x5QOq6MBg\/3dl9\r\nvm\/81nsQRH\/0Mh2NEjbE54pkI3OAxrcAd5zqvkT8djT5oiWNkJhhVgK0QSYPcGYH\r\nmVfgZ08tG4GEG+mNg6o9MbWopbMrTAA7pRcCeeRtM2oGtqJZBIGNXXnn54uWLu40\r\nZHpTcNmYwWuUqZG5qc1sM9bBFr7dle3bJMbZ5nS06i91+kRt7RXxPmO23gMcMqTS\r\nTzn4Hdrq5zR0d1c4CqoOZA1IVDYjD\/yw8XmCV\/KmDwshiTNi+OPSbbtiGz3F2DYk\r\nLQprU5DmIICYG0FaMg0CilFUoHFJgWECotI89HkaybnwoZoGHwVf3qx06cPscZ9Q\r\nvTSxoelU6Ve6IxIRJcetYvHdaAhdtTshe1+5lILb6engnTHGtIl4gKzl6Z69rig9\r\nGC7zIeJGiHn47br5c9PXCZNhHtt4c+0NvQqgyVIgKgnd2sdSR62q8lFbbqIbd4vo\r\n9d8+lEdsZF6pHaMxAhYGFABbmCJCdWEQxNKIg6ziAhAgZBmKuKRUeHom0\/ZmUbDi\r\ntzeOERgjgFwi2j78qSjSn0rZnkTYVDPgLajLBO6NIbdESqCbcduF1LoZiyWAX3os\r\nRiMWTyMj+sy4txL+RuBbAhjYqnyh9M+lOFP9TlPyrSt8VpLNo9fVEFp4ExV9VQ2\/\r\nvYwhGUP8HDnxSchX14E1snnmL7mXKz1JRPcJtJlQDOQb36A8LgXS5Zq2jQvk\/Vd2\r\n\/oMu0r7Qw40txGzQKzdctHKDOtsp6Qycm7PabxPD\/xhzR79yRrXuOiy0JEJldHR5\r\nIEhvbGJlcnRvbiA8YmV0dHlAcGFzc2JvbHQuY29tPokCTgQTAQoAOAIbAwULCQgH\r\nAwUVCgkICwUWAgMBAAIeAQIXgBYhBKdUhgw63lqwRZkCXtPx\/kvmHXAJBQJdG5sI\r\nAAoJENPx\/kvmHXAJLuEQAJkxKy7rosbSbzvk7Dh6K8ZBonwJK08YBoaGOB4g1ScR\r\nZYsAF9wYApiFQJ5F4pjqwRIT4SNLuKB6quMwTZjVaG9SC+4I7PW7wSJXiyR57CpX\r\nRx9lHRTYdb2fBqk\/0M2kRWNg+dxOyG9thpTMX31EKPmTGlzLhVZ386dpxt5YYXbB\r\nyuzLpf3OxuQDMfGOrQR8rJm1+eXf+AxWFovTa\/tD061PP+2jRws+ebRhJ8Kl33X5\r\nOj29dCzPwHk4AY6+4QncmLMvfQT\/FzSqoj8yfo20xKyhjddke3nVzzKC1Xk9q8wE\r\npfWS2neFdH6p9egzLl+RPzSE27yB7I3cdxGNhZJqz\/SVXq2ziRkWumtsfpdvbQ7S\r\ny2I2sPQQzhnaFSFBOD78g6P0t7IGL5elHHpLV\/bTq7aPgOURy8twUJSrlEdipzwB\r\n+N0mxoLe30GSYjzMIAk0z6rXkQCRiFV97OfIvMq3Zq9ABH\/tFgSW3gdfaZ8hrfy8\r\niqOX+FwiAg4VGEsb9z5qMwbSLvHC3lt9+5mxfCo4Fkg9NL1EpiObAnTNNRtNHFg4\r\n0FHd10MF8MObf9thyd+omUCkkR0HN16a\/tK1g3lTr5hePGbATclHv6H1r4ZiFDiv\r\nqkGLVDyfr2c5K1DL+KSBCrh3OuXDSNihNyx9iFzW8MDcan257oJVtGf5SgjrUy2b\r\nnQdGBFWVIFEBEAC7y5b+FLndxN3qeQ7jqCXITkw56cYHBfqGz7fc5UNVZLBkmQ7d\r\nT87rFWyl75KUxlj5sqgOUusiPmoQ0W50DBWar5C4tT5BMTrvcUPlIVk\/UO5N7YeO\r\nijezTGYt1BB6AQIJkGeJbCcubOmXz2jC1uuWL6GU3vxVhh7Mjp6\/1ZP8lJBFXgYg\r\nPFs+Nx14sk2KzOlwlHGftJVKiBhrH4bwKMY5lEvRlACaqGLTH80lLtTaSI\/oHA5s\r\n0Y\/VtObAgFrpUXQ1YLTvGdQMneRXRI5PXoSxHwb\/Qe6rUBh7tO8oDDLwDTHyB318\r\nu8iNI5YvS+w69UTMa2He1lmOYwSHArlmkDnvSAQmMOz3NjpYKdHiqYSiwd1khoHs\r\nMb7PIGbQbiy4kAAywgM6IF3IgqdtBEAt6AaK1XC\/cgdN9EpokNMGsQZ0x64TS4cy\r\ntHe9AxYMBSPZzpRXY6sd4+m5xlgsiPXWzbGWGGlt\/bareEinmNDmqybX9cqhK7Ja\r\n5jMBUgqj7soMH+ssBu1SyudFr9iyDDICtqrk1oFwi93zVoO2izEps7UPcEJZ+rZO\r\nQdHBNVH8+EjlEnXLf\/rv7VD5K7W\/YyrD\/DJ+MgxyKhlwNJIRlcNXOj7wnmYgbfPh\r\nyRZxjsvAC7T3JX9FF2R4+8zF7QbP991Q\/VW3hnRbVy47A+sjYwH+CclqKwARAQAB\r\n\/gcDAhoj8T\/UFj3p5CO0XXDZa6dWbhRNxQYsvYM2rE5O1CQ4ZIcaM0VU1OlCm\/9A\r\n2M06vwEW9Ph74Sfcw\/THt0qOkR0R5KK4AC+60nfd2O3O7Vb4HbFz5KLWZCyhBxF7\r\nKMCb01OEXyjR9PUwfNduxl+UwN6MLDvYK+okgOWGqAWLgBpbU1CTwvqLBa4Un5NO\r\n7smOJND3DV2zRtDhUwVRoviR7VKY+6kjEab46nTZEFIxFZr9423yj79nWAykybEE\r\nyLoqg7vI2BJBjlNyRxcI2EZhUKZz4KkQ25EQXBJIqGwxSdE+x8AqT91g4a7CBx+f\r\nwUkElSI4VTBZGuy9a7zxOt2eQ0s79kofoga3Tqr+POx4v7LvuHNKNhwcgxCTcnys\r\nAicAv4dDqYy6UvIDgln9sNB+a\/9mXlUWnvvSL+JNZbrM7oQRaujxUAX80NZaMX7U\r\nDA+Wpa5cpWE0ewiQAnXIYPDqf1qInIyAnVNDnBNuzWmYY5971OVv1Jvlk0xMl7x0\r\nSM2JNKR9ctxO5ySlliDmrebOnKYPPGy9E4qApYryQWvXdlcJCUm0YtRO5Adl+Apf\r\nbTYhsI\/XZKvCN7+G3FecGA1YM9+d+2FsLkFrrRAvqkkVbGKQMxBi\/\/Sq3sEycUry\r\n7UxIfGc0h9Y1QSULbOn1ymxK2GO4HB6kS\/SEOgDw\/PI4YjIpKCbY0vxMfMvVFF7v\r\nicVTxC61AZjIpbZ5GPiX5RKpVcBNzxrQ6+9DumQBvmMDjxoxAg6EtHax1KBs8QD4\r\nnKp8DKDdiLVLSUu3rHeS0S35lu0T\/6UIeAhVIZrWEOTRUZi\/MIbfoJ4Vin5csXA+\r\n8pB1q0TSKr+sbSzsWRxNEHYbJYko64ti+5O1hlDb9wNEBUdie4ObFX0H9Ngsv\/0o\r\nIzCwbSPp3quHTzTtJTcgJOdXcUzf3IWL23PN4DJi+8bqELGp48\/S8i2UTdlrXtKK\r\nPa0evYboB3Oq4jel5DzgT1S7lIT84ZjTQLfL8IOcM30S9f9FxzSmYTmFv\/yB6aKJ\r\naCVLCoQg7oJw5F3NdBhKkyQ27qKno7Y7\/1sPF42FnAtoxu9VLIsQgDyXE8\/XM\/1J\r\nhkqXnnb7x2wUkiLBeQZHVJ\/yKGiyizbexmFe6W408UQ3AC4a53m0St2bQn7vq255\r\ndt4GIvs\/SgJYKD2VAxEvsei\/\/wus5XgHvOWH5NCWXrSY+b1TNK4gnrwhdHPZUZ4I\r\n9uHG\/TGn1ieA1wmIPv1uXtO+C\/GBM1t\/gKjopGXWKZwV\/ugx6ePGfsTfMVeYl5+i\r\nNUGJPPkwqMl4jlzRKJOInMGh3mU7Ev0Z3T+fxcUMcpJVOaze46cQe85EiYugAXCf\r\n6pI0gr8FVighXFZuBS4bT1e25HKac3DL1c5xrC6S1BQRgdPsNEsMfzUtv7tcWJNM\r\ncpqlXC0GkKk+0208t3yQ+qolA4xXudYIp3Mv9PTYSm1mig3uCY0XKa2T6e66trna\r\nvet4cF+WnmpsFbenZZDf\/uGfGxGRAXStF4P9thQTFCboqdCZFL4V4Ph8X7VGCVzw\r\nFQmDk\/r5WMCp+N+EW1p4SkvryZOy4Xaxa8aMSQUEy750ibqEjZy3kML\/xHLrwpx3\r\nHOPADN+g7W1Ew+ZMbAC5VaoLxgS84VyO36CCFOfZn5\/QVWCL03ljrHrrV23BDXv0\r\n0UCBKwFNTkPL4NXm\/j+svtodJ8MC3ASqgJ5vE\/KnLYYTZKkobrAufANRBHFqKoUo\r\nHmWjU+AaSUNZBxyCcJ0Ma1JGEonsDigncWSDxL2OxTi6F+Z9jgjAJ6mJAjYEGAEK\r\nACACGwwWIQSnVIYMOt5asEWZAl7T8f5L5h1wCQUCXRubIAAKCRDT8f5L5h1wCZ7f\r\nD\/4jmmppbAiFqFoDH1opIqQIfTP8X78WORNqlhYQx6hbp6FWWLl3mfz1\/GUa4YK+\r\n8K75Ol2JYrWx1or6Kvc\/4HIV9ZfsY953Fh+icK\/FSUSlk2xcY+mL2zeYFI17JNas\r\ncdKC8VQCzyDSF0bqhWSUaRB2xOO0t4wtVTfhtmd\/yTnKGJlwl5ceuhAPeQT0cUmb\r\neuR1hAP8zcqsEdGWpBtJp7i9eeAPgT7DXDNSN7h3wc5hmwaVtZwu1pm+POH2ZVcy\r\nHAFLAaHdZ\/pyF1HFZ61g\/M8Kj\/we5YWKadaM2\/PrxdYSAw6\/wSTZWVueq70io5SB\r\nE5Kio1giMTgfQWpp68cXpphFn\/Nmg6LI3RpoMB62KX4AzAK7Z7Gftn1QjhoIJifd\r\niND\/M3\/agoklhoNP\/Mc3+EkuU31OHzIyFansR4jil9HIum0Dl+VXykWjzF9NJY2\/\r\ngRM92hSou\/5YIMUgeb0yaqYp7Qm7NfNqf\/A\/WUw1cihFUCCNCT6\/lXcBDtZptMDK\r\nuoiHts5SjPao6qtk7kZrDUu0FJ4oxVNo95W35fS3KRD4sFU0SB5EtGlHP+C5\/iGj\r\ngFKLw0jdIy8AZm5e4B66fq+yUIDxECPD+F44xJ3a4NF9uB3ZVOAABO5yOnWXhn\/C\r\nBF4+ZP5A5CDEiZjLZtnl6SWXD2Bg1VJDgN9IqA2NeH1WPQ==\r\n=G+S0\r\n-----END PGP PRIVATE KEY BLOCK-----",
        passphrase: "betty@passbolt.com"
      };

      expect.assertions(1);
      try {
        await controller.saveReview(accountRecoveryResponseDto, privateKeyDto);
      } catch (error) {
        expect(error.message).toEqual("Error decrypting message: Session key decryption failed.");
      }
    });

    it("Should save a review account recovery request if approved.", async() => {
      // @todo @debug @mock the fetch for save review request account-recovery
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryResponseController(mockWorker, apiClientOptions);
      const accountRecoveryResponseDto = {
        "id": "d4c0e643-3967-443b-93b3-102d902c4510",
        "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
        "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
        "responder_foreign_model": "AccountRecoveryOrganizationKey",
        "status": "approved"
      };
      const privateKeyDto = {
        armored_key: "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQdGBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\n\/gcDAligwbAF+isJ5IWTOSV7ntMBT6hJX\/lTLRlZuPR8io9niecrRE7UtbHRmW\/K\r\n02MKr8S9roJF1\/DBPCXC1NBp0WMciZHcqr4dh8DhtvCeSPjJd9L5xMGk9TOrK4Bv\r\nLurtbly+qWzP4iRPCLkzX1AbGnBePTLS+tVPHxy4dOMRPqfvzBPLsocHfYXN62os\r\nJDtcHYoFVddQAOPdjsYYptPEI6rFTXNQJTFzwkigqMpTaaqjloM+PFcQNEiabap\/\r\nGRCmD4KLUjCw0MJhikJpNzJHU17Oz7mBkkQy0gK7tvXt23TeVZNj3\/GXdur7IUni\r\nP0SAdSI6Yby8NPp48SjJ6e5O4HvVMDtBJBiNhHWWepLTPVnd3YeQ+1DYPmbpTu1z\r\nrF4+Bri0TfCuDwcTudYD7UUuS62aOwbE4px+RwBjD299gebnI8YAlN975eSAZM4r\r\n5me1dlfDMm47zD9dEmwT+ZwrGfol8oZoUwzYsQaCCmZqaba88ieRAZY30R\/089RS\r\nhR5WSieo2iIckFTILWiK\/E7VrreCUD8iacutVJqgRdzDgP4m+Zm3yRJYw2OiFe1Z\r\nwzD+Fb0gKDSB67G0i4KuZhXSTvn7QjqDWcVmgDTcTcrzzTwveeeLYe4aHaMUQGfl\r\ng+7hsGSt5on\/zqrU4DCQtUtFOn3Rsfyi3H4Fi9IA1w1knKVJ5IsIoxdBnRDvM3ZK\r\n6STr53I8CIJYB5Jj0cZuJ97pQ2YrFNbP5rgJCEnGwRuCRzlgaVeji+g27pZpJMJ4\r\nMdxAAw1AYo0IOPoNbuts5D\/5u5NzeiXxdQn5i\/sfUpYWvVJDnYPpXRT3v4amUpx+\r\nNIE5rF2QoHgc0wiw4hpqGVoin3WycfvlbnsHFJoR1YI9qS3z09Ihu\/NC6TejhgGf\r\ncJyRY5ghTvbqjCJmKPya2\/TfvgYtZmQ7toNpAL4VlLKDE55qXmqVbDo0cCuDnXcK\r\n\/gidC9VEaOxUb3Bxx0GQkxfiEhp\/S\/ndxLgyeG8otkGRat6aVjqPoAWj4Eu9w8XV\r\nysWPDJVv7hZ6rEm05a7eqQTUFg8PHw\/PdD2CWWYPHVTB+T9ihLwxUHMj4j6Uwvpy\r\nm2QyIzdsENkC52KY23SWNFE7WjdQmOS8ki1arVNIP9vcmh7nHGrRwPhmFTeTYzM1\r\n3jERti8DtvVyqnEf4c6CxfupOKLwRXvtJM9vhgFBD39oP\/bPVMee8R8Uj0QUM1ah\r\nVly3WEZK2enFqa\/+ChyZ1IOpVm3o2oCZs\/SWk\/FFsqOsdqJduI\/xbk2YG51FI6bw\r\nv2vCXx9+B+VdjDujtwyTpsy+sy2HqTv+SvYMuMFgpkGa7JDa7iuYqZg0179vEoJJ\r\nq2E04GSsjpg+IxddtjqMsdM0eCCgbY9QgnMxF1GA01Ij\/JC4H8g08jNU6RQ4KUaV\r\nmwdZvR8BhqNR6Ecx6BfzC415q+klaHf9IiPMFCxy96w\/wG6tGzS2tsczejtDoXmX\r\nr8FO+eoDWgzd5uO5f+m1G+dYN4RGUjcVAbC3oePYr3X6oXxu6Cb7tWFzu0ttr2GE\r\nRFDNy4zeN9UlUbbHGiylMdY9NsuGxC58oBgtHLsAsxlbw1oQvpXbBWZzfRwowv\/z\r\nnBdfEDm6JoSUnv1pyhBrM6sItolNaY244FKBmVW46T8U6+sOLSCRAKbKF3BuV6iH\r\nZsCtinXvN4asQ\/vUepuS59tPhSmqTSIAK5SCg6FDH\/tSOxrG9q187P190Nvc2Yyh\r\naolGQmHPK3mkc829sctNIrUJuAyYB4+WXpM\/K0x0u0\/GDJsKW26BZvi0H0FkYSBM\r\nb3ZlbGFjZSA8YWRhQHBhc3Nib2x0LmNvbT6JAk4EEwEKADgCGwMFCwkIBwMFFQoJ\r\nCAsFFgIDAQACHgECF4AWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaLwAKCRAT\r\nU7WxXZsFT46TD\/9v89FVPPT+GB1qBxU1g+f+VyUMW7DCpqfK9i7rLowCItWfoJS3\r\nF9TsYfZpLBlKvsP\/jpNKUEe\/FW82VhE4zHuh1suCrjs4nF9QMbk4+LstmCy4TzOK\r\nMI9RFlNm7bSb6tq2yJ5XTOKuL7ElXT3EmuN2Rcd1fY+uRTRh4nGETnQm4xHWt\/sQ\r\nd8KnjmdZtegzgf4udp0YLXNIdrVaFImR5pjD2OnWCH3cEoPz6SZSubpwoSPE3nhi\r\nmCMXBJ0DrRv4FmBdsyADfuA1AKdliOTu2hpAKVRuosxpDEc8iMRMH5mMk0o5ifvj\r\nQ3YtNG0KLeKitpA2BdARTu1axcZLS24ww3vDjJrUjqxhXd8K1+LJcXB+5ieOMbOf\r\nmFe1OOI4sn7aR3Lk6Y1lz3Cl\/oikq\/v8XZFTAuwFR8fiid001exx2QHpmiPUfG3X\r\npOmQedisqxJa2g6z3QmeXBhseeSLpH+B6RhFJFKkP\/JtJxANEBJDRo6FuLvVa7IV\r\nstkX3Y\/WYQrkYicl6IWMpqJ+8nwX6hqAj2GJhweBfqCGS1o+sA1rYN46OZ6xDRaM\r\ngeKvMUrHdq9giQ4XAqny\/opPPKcARDxdSpmaoSE2MSBUocfSDewL4QJn8cYsexFE\r\ng3WyJickZqGuuQ2zuUUjktOoHIeHnZuKyZjcAMt6bEfpWir4OiS9CfgfFJ0HRgRV\r\nx0wfARAAwVZm+WzCgL50QUhIGEkvPRelNHkzzgwKfX2z8guOnp0Y9sK+UZxPk6X\/\r\nAvjdPeEwvxvOrXwxEaCTOHCwGRRc74TuNV4+O4YW9HBLlb5BjAK4CbAOKMN0yGt6\r\n\/Wat1UrrW\/\/ZT2S3l9oRNbxkhgi8BYtrD+UwdtWYo5rflkIglZw2yu+iujaQZSSU\r\nzo2rUlDJT6m4Y8e6+b7XLBnOkAfmrnmkyB8770mMxTdcWz56q\/otXID9jpPtkrUf\r\nyKdtQ+b\/bqxK+ZixP\/jE1WiwL+Fr2UUQBqzP+ttWDu2F9+N7gtY5ckGjjSIFOUew\r\n1sIazkF80LTCXvX0kMDhXybCEYic20RMKsbCDeYGUOuTmNisOrkgxWTJfhnpPwV3\r\nZ8seZSvaQVzi8L3q0ZAaE2tsBr8R5oCRYx4XKn9g5bRndfa3PkD6Wb6p68lncdxB\r\n37txrqY9OthJVVeFyXBKTIIuWFEnATBLGuf5rZlOhg2i0uzW4TLq04tsjKEUFA2x\r\nHqZNra22R3\/z3An6v2ztdgM7KJtNDJQaA5e7\/SXUrSNNEQqUL3XAqSZ3D+UmSNkI\r\ngxz8pMeIHV7t\/k10W3HAStOgRk4tW6ainQWNGrMehdkhH04JIxTNSYyykYdqUTvU\r\nZ\/AH0OQCWC+gk+iHKKKkn89rDek7K1mdv\/sD8+hFKMQuAM08mHEAEQEAAf4HAwIG\r\nvhenLc6sMuTV+xomYhFDNmDMH1L9x\/8WG+NGjbYEIO0ezLgMizb7HlQVR4pPy+Tx\r\nxQDu8cZEtkxONaI9DDKTjoTD0UtKhELNM8HeJ4SljDbdU76z66BoBf1VIUocGbx8\r\nw6cjaPCALZf8Jl+3YhvJjW9NQcq9WTg1bU4Dga4C7sE1\/1fSK6DR8jKDxkf+zCt9\r\nHAWNtGv0P6IQEVB852M2O47RZkrJS17vBCsjEW9WGfa+i6tdSxS+IDshm+o6PYUG\r\nqUsfdiiRosTM10q1V6bNu2XKNOXvDzfAJPEhacbkkBpmfOhdc7okPqI17cLf0Mne\r\n1pJHXIZxUVUGisPS+yGoCPPuqISC9+EEZcBe8aCwyu4qWvTkNfwZm4SqFd0PiqQq\r\nU44Mf4diqbV3sQKQ3U+r0iZdCTQDBy+OIsmjJWPEvspC7UkaqsPze8eSdYNHB0tf\r\nqBdIidWeJ80131KWBMuweb0lHdxbiifxWMohymgj6mQf34w1Ffslak7c4ABeRTKR\r\njUqmX0bFp4KPFvyLSiArV7\/ohNn14sLq+HV0Kp19fGb8zh5E4x9LAHi0qd4+AcqI\r\ndQMG03XMF0Kih8dYxwIrcze6EmpzYSw5xms6fFangnf\/bWhKchfTb1qCT0npbPOp\r\nON6s3DE0vIdgnFOdxGGGWK0IRckOzf4c7NAMrtnSsuff3ogi25JvAAbxq\/XoCiv0\r\nGXiRJajREv4p4RXkIjZkhwOdMK+ovV8fEEHRyLTGyzx\/0Sv48ebVLVFf2iBW1t5o\r\nEwU2ElJmeMXbLRtFu8KAfr0hzIHPRjEZcQHBh3JdZOMHEwTdVQEeARNpQM51IZoP\r\nYiHRWaYE3XneotdWE07y6Npvc6eigxTy+cTHY+tafKHyNo63HGxhT+E4ZETT3sRn\r\nETkqjDeuaFQgpQmTlK8m+pvPT9CqgEPKSi2FH8bTPXmyO0i713NrBExzpHkmc8LH\r\nRSiXn\/K3Hbw8KQ+aNpMwFF4v2X16gQLQkDCO8PpKwpa9cAdw9vd+J+Hd\/NlEC6JR\r\ng8H7TPcVqtz+ucjW4v00bvoqj+RTWBDv9veUDrQBR862x9aX0TxqzaNr0z9dfpM8\r\nGpGzCLkqMOcqR7QRFX\/MxE\/Vf6wZRi7YvoNgLaikQxLAOfV9quYCcHio3e8AIsVk\r\nDCWeLzdu\/PZ4q+ubdxoWzM4BMHoo0FfBGqp0\/vKwwv5T3HbUpWdwRqqbQCsA1C1a\r\nzsIixUp4\/LkfXtJgqt8AYRMlEBOSM0QCJ1gpTO0+cjdQGgjrUtc2\/\/AhnQLhP4pw\r\n7hncQMR5lm6XGrKoNsair15N0R1hYS90NTi\/4zLQ62+7Q1SDveOKxuXgmGQsG9+p\r\n6GfHwClYuWMAF\/Nxkj+moEmJ39b2qrbO7fCU2ttewjAJZLYr7CN8C9nLTz6YC4by\r\nopW4JsEcHU5979ckpwMVaY8EqMi32NueKCcIj8rYKSKJ4vUyqgjXYmfd+jMrc5F\/\r\nDgSWqTe6xt01X\/nBWxWBlvAWwHJIqt0Toj7IizNS0jBcrmwu+4hPQHN8y+xAXxtI\r\nKzeq\/tcuRz30Oh7zA4vQOMB4ahUfNZlxVMSJAkr55Jwy9ZC4RWD46EhbmBgUSE18\r\n53y2vzihjWsVJvgAQCRrE6HKVvF0EE0PO8hUFLuVpdLhnGD\/xzmFYKxBpqj9IOk2\r\nqN+5UxfiQ+ACE5+WOlrV52ux2D6jcKPFh4R62I8l9zWvbI3rR+FUC3JU7dzIffyj\r\nSg+vmujAqvXwDwRHzdRzZ1u5Og3A3PqEYDtW4dfUmlwMTqd+iQI2BBgBCgAgAhsM\r\nFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0bmj4ACgkQE1O1sV2bBU8V9BAAwDfZ\r\na3h4BL7JeCSvPSasAS47xnlxkzZh7H3MwkywLrVXXvi39KgAgISoRtCfDpq7to1Z\r\nFKj4ZEXGk32jyqKU9ilPBn4yrrgJSfgcx+6FKv8Mu9LdobIJQGAcr+MtHpsJxshQ\r\nvFTcNhXvlopdsuXfAyPFxxqdGwF3oY09ku\/79ZRMqXoohDW4QJxhveGcsMMIptEZ\r\nbcjSlzoBnk+Jq6GMQC9M3k2l\/fS3Ifg6smng6veIOLH4QFbxk9iiQ0\/Ob0d6DWwd\r\nFOcJWyj2vm1JfAqJBA46qw5nWTjrP1DtpnOOVd1+UTUbaTWTARjybMTikBMRDmZ3\r\nDlbGO2ai63nLkfFCQUJ4T3dWqM9xwiaaWjyNNriDVskC7AqIE3\/p0Fpy8jfai606\r\nK4moTXGZQ37iQkVSk0NYMNZZEjdyGUUpAbkWEXtOVEvguvCTChz\/tVzCjIEDNl0e\r\n6+J6DCSi2lVM3y17jyFh9sTXYGF3CDkkY4gDZCL+Du5VjMV\/bw+i5JYo63qTJeeT\r\nprtG4Rea0Z9lQLm38SoSbNHkJ+vfjVmlVKzTENO\/JxfvBik+rx99qvYvX6Vd\/F2J\r\ncDPahGtIpecH60sD7g3eb5hoJPQDpUhM2NrxNZL6e5RLdU3W92XwGozzDtyKL+Xc\r\nL5tM4SQ0BxaO0hYuYx9D4JOGwHfRwZgfLIqMS+E=\r\n=9Gmn\r\n-----END PGP PRIVATE KEY BLOCK-----",
        passphrase: "ada@passbolt.com"
      };

      const response = (await (controller.saveReview(accountRecoveryResponseDto, privateKeyDto))).toDto();
      expect.assertions(3);
      expect(response.id).toEqual(accountRecoveryResponseDto.id);
      expect(response.status).toEqual(accountRecoveryResponseDto.status);
      expect(response.data).not.toBeUndefined();
    }, 10000);

    it("Should save a review account recovery request if rejected.", async() => {
      // @todo @debug @mock the fetch for save review request account-recovery
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const apiClientOptions = (new ApiClientOptions())
        .setBaseUrl("https://localhost");
      const controller = new AccountRecoveryResponseController(mockWorker, apiClientOptions);
      const accountRecoveryResponseDto = {
        "id": "d4c0e643-3967-443b-93b3-102d902c4510",
        "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
        "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
        "responder_foreign_model": "AccountRecoveryOrganizationKey",
        "status": "rejected"
      };
      const privateKeyDto = undefined;

      const response = (await (controller.saveReview(accountRecoveryResponseDto, privateKeyDto))).toDto();
      expect.assertions(3);
      expect(response.id).toEqual(accountRecoveryResponseDto.id);
      expect(response.status).toEqual(accountRecoveryResponseDto.status);
      expect(response.data).toBeUndefined();
    }, 10000);
  });
});