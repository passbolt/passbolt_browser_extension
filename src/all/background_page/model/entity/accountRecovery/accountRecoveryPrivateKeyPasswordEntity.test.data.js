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
import {pgpKeys} from "../../../../tests/fixtures/pgpKeys/keys";

/**
 * The Test Account Recovery Organization gpg key is used to encrypt the private key password.
 * The Ada gpg key is used to sign the encrypted message.
 * The private key password belong to the private key of Ada.
 * Clear text password: f7cf1fa06f973a9ecbb5f0e2bc6d1830532e53ad50da231036bd6c8c00dd7c7dc6c07b04004615cd6808bea2cb6a4ce4c46f7f36b8865292c0f7a28cd6f56112
 */
export const createAccountRecoveryPrivateKeyPasswordDto = (data = {}) => {
  const defaultData = {
    private_key_id: uuidv4(),
    recipient_foreign_model: "AccountRecoveryOrganizationKey",
    recipient_foreign_key: uuidv4(),
    recipient_fingerprint: pgpKeys.account_recovery_organization.fingerprint,
    data: "-----BEGIN PGP MESSAGE-----\n\nwcFMA9FTFjWeSbtEAQ//VSqqOOI6k4fKpaoyV+5meMIkMQ5xjBDigtwMA9gt\nadSaZLpYBRxtY7ZJmVfDwzd9xHEXm1leAkmdxEGdJnjHzK/DJPncOhGUexXQ\nSdLv6SpiieWKI15wvETT2xRylmvg6YqhLQYaFRfU3UO5AT6hywwExy/npvmi\nKmlx4ICdfaEYI1R16b/K3JjWFR4ftKrx80831JpQ6xu/QGNx2FS5ipZeCfcq\n57M6U5AeR/mFFn68zigwSYPzs6XzmI8epQd5pC+O0JHTRWDodi/MIZ23Vow9\njU1ESpFO+APXyzg5Fo9J8vk4Fie+HHRymKIHDp/U113Ldd/X8ZNV48F0X6/n\ngg/zO7nxkkNN7mW9VjMZekBI8SEnw2kHO9KtTzTPAjncaYiJBcbQDCHZM9cr\nHV+v3mEI7n4fYu0FusmDQSY35t2U+nJx9Y5piPWXwHtiBK4BaKTG5Dbdoe9u\nV1MW9IK8JPPXErIAzIFA4Lpfgz5erwczRmD01uBxb8+a8fEsiZ3xGJz+1+1b\n+1Vnpf/Ihkr8m0jnkxGk/ubnLoe8RzTFsi06Uz5Raumw5nbbl3MEwgwXGpeE\n7Ov/hYJqObUvJ74HTSgC3QtBu4byJyvRAk1Jl64Fkgv0Y+tk+fWOc6VOSJR7\nYqOyIPDvBa5YUtkK9PF6vDGU4F3p7eeey5W1hqVwXQXSw2YBMNavAynVq7Rg\na7n/R7ia5GH3KpvYGhHCPuP5ciI+/eRMa+xj+Zd30u9ZOkAXgnTACCUdRmia\n7cbU1qRPyXahpmMn3Z71CoX0Nj6hecOmw4F43DynXOPtAzJX9fypp7IFLduS\ndRAgE8SYg5Vgnc9iNjhP1DNbf34WgeUW/X/OpxS6R1qtJXP3DOIgkQBfOD1L\nW6dYRi6vws1fS2Jrb1cRdKQ7zMWBnoPK7q9Tl4oITSxZ8NJf3NskeZw/Fk2I\nXEUgarkhg7ObqpSit29TY6PcdvKMLodFWeWcY9iOO3EIKWUyjStTCijirDc8\nxcmo92DKc1m1u6hwIlkiSRjxfCjrxNl5OFhJIiANqhrqfcFBYPbdo+esoHYo\nA7w0NmW9SLU4WyKLJlj3Ev+UggmeFaKGiSznv3VdElPnmqiPr+pdJimvN68y\njalYqBoovAgB3FWE4fWR/1v+GI2kdZlwabys+9YGN+XEj1gbA30gNhIB9Z5y\nYuk9FLeZ8K8wqcyo85aARqZdjkRhvz79B+X27WGNKRS78FimF92AJZZdFqwg\nmE3wyjBtqkfkixawzl6mz/1RqhAznAjZdP9hW/b8rq6HIf0pHvKnxGIkI3n8\nFrFkE6X0e/mWnNmKnICq7AsCSOfJAPn13YqLRttCmYDN5Nfur/uFWIBbwdTs\nD38IxELy1bJJzqKeiIJNw+EYXgpcYXI3U4GHiwalGUPwCMCuZAylDmYN4yUJ\nnRTgnkoWEeIsTMWq3tFl+xhcTpLJ1I6TL6OyKM2r7t5Qr9f7245LMMOvxY1z\nmQ5bBbWxf7Oi1NFqNym8Rdtfgcm3eV9EXd7VUCevBU4H7b4NotntaSf6tNh1\nDIStYQd7eSgqYN95kwNvuE0gM8RkxxpFVQe75DBXmLpZysfRFqBZW8YcV90D\n0zdhqmX+dMyE55csMkQawjU3YElfDTTVl7pxOLZ85CzTXW+r4d8kuK/tq2aX\nANhOTBiEYeLy4bzu0nIkem2He5ld3hq/JLgorziKF0JfVIHcGs00FvUuu2C0\nRcPARgJkkofliygGHUqBIaI+On0dpQE+iyV26Pb6KVP6HAZdyDqVfQHf7AdG\nm5znDw4DC62w1M97p/hhIyUtl4cIjplQ+Mru8pNvHZREXyzmFkGDypG7NlSu\nGHawhE3/S1yG8Qkk2dnG5Yqp9u+fm4O6rdji8ti0vGBUEyozhncH4z5Y+xJE\ncL+MlK2TIETPedwDylRZccJhz5P/L8hzkmxI9mWFW+ZimffwiYnPm3Sv17t6\nbGmDD4rG33cN1cgquNbqL73/vvCaghRxfXj2ndLW9lCn186I9vZURaFd0wsd\n/ZazEYxuudCjTE2BsSN7ApGhj8LJr1dWwiJVaKzs/PnWJV563Y9RtjxEJ156\ngOsGFf0DYcZc/TtQY1i/BVg=\n=Ar7O\n-----END PGP MESSAGE-----"
  };

  return Object.assign(defaultData, data);
};

