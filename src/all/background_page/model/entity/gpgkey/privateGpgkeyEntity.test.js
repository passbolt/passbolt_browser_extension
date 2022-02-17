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
import {PrivateGpgkeyEntity} from "./privateGpgkeyEntity";
import {EntitySchema} from "../abstract/entitySchema";
import {EntityValidationError} from "../abstract/entityValidationError";

const validDto = {
  armored_key: "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQPGBFwOKS0BCAC+co6QH6A8IAdDESHfFZGHcVe\/PdU3EGXlQOxguyMTFQBinGZI\r\nbnuNuxFRJmqjkRor0N83zBS5OYyRB0uGFt4lomsPE7gYwFj1v\/\/3Zd3OOLskA5RW\r\niBj6djhoyR88ZReIgchjTUaH0h0KzUOSSrTT2t1\/D3BE8RMh+xeoD6MN8M282JsR\r\nWiGVA8iWehrYE7u2RY+m5InlwmVm9mplKyHpew91CNcjaZqRiRlH3wdUgzj7fvx6\r\ngvCDbCO10f39KS5959HGM4rbSs0A9+I+Yf81Zcdv4IJgvK8r9ARi3Omk03Tfp1lw\r\nO+hN8kpOrJfk8SSdMZBt+rtEHv70GLXp8Z09ABEBAAH+BwMC3ojn6Ehp33b\/wFH5\r\nmqi1zSJBViLQT2hzN47lEfrxIIHvIxmYG9mdfTC2Y0bNqHSK8gwdBGNAA23e1qHZ\r\nF7gjk1XeYknA0pGw2iOVt292NsLK5RkawQIE2RQ3EjO5kWtWjsbTqskgREf5YZb1\r\nPTP3AH9o5Qnl2QbKydbY0mINJolasrh6Al0rqbTLSyKkvG+Poxo1eo4ltnZMXSjb\r\naMr2IFt0WJkj+9B2g9zndnGtn1xlN5hvyAc8s7EULE6XfvMpxeU1BDgI\/sYarxfU\r\nJwYRokmlIAOymrds6jwaIPCLEL0B2\/sv2GU26yNi6pMZ9N1OAomH3XTHccAtR9No\r\nis1YLuw8hJuxIiFS8yKKaQ9yX71MQrTdzfjIC5RQ5djrhZIKUMPXzb63aqadqHL8\r\n6KW8r2WvfSTkfYI864YBnzGFF6opnKAJ2o7RZveWuh2RRxouahU5IleyMJWZ39BC\r\nDjm3X4a7jfAvWKlIxgxMATQvrYmO54L6MpNAi9PbeDUDORDBrCanItvgErjmg+YX\r\nXrW3rq0hg02NZWrZwouSBbrrmxnOojgEhY9XIe+4IoGKIqbiup4RzwJkIhhZ4O+Z\r\nmFZb9cKE2jU+R9FmVAUiZb3Yr2qGrSKIIgQUBMrCPqBgj\/WrPiAN\/8EDB5ObZYt6\r\n97FVxpjUuWPCQRJXiNIuwz14W9ugGTmph\/6Vy7bT0rGkVMN3BfD7fwmjUHYR\/JEl\r\nr7eB+Cm9OWjK0eF\/ADjeuQgerCpPw194eUF2xIODPbmJfV+sxXouMMBpf6\/XrTCt\r\n45WvxLa57+9GHpJgIxQST53EREIWx94B7Msxh9eLfRiajWGv3+NBQ3MS6j5D59x+\r\no+5mjdkG7D8KLq86Qn0KWuDzCcmg73uz4kHWuIDdLr5n053RXqw6SAuCauEQ4i19\r\nNjH3reVZ+3XVtDFGaXJzdCBuYW1lIDYzIExhc3QgbmFtZSA2MyA8dXNlcl82M0Bw\r\nYXNzYm9sdC5jb20+iQFOBBMBCgA4FiEELQM6xreHYrjlSrrMdOn74WRD7qIFAlwO\r\nKS0CGwMFCwkIBwIGFQoJCAsCBBYCAwECHgECF4AACgkQdOn74WRD7qKLfQf+Kikd\r\ni\/U2\/6l1\/hd+HPUDoakqTitLCUm6kRfJtFGUyjIGVjJF2+DaKl8a8gg75hlKYPhO\r\nX6aQInr\/24R5qEm51A79bHAfSA+WCxd4gyqAX+5r1EYaMEN\/R9Rfb7GexAxFzOwr\r\nMVSzgiM5sxTs6P1KXUS53uT7O4CykSYQUvPNy4IF0+psys8BkTjfS\/ArnEeYHICC\r\nDW2jNst0NGCxV+Qh92pBomHrjYIDbU\/sgnyAta3KPZUDmgzdx0jUexJCPJb5xPnh\r\ngJ9DVe7TAsjL+1CZMTM+WnWJelyVa6sgwYN\/adCZZnLNVgS20\/okiyjICg9Ubd8g\r\nEHkgXi5R9i+dHlLBaZ0DxgRcDiktAQgAwkC8+bFzB8ID3yEFDSr\/fzL6e4tVdqJH\r\n2SK+7aVui+7bM+\/ZrtBY93nX3cvseQbKUYFmOwC+KuRr\/F4LxvklEbnA0yct4KlZ\r\neiE13SwLxLOf03vQQXj\/02Xk43MuY58pKRNJQxN93Te2\/9zEDLpt5W2y\/MBAWbwy\r\nje7HHd3WNXkpkh22lW+RmnUu5TLOhFFf08yrxiWASN2ZrHgFNc4KLgnHBw6tzaJl\r\nEpuieY5mBHnlZgBd6gdsQcl3zAonzeTWR27g85XXSKQLhIzhZ18YkpFV7CyWjAte\r\n8cs3efcx5wsPoc6uhQYKO6Pn\/Rw8NyC+QbuplT0t1YW8Cogh\/mbdBwARAQAB\/gcD\r\nAr0YALyuZEVs\/yOuCAZXNOZVAFgIZQihdhgRh6cqN0HCrwxWXtLJ9JPKUuZ0Zxq6\r\nd1Z3pqcIGCEAFUkxkh0rw0QmAeIHVNnq3uEXk+yrEi0LN49td8qjEdZu7GCIdCl+\r\nq3kCxC1nA6MFenWeI47DsBzXgvcidPBKuTHgcRU7kFYyTtlWvT+aboAYchH1TZ1Q\r\nY6v0q3kmSLMt\/N24LJkaBD4ABeE9\/GWnj2\/Klevl1Xrt7ETXbEfQxA7j8JP\/EpMo\r\nLx7YmLoPo1egamzava21xdQu\/CC5kSjZ\/5RcxHeN9t8LhSnaVyVZXAbUzXwUixq1\r\nlvjhT70MWqF+uHsd2veUiSRl1k1wKMz2M\/7I4Z+APSrSwVyteQ3ic6W\/s0Ksw1FA\r\nJwEOjnHYz8R\/k9EosBWRd8+UruK2Kqqz5OmIPk3flk1SV4UnpeDWTcxlZj3r1RDf\r\ngISA5SZPmiuXt4U1tdDNwMNXGUUsH1xErBWj\/q7KCHdGOv4uyNcX50sCMRV+WuFg\r\nw3Cgk9q8QMx7NTIGZuiL+hLlnTQpjvcWzLak\/C18OnTC6+7i03KsJS0qq8b3Q0OT\r\nMuct1Fi0aUkpvqRpAeLIao+ovir7U\/7GGO\/P6LPJeLYbj1CXPt8MAxMEvE1qBldp\r\nszJmMi55x1TUCTCMmE16qDNk5JyPSoNC81OTCu1\/N6nBJrDpOFEjM4G+Z4Tzh3G4\r\nkS9b2hCGrpLiJCT8IkwxaCcViIAc53FuBFY13NEghC+sgEmiZVMbT+AAC0Sf4deS\r\n2DKzBovxffSuPYHmHdcjFPd8TVlAyg5TWrTauT8MHYsud6GPPQXzJgfNGJlGooyP\r\n8B6nM34iDvmInc7+8LUH8LSQsKocnESmUsO5s6bf4tnNo1tGD\/e4OrXKMGDOrmTj\r\nDPlIlUH2eGXLyAR0QW94ehS2\/Bun5YkBNgQYAQoAIBYhBC0DOsa3h2K45Uq6zHTp\r\n++FkQ+6iBQJcDiktAhsMAAoJEHTp++FkQ+6ilV0H\/1uHkClUMrNR+QeWC\/nzteUS\r\ngXbLJyyvh6flgL2pwWMrPJ1JSvMH28yPq6RSkWvKCs\/xpE7YXT0FnWimzh\/XIhxQ\r\nlLSKrkdrysQx5nwb7YHH+FPxJa25s0xsyGuzPyv7007RmkIhnF7uAosFyptSfuWe\r\n8k3dHMxkB+CSfncNvTMQQ1lm3ur\/RawVKitQ\/CrucZK2iQhkGoYEgIYk7RIHS+2T\r\noA2WOmNnbej1Vyl8wEbrydn+LkAcRrzi8fCyGaEiDGNhG4WrCMz3DnsxuR78qnQV\r\nUGCxbnuK3Z0Ns4BzlZpXPZ3+ceWFxMOV0pynMahRjYTooBYYX0sigWdVgaZbg5c=\r\n=ZVIz\r\n-----END PGP PRIVATE KEY BLOCK-----\r\n",
  passphrase: "passphrase"
};

describe("PrivateGpgkey entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PrivateGpgkeyEntity.ENTITY_NAME, PrivateGpgkeyEntity.getSchema());
  });

  it("constructor works if valid DTO is provided", () => {
    expect.assertions(1);
    try {
      const key = new PrivateGpgkeyEntity(validDto);
      expect(key.toDto()).toEqual(validDto);
    } catch (error) {
      console.error(error);
    }
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    expect.assertions(3);
    try {
      new PrivateGpgkeyEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('armored_key', 'required')).toBe(true);
      expect(error.hasError('passphrase', 'required')).toBe(true);
    }
  });
});
