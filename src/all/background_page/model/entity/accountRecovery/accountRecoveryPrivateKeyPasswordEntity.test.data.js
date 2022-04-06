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

import {v4 as uuidv4} from "uuid";

export const createAccountRecoveryPrivateKeyPasswordDto = data => {
  /**
   * The Test Account Recovery Organization gpg key is used to encrypt the private key password.
   * The Test Account Recovery Organization gpg key is used to sign the encrypted message.
   * Clear text password: 3f28361aa774a5767fbe70ecd09b2fbbf1d5b4b493fe171089436bfa6a2eb03fe630fa9f2483c59b68e20616f1a7597ff8d058a6f79d228a4181d71a61f80d98
   */
  const defaultData = {
    private_key_id: uuidv4(),
    recipient_foreign_model: "AccountRecoveryOrganizationKey",
    recipient_foreign_key: uuidv4(),
    recipient_fingerprint: "28FBD1034880416B2B8CA75A289BCE03F3C0893F",
    data: "-----BEGIN PGP MESSAGE-----\n\nhQIMA9FTFjWeSbtEAQ//aWo0VAVJiWd2yzRRbslIsVx6jxVJQXn6PLFZ6nDKgwoG\nrr5nBhWn9FWAQ3FFdJi4XClJSEoM6scYbpBDbTMWkwnd2Q3oNxUZ0krOWihoQwuj\nOM+eemybZava/x5juFysdlfIPNDLih8A1+bXKnTrEMMsCgqsAQwq0UkmNiOk45+U\nb/NqU+CgX/JKFlqFfpWd+pFgkhkAZLbphd7Spt5S18QARu2vHjVusi1UMN+h4YHJ\nAaBoH6XJ6fL/d5Ol03+RVpMaTjgV6CZpdlzxjWJx2QBQkntSx/5vhnizzkCvZ8CP\nzul54bdN9B8Td/0IqHWukgg7j9Eni9/5WyHK/NdPrc+O+nPDnmv4+FZMxJD5uuBN\nv68yQGmhjulovRcW2vVFY/bgyQfE2NYo3LoqE4T8ClNKKZqqZsF/NzOqVW7t0BMz\nVaYmNcDC6Aqld/NltImJzYLWywwZuzNbu/X2Pl7ZifFQyNOv7Hh8p4kIY1qS/FPu\nVkR85mRLx1DwIeCChHKz5BwkwlbghK3zKx9l3dH7TI5b7pSrC7PT8vMB80L0OseH\n6bG192l8PRtlTCu9jDNaxCygbiRoo507TcSh/L6+GVbuG/EY0rICoV5OsXbHyce9\nawdaTXO+F1RJgBAFjuuYJ7D4wp5MuIYqsWGRGp1N4vVbY3KfwnDVyfc9uA89uunS\n6QHN52Ny+yuQvzqEMYgPbU1Lmn/KYMJzip1cCuCUBvY9jV/cTTEFwpoQeWQAMV4t\n5GV9UqUki+a2LrgFBLWShka7FqTgHX+b4cjXUHapWwfvhwy5eVtt/hQne7VnpDtI\ne0R3wJGzw7BRNvfUGA0IbFVfPT99rVs4NJyANSfFoKwbS74pewXfBJephfbo1gux\npFnq7k0iCfYfwE3OhRQbDyZLRJo9wvTnJ70RF/cj1Rkso8DkEqzBRANpL5H/JKE5\nTcOpuF/tOp0GG7ApNn51MOwDBcS1XYSWZ74yiuJwe4Y0YHQowfR9cwG6lOenl8S3\n0MjMZWJQm8yTqSDEIq4Kzyqu0oW/25v8akSaAY1i/3uM+jT6jyEaR5KdF/TorP7t\nEhc/Q9ufkKxFlY89EvM18LZCWa1nBwkm4EvRFCxamZe3knjeiL/uCz5hVj2XaFtR\nz1PhqZPCtEg8m6KpNSP/oSIdWSZHKqbAy3HmngrubC7OXfthfpr4Flf/VeeMmjeK\nSW1zNAqmDRhzHfKElFkAz1CPij5IjUHSqpAxlnUVqRdbzWx7KJigu+wLKRrcBuJw\nMQcDRU2KeyjKEO/qyVesGtqL4TqfBiRi3jbMrIyNNSkbfZQEanxKs3LXiAkuov6s\n51CSA1PAzvCCKL5jE2oHWkGG/O2L68C3UQszjtXpj2frwE1MVH72/eJblldQrddM\nx6dQm2MydUZ9eINWxHipXzFQul+BdwqkVaoWEj511hrn7ZIbGnqkGuhbrP1F7K4Z\nT0LBpGBdbWGrYGPkS/r/72BLdxe8JPrDaAgKku0l/GZBLNG+BGI3DJUrWdt63IGI\n/HN96q5auFPcnJYniPROgrdW0YfgHtyFwik5zfPYIUEcn0y3iTo5LvnHwIT2oqDC\no9YyfLCQaAp/3Ik0+Ve8WmT3iUjqveKDaS5H/xifa1RXhr8TK3ELvZVe95G6IzH4\n2ExBCFxs0IhcdZV+CEIim/VW3lIcKamDBpiD1w+pD3OhNxW2YRvG3r2ujGHeF9E/\nK2+AdXjdfOkGg/h59A+/Ug==\n=369J\n-----END PGP MESSAGE-----\n"
  };

  return Object.assign(defaultData, data || {});
};

export const defaultAccountRecoveryPrivateKeyPasswordDto = data => {
  const defaultData = createAccountRecoveryPrivateKeyPasswordDto({
    id: uuidv4(),
  });

  return Object.assign(defaultData, data || {});
};