export const defaultAccountRecoveryPrivateKeyPasswordDto = (data = {}) => {
  const defaultData = {
    id: uuidv4(),
  };
  return createAccountRecoveryPrivateKeyPasswordDto({
    ...defaultData,
    ...data
  });
};

/**
 * The Test Account Recovery Organization gpg key is used to encrypt the private key password.
 * The Betty gpg key is used to sign the encrypted message.
 * The private key password belong to the private key of Betty.
 * Clear text password: 96946dd4d62e1ef5815c25ec8c5152a3abf5d80795f112719b92b0eb86d5d1102e68baab3486025886769bc05177ae7825e484420e58bf5a4692f30021425b85
 */
export const bettyAccountRecoveryPrivateKeyPasswordDto = (data = {}) => {
  const defaultData = {
    data: "-----BEGIN PGP MESSAGE-----\n\n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\nLbiX0dVls2TmnrqaDwjdkS8=\n=DKmX\n-----END PGP MESSAGE-----",
  };
  return defaultAccountRecoveryPrivateKeyPasswordDto({
    ...defaultData,
    ...data
  });
};

/**
 * The Test Account Recovery Organization gpg key is used to encrypt the private key password.
 */
export const secretSubstitutionAttackAccountRecoveryPrivateKeyPasswordDto = (data = {}) => {
  const defaultData = {
    data: "-----BEGIN PGP MESSAGE-----\n\nwcFMA9FTFjWeSbtEAQ/+NFBdfWsHpLPFl7NrysmueomBu4JWiy21vfDrlbBX\nIE1RDXSi57nTVc48dUJUSff6mRZEjaTvlAf3JjsVhc47rbbFO5DRvY8xq2l0\n00YL/90ZLi881EjsV07DfCE3kzhOZZBIrExx68pF/jOxJsRh8fBbq80ElrvY\nZDBNPemIPp6CnZnRGiqNxgECylF928qj3QVYSH/JlvdV3GZOH0MOMw+6iom5\nGMIuHop8vOowbWUyOTHA3SPMLZb7rXzNmDwYsgJF6VGfFDNVOkcXJydDLVLw\nC8LwM1KLVCxKBVR112N0LAsCGrPcB/ZR+/6YHlozxmwGLWQvSnpDFLrgKnLb\ns44YOs2tN5n2OwiXGCxkIaW7pF1oWnVB1ygIA0iGWxfLE2b66e5GUwSlAvkU\np1NlZlg5CcIsBKmr5RRG6LzuM1RjNmvw9x7BtV8hOCzLknrOCxGclLmZHsX4\nTDJJpmRxtPmIwHRtEsG5f4Yf5MEmasYWj4SvNcE92sGbJR1dFeTanSrt4ULJ\nt36f6Hmgb+8pFpJZOWlnHf0kjCfvmnp4KkUPHfwWQ/Rh+u8yQn9YmOk3QlKY\nSiU5C6ae26HGWmjpSxY5TxIlK2Tu6g1eXODJUHi4rPA+yHXPQN96IaqmcQhp\na+Lyvyr4awy7QDS6NnmoHrfIeJYBMK6NwuUfv/7CzJvSwRMBH3+QpUSybq5g\nhSbN+uZhoGXP8HNXK1rOkzUgZKmQt/geuFoX+wWFtXCBGTID8DcVSMStrOoj\n5vC+kD3xuKOCjYbZTAYwZXLuDEL0RP14PbxL7pmSNzVWTHk5+5V9rehBAP0m\nl4BQWan84DjN5+Bc7QC0AZqJFL39jKIKG1kdWuvZbVYLJGivwTnYUvUYEYgw\nnu8rg9fOttcdMMdo8gCQq46yaItAJOU0CMDFBqzw10gLHswi+qgt9Fjx9ovY\nosYiE9mKCoDigUDknylq8twqQCsGj9BF/QctwW0ExhXCc8ryetV+f1jCrM3z\najrVVuN/JgBr5wXCxeYPIY4dmCf6VEf3XlEdjggHBfzMwGtoxv9S8skCLJVp\nuukqSNv0EcuBQnidrYk5gLvTeuwrffHZKP+cKil9YIJlBFt0CNwIZ+r+t7Wg\nAGSwYRowfT1YGoxofXoKpLA4/aOlCKU1nr/1Drn5YbSVGcdP1wGhgvHbzyBG\nneibYnDajT31fPU2IY0P0DoyY9xgqDn762GLr9B9mhE3kkomG3swMzYA6BuK\nCA794XE/QY11RWTdLqncwcTayqBFYTOW8TyMHIeDRA9kxnQG1ozC6teyZEkm\nMR/BkOEbgA==\n=hQcu\n-----END PGP MESSAGE-----"
  };

  return defaultAccountRecoveryPrivateKeyPasswordDto({
    ...defaultData,
    ...data
  });
};
