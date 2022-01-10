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
 * @since         3.4.0
 */

const openpgp = require('openpgp/dist/openpgp');
const textEncoding = require('text-encoding-utf-8');
import Validator from 'validator';
import {GpgKeyInfoService} from '../../service/crypto/gpgKeyInfoService';
import {AccountRecoveryOrganizationPolicyEntity} from '../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity';
import {PrivateGpgkeyEntity} from '../entity/gpgkey/privateGpgkeyEntity';
import {AccountRecoveryModel} from "./accountRecoveryModel";

global.TextEncoder = textEncoding.TextEncoder;

jest.mock("../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService", () => ({
  AccountRecoveryOrganizationPolicyService: jest.fn().mockImplementation(() => ({
    saveOrganizationSettings: jest.fn(object => object),
  }))
}));

const mockAdminPrivateKey = "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQdGBFY06pcBEADjYRuq05Zatu4qYtXmexbrwtUdakNJJHPlWxcusohdTLUmSXrt\r\n7LegXBE3OjvV9HbdBQfbpjitFp8eJw5krYQmh1+w\/UYjb5Jy\/A7ma3oawzbVwNpL\r\nwuAafYma5LLLloZD\/OpYKprhWfW9FHKyq6t+AcH5CFs\/HvixdrdbAO7K1\/z6mgWc\r\nT6HBP5\/dGTseAlrvUDTsW1kzo6qsrOWoUunrqm31umsvcfNROtDKM16zgZl+GlYY\r\n1BxNcRKr1\/AcZUrp4zdSSc6IXrYjJ+1kgHz\/ZoSrKn5QiqEn7wQEveJu+jNGSv8j\r\nMvQgjq+AmzveJ\/4f+RQirbe9JOeDgzX7NqloRil3I0FPFoivbRU0PHi4N2q7sN8e\r\nYpXxXzuL+OEq1GQe5fTsSotQTRZUJxbdUS8DfPckQaK79HoybTQAgA6mgQf\/C+U0\r\nX2TiBUzgBuhayiW12kHmKyK02htDeRNOYs4bBMdeZhAFm+5C74LJ3FGQOHe+\/o2o\r\nBktk0rAZScjizijzNzJviRB\/3nAJSBW6NSNYcbnosk0ET2osg2tLvzegRI6+NQJE\r\nb0EpByTMypUDhCNKgg5aEDUVWcq4iucps\/1e6\/2vg2XVB7xdphT4\/K44ZeBHdFuf\r\nhGQvs8rkAPzpkpsEWKgpTR+hdhbMmNiL984Ywk98nNuzgfkgpcP57xawNwARAQAB\r\n\/gcDAm\/XMC4nWEO35K2CGOADZddDXQgw1TPvaWqn7QyYEX2L99ISv3oaobZF6s2E\r\n6Pt2uMHYZSJv2Xv1VaoyBoA\/1nEAqpZLlxzopydr4olGKaxVPG6p9pQwAfkqj2VD\r\n1CD1L\/vaaa7REfkwLAraeo2P4ucBzOZ+fEMb431eRVvcR6yN7Kjop8yfMWyiOqVn\r\nZQcGGQ0cvc6VdCec2rAZ0yGUVqSPJjiCN8QZBBtVzKs\/sPqRuyZNRgD2iT1R21gQ\r\nlwlji4ElA635qOQ0QKGFsvKG3Gqixj2Hh6dilXNnZ+i5vjNS3iKfddSdtHRX9uWs\r\nXU7bGd0oFL\/H2izQ4NVduqj71OTMpqizi8qjX5Kuo\/jO+O3OeawH2gPig7fI95BD\r\nYZ4r0U3d0Qdil9iSrlpnxGiuoxb594bKhMiTh86tNQ9ZqkWvJXoQLUkfEk\/xtIWu\r\nM1iZ8HNWJr9tbzfukag\/kkoG4bypYQB9TjnqFmvfZhOIh9eL4+XSpDgH5c7w1OD\/\r\nvTUstJyqsIYqujAbqSN+Zy6yGSJH7xn\/r6oI03PJuJFIDQzEHaq3YHOEmOK68aEa\r\nyYIKUo4B3WZPlQUW+5fZDryJ7Siz7Cthd432Mnjb4ysAYyS3O7+KsMBrDYziP8Xy\r\nv4jSmy1Dno1zbHouTQqQ\/MO6RLUKLq2GrIohG+sL7Wfw7FNM\/4edrt1yeufHjf9B\r\n5GlfBgZpNwAatyBtEKe1gL6ltXa0yiafbk47O7HBTsFS7wj7WffcXwLm5sgzjcdO\r\nPUwCccsB65ojv+BlhuGrpEHNCy9q8E\/EcbyZE1SQgL8pHGYVsUiwt\/80LXt9gxHV\r\n8IkSdnQDe1TEMR6fo3udF6ak4t5sG+VbY2oI3U62KC\/+EX+KRLnI7B3CZVj7\/57X\r\nSIiRv358ZaegqZqL63pcLgrCkhylAOzArXzRYpQ\/zfl6ztPKdOIe1eFm\/fn4aehZ\r\nEr4Nn0Mos0t3Z8RWYmBXCJF9B\/43OP5mzt3\/5CpzaNfSOI4kVzDVJAC6JqJxUYal\r\nuu5tYI9rGorHzZGcFEgQN23vmt1+ZJuQpszxUk0Wc7jhmGOZNv\/1u8\/96\/rWQvB0\r\ndOyoZripy0vNTmYU7fpYtWlwf718O1yag7VxUdUMZmnlcx0UEht4Z844eLWm+7PU\r\n7oVoaziY35s3nF53k3Xy17LP+LenFKt6ocGLWCMVLJyJqYfDtb1oLe2SmDA\/GEh1\r\ntRvrCe3jVKTdCjWfVv3lajKVZqDRrj5HGm2vvDv48X+7x2z5McVZI2hpxKwjkb8i\r\nWuOTbKT5q\/8AghEK6B0QMy8\/1Q+b8t64y2J\/yHF2Mfc8U3bG9uSPBVF+ov82+X+H\r\nOPrRABaJS8KXAKCe8FmCyx0xs\/IXVg1mSl3RFQ9jjpa9IVbNwZJxQQqzTj6a4EtC\r\n2NIpyz\/wgpiHeEnqXozkWOV1TP2wMLcavLh9bi7QwSZ7roOulfHDArNjjiAEPvBQ\r\n50BaDMPpz5e+IcN41\/T16uUjTHx+3j3Z8D\/IUZSdwA6zoKFU1xurQGqu98drTPx5\r\nFf9gI2+SL2pd8+vovKBW6UYc7W1\/tZJQ+pWuu7qjwscMLL9hWfyaIQZTzbtOjYis\r\njwm9LR5VC4rVwTT02tHmBHyAo2dw3Et9T6IJejhgyezBTQdSQCsK6qvvy2MFuI06\r\nG4CmTa1oSjRGPyFw87oteMlLVARtTTU9NvLWAVottYy7N81efdw+l0zqfrJFcZm+\r\nPDqi97mHTTQBf5MD8k5qZ1xZGWJt1cfpigQwXNL4SNJz1VavlN+Y1ji0K1Bhc3Ni\r\nb2x0IERlZmF1bHQgQWRtaW4gPGFkbWluQHBhc3Nib2x0LmNvbT6JAk4EEwEKADgC\r\nGwMFCwkIBwMFFQoJCAsFFgIDAQACHgECF4AWIQQMHRdhEQ0eM8kAbRpbGzMu0GQm\r\n0wUCXRuahgAKCRBbGzMu0GQm0+fGD\/9D1Y5ZQZ\/tU6d9toiLHc0YA40juuBe4sVz\r\nUTS8bbRdZPb4LrEayQXCOgluLIOtsxicgsafu8MifcxKghN6YuO233v+URcrsCBs\r\nkRZBYXWXGlebScK+MnqH6pq0Yr3qdyNy5rp5xS63XQD8IAKm6rF8o6EPoJozmX+S\r\nwQO3C+u\/YwhpVqO4K\/CD7JTHQjSt8BC\/RhNdsnkxGfWm86jdzqflDTPl67+KIbRQ\r\n00gTdOTkqlPTYxMy\/m6WWm3ea02MwcfT9N0\/EK1QpWHirfjHezKJgt6lp11\/kK2\/\r\n0IvnZVZ+wbeoU8ent644VjyV\/O56aioP2NwTtAgmeQKbC0tctCsTQ7ZFb\/L+heqs\r\nRNe7awXIcyvVfD\/9B4mAi\/rcsEaZw86P3dXIciVxQNqszairb4NcrGsOzbF+cUpU\r\nJnClK95wh8pdQqydfcAaul62hl1\/DSMBRUjee3pgK7wq9zNfF61+M5XccddrjSC0\r\n5mTk6gpt+5OPNCWlzWhoPIsfw9PUZiw3fBagOzjO6WHq4oOlK37jPnwfUF88WWs7\r\na6FlJ+TcTze4FBdlwAF5c3EJ2tMImbw\/3SxuMu7VOVp46etbBVPtiryLwsTuVsBe\r\ndPUeNCUOLwYHb7YSdlmY5f5nzhrXqMMSVlrNQ2wTzNPs6bKO4HsYYNtAQVjORv12\r\nvWPWy6TO3J0HRgRWNOqXARAAnfsL2zimriO9wQXdsmAv6rdIGiWAEik3WDX\/CiL2\r\n8SI6H7t7TwqvyYSEXThylENuFjp1xnw4hchD31+B01d96GUBacjno0T8U4jKJ\/xO\r\n8YF87rITfl8pKyTAY11RlYhnRTSnFJdC8H4oQZaWrZzdR\/+OFNkOcs298OOdiafn\r\nJynmxVaG0CYoWFr00nosYDQPUwL6NwIkIq1BEaBW+Wo4RIUOZDs+7z9rKvYE7RRE\r\ncnQ5vfSUeW4Kegoi\/nSoakv0Fi4YB0J8sEdfNFCEcht9z9xM+QrWRNdfnH8ySISX\r\nzxN4Y37KM1VLuqp3FiCz5BicMNmp6+FYS9XJdVCNwJZIgd+MvXHk12pgvr5yL87H\r\nIgWg+zgra6Y3ck+akWL58g+HYJ7ErLoGfITygCA2+B0Nvpk58C29KFk8ztAbgtlq\r\nXb6dinifuAlGHqR6lNBP\/gG5rTE61FCGBwjica1wLEQNEwzOOpsZiVydyIyOyIyD\r\n0s+lY8MD7EqtFkpjBUXLy8vH9qU7P+HUFmPHa7tia5oYQ3ETrYt\/KHTF6gIENN2d\r\nYQ5BMfotWyiZW1Q7UVVqnW3mORhJ2nEG4d\/z\/Zh7s3cVMxEp72fh7vmwAnTS62cy\r\nXo\/Zlxr2YzhPb08r4s8XHYbaHfkNDsxsSJ3VwBnxBVHdTKiJHz672Mx6T724UKb6\r\ncDEAEQEAAf4HAwLLeN3g43m3vOTwTkOu3KLgEscf6gyGshR7dYoIYiMQqbcDBttF\r\npRnTdTMRCj8rsE7mt82ZAzWj5C+1Sv\/bzjKmeVKAEk\/Q5L1aZai+ZWPtt2UNR2la\r\nQtkLKd+7Y4uQnT6rywvvZaVWOvOEB3wXiSNTrB5nyPpV5kd1px5Y4AzW\/ZExVdHC\r\niavfW2K2\/yrEKKodvbOUUPucYWpTkmrJsgRHFaFWU\/PBxXIYrewe6TXrKSuVxl+6\r\ngpp1FJR3qg04UPq9wdFYlysZzheuCeI24d6N5y0221z8JfT4FhcUUj4GjD1Rq7vA\r\nOQKcpYa0m9VV6Zh2vMdDlph\/tWGgIdEswo58z+MfunQgVp\/k9G4K1U3uOytRcJOV\r\nxEhG7vr85yLg6RNZMDXkMl6npkJ4e1C9pcGZYeCSVSheV3vVSes30ZeFNWOU+QNg\r\ntEyhykks0aCu3VFljB2Pn4wTFwPOc4sR3iYT1yv353Avbs00IsVYWOYUbUNUtQLY\r\nEAuia+v9UwTwoKg3Sz8ux\/FhxffkAEYj8sFU+nGUV34Ef7LYWLaU3ZUR6YtAsDyr\r\nOdWJrmGtzAOX73I3un5SzimNOVk\/ZUapNKnnP+m+m1u8JglWwuV0vHnSL6taQdAS\r\ngoN\/hYrsCzQEhuiE71CJ+b9inHO5I2zsDKqbb3JABk7ScQtUthel98aehdX5Da77\r\nrrK1eGeAGaniEOScREnl\/pISkaCVFjJ4K5yK6U4gxhtfNVDA7lwMdMJWwySbmy0m\r\nB9fhqRQn6HIF1eKaGw83jAZYMbkKINsILAq4u7tgQ2A0B0fsyb8BEhp1UORfZj17\r\nKgDn+UK9+gojJvAVDb2gE4+p2JPm\/HsHfsCMyNbA1tHIYv23mqopEx17GB0agmHV\r\nK5waTTBhGlAM46ecs5BB+u2X9Izc9oQ0+yFrX8alvT6TrbxQKC9c6nS1tZJSNa0j\r\nsstXDpQRLLN0DH8ggfmWsxMbRGtp3K5yOJMrDokE2IUnLdML2VXQq8jk5aFpIYQA\r\nzGs5\/VfMlhSnLfY0bcQK4zX50C7w\/woqAmkubtE9ntUD5K8R7i9hz\/PDL7n4P4ZK\r\nfGdjW4uPCsZLmw5BYcK91s+LaXEI337VgoX6YGVgaRRuKDBzaU6khIcZfjIG8o48\r\n6bOkLv54kF9r11fF1dNnLwQ24vASoLEyAhJjw2YyLAW+hv3bDvzqfsNsPrnAPwci\r\n8F8GqHWnn8qP2ZIiHNcn5Ax+jWfl2Lm8kUqk2s7rCVVwJ29oZ8piP53DDOid6m8L\r\nlWe1fgeSFDHEgshE13Y1KtN7BGVLvVg2qXEv56vdyxyGJfP11PYU3EF6ri6yLNYK\r\nPSVYZw1c5yZrLcucEcfddjYS0xtm7ASobi6tke7CTm+RhzN0jW5iNDsRqwq\/1xiz\r\nP2kDqYKt4\/ofmrDanA2tX2u\/jWfiHnkYju\/g4AQ8H53Z1He1VVHX6HNS9BKgWLjf\r\nX4kDzDTmwwxkh6tGQ73wXUP0n+akkJXcvHE86fqvtjtuvX3sfQfVKU5A6LsArO6H\r\nGWbN+5iL7mnWQrdoo7Wy4VsiYg4eR5dvAW5\/wd2U4t\/xe4ltOOB8Rn5A2Nh9QxWW\r\n2Njk3uBJ+8lK2dYd3xRJ6OvGa+I\/cD2bK2D+kqtR66W94pDSr2\/iIolBQTHBp2HV\r\nTjVI\/G06c2oTRuyTqAf410c4AxjKuuMJoEZQ7BY8ZX+3ikzYDvDN4Vx7MedQGDEd\r\nVEo71SfOgFRmQV5LCYwHLvbwpx1FHaBfCZLsfNiSnb+h\/\/ZRq7xPnZfd5m5eyxmw\r\niQI2BBgBCgAgAhsMFiEEDB0XYRENHjPJAG0aWxszLtBkJtMFAl0bmpkACgkQWxsz\r\nLtBkJtNODw\/\/bBZhZHaEqsFPxJ++\/odILeJJ5YGW4I9Ika6Jp5JyMCygWySV5LB5\r\njD1yQfW91mf4Bld6T1bQ1gyoNzWVuByytd8N7N8ENlYlVQOhcwAQ0pCN2AapJGrC\r\n0WVO6DfV2o3RX6YecC4Q0oEwo0p3Bn3I1cz7oFii6jz4oWTupqasUhWBIcfqfzvN\r\nE5Y\/dFLDhUXaLe3Kp+cDoV2bSrENEcGgP7qv7BXulDShxtkQYEH6I+SW2syW75YD\r\nIlsYQWpcGSkFrPCAYf+GoPABcMKCTfoDrTTPQuFAh7vsrdE79v07vgKXI9KMhWii\r\nQ+LkFJgoUNnw0crKiRCIXnvsi9vZq3XAeIxu0Nq7fB24WMJbByoGrNGCB3UenVDg\r\nossO9otJIcK3djw4MSkbufnKG+sDEql2yCMRSyywAh8trCnen0HIPBcaIrxIhdJU\r\nXzIt9gP2Fhif5NTqBQs1ueShV6qgTKbWGVodiXs4bbZonWBz3O42rOxxD58N0r1T\r\nNIGAHJhFVlr4yn1KToUmGJJPwe9cPUbiKT8siOxtlyPA2xtrbZ4AyDi\/J40usm1P\r\nToOskzVKBy9cFhGTdW9385yh3AvZcq\/DCINNEDXgyLbfYiCwjpI6BHVHWrqpUSGv\r\nhJlLvgC\/iaG65UE88qwiJu2mk9x6fRMmhMecbyQ1rZo4HxWDQhbVdX8=\r\n=\/G+C\r\n-----END PGP PRIVATE KEY BLOCK-----";

jest.mock('../keyring', () => ({
  Keyring: jest.fn().mockImplementation(() => ({
    findPrivate: jest.fn(() => ({
      key: mockAdminPrivateKey
    }))
  }))
}));

const adaPublicKey = "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\nmQINBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\ntB9BZGEgTG92ZWxhY2UgPGFkYUBwYXNzYm9sdC5jb20+iQJOBBMBCgA4AhsDBQsJ\r\nCAcDBRUKCQgLBRYCAwEAAh4BAheAFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0b\r\nmi8ACgkQE1O1sV2bBU+Okw\/\/b\/PRVTz0\/hgdagcVNYPn\/lclDFuwwqanyvYu6y6M\r\nAiLVn6CUtxfU7GH2aSwZSr7D\/46TSlBHvxVvNlYROMx7odbLgq47OJxfUDG5OPi7\r\nLZgsuE8zijCPURZTZu20m+ratsieV0ziri+xJV09xJrjdkXHdX2PrkU0YeJxhE50\r\nJuMR1rf7EHfCp45nWbXoM4H+LnadGC1zSHa1WhSJkeaYw9jp1gh93BKD8+kmUrm6\r\ncKEjxN54YpgjFwSdA60b+BZgXbMgA37gNQCnZYjk7toaQClUbqLMaQxHPIjETB+Z\r\njJNKOYn740N2LTRtCi3ioraQNgXQEU7tWsXGS0tuMMN7w4ya1I6sYV3fCtfiyXFw\r\nfuYnjjGzn5hXtTjiOLJ+2kdy5OmNZc9wpf6IpKv7\/F2RUwLsBUfH4ondNNXscdkB\r\n6Zoj1Hxt16TpkHnYrKsSWtoOs90JnlwYbHnki6R\/gekYRSRSpD\/ybScQDRASQ0aO\r\nhbi71WuyFbLZF92P1mEK5GInJeiFjKaifvJ8F+oagI9hiYcHgX6ghktaPrANa2De\r\nOjmesQ0WjIHirzFKx3avYIkOFwKp8v6KTzynAEQ8XUqZmqEhNjEgVKHH0g3sC+EC\r\nZ\/HGLHsRRIN1siYnJGahrrkNs7lFI5LTqByHh52bismY3ADLemxH6Voq+DokvQn4\r\nHxS5Ag0EVcdMHwEQAMFWZvlswoC+dEFISBhJLz0XpTR5M84MCn19s\/ILjp6dGPbC\r\nvlGcT5Ol\/wL43T3hML8bzq18MRGgkzhwsBkUXO+E7jVePjuGFvRwS5W+QYwCuAmw\r\nDijDdMhrev1mrdVK61v\/2U9kt5faETW8ZIYIvAWLaw\/lMHbVmKOa35ZCIJWcNsrv\r\noro2kGUklM6Nq1JQyU+puGPHuvm+1ywZzpAH5q55pMgfO+9JjMU3XFs+eqv6LVyA\r\n\/Y6T7ZK1H8inbUPm\/26sSvmYsT\/4xNVosC\/ha9lFEAasz\/rbVg7thffje4LWOXJB\r\no40iBTlHsNbCGs5BfNC0wl719JDA4V8mwhGInNtETCrGwg3mBlDrk5jYrDq5IMVk\r\nyX4Z6T8Fd2fLHmUr2kFc4vC96tGQGhNrbAa\/EeaAkWMeFyp\/YOW0Z3X2tz5A+lm+\r\nqevJZ3HcQd+7ca6mPTrYSVVXhclwSkyCLlhRJwEwSxrn+a2ZToYNotLs1uEy6tOL\r\nbIyhFBQNsR6mTa2ttkd\/89wJ+r9s7XYDOyibTQyUGgOXu\/0l1K0jTREKlC91wKkm\r\ndw\/lJkjZCIMc\/KTHiB1e7f5NdFtxwErToEZOLVumop0FjRqzHoXZIR9OCSMUzUmM\r\nspGHalE71GfwB9DkAlgvoJPohyiipJ\/Paw3pOytZnb\/7A\/PoRSjELgDNPJhxABEB\r\nAAGJAjYEGAEKACACGwwWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaPgAKCRAT\r\nU7WxXZsFTxX0EADAN9lreHgEvsl4JK89JqwBLjvGeXGTNmHsfczCTLAutVde+Lf0\r\nqACAhKhG0J8Omru2jVkUqPhkRcaTfaPKopT2KU8GfjKuuAlJ+BzH7oUq\/wy70t2h\r\nsglAYByv4y0emwnGyFC8VNw2Fe+Wil2y5d8DI8XHGp0bAXehjT2S7\/v1lEypeiiE\r\nNbhAnGG94Zywwwim0RltyNKXOgGeT4mroYxAL0zeTaX99Lch+DqyaeDq94g4sfhA\r\nVvGT2KJDT85vR3oNbB0U5wlbKPa+bUl8CokEDjqrDmdZOOs\/UO2mc45V3X5RNRtp\r\nNZMBGPJsxOKQExEOZncOVsY7ZqLrecuR8UJBQnhPd1aoz3HCJppaPI02uINWyQLs\r\nCogTf+nQWnLyN9qLrToriahNcZlDfuJCRVKTQ1gw1lkSN3IZRSkBuRYRe05US+C6\r\n8JMKHP+1XMKMgQM2XR7r4noMJKLaVUzfLXuPIWH2xNdgYXcIOSRjiANkIv4O7lWM\r\nxX9vD6LklijrepMl55Omu0bhF5rRn2VAubfxKhJs0eQn69+NWaVUrNMQ078nF+8G\r\nKT6vH32q9i9fpV38XYlwM9qEa0il5wfrSwPuDd5vmGgk9AOlSEzY2vE1kvp7lEt1\r\nTdb3ZfAajPMO3Iov5dwvm0zhJDQHFo7SFi5jH0Pgk4bAd9HBmB8sioxL4Q==\r\n=Kwft\r\n-----END PGP PUBLIC KEY BLOCK-----";
const adaPrivateKey = "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQdGBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\n\/gcDAligwbAF+isJ5IWTOSV7ntMBT6hJX\/lTLRlZuPR8io9niecrRE7UtbHRmW\/K\r\n02MKr8S9roJF1\/DBPCXC1NBp0WMciZHcqr4dh8DhtvCeSPjJd9L5xMGk9TOrK4Bv\r\nLurtbly+qWzP4iRPCLkzX1AbGnBePTLS+tVPHxy4dOMRPqfvzBPLsocHfYXN62os\r\nJDtcHYoFVddQAOPdjsYYptPEI6rFTXNQJTFzwkigqMpTaaqjloM+PFcQNEiabap\/\r\nGRCmD4KLUjCw0MJhikJpNzJHU17Oz7mBkkQy0gK7tvXt23TeVZNj3\/GXdur7IUni\r\nP0SAdSI6Yby8NPp48SjJ6e5O4HvVMDtBJBiNhHWWepLTPVnd3YeQ+1DYPmbpTu1z\r\nrF4+Bri0TfCuDwcTudYD7UUuS62aOwbE4px+RwBjD299gebnI8YAlN975eSAZM4r\r\n5me1dlfDMm47zD9dEmwT+ZwrGfol8oZoUwzYsQaCCmZqaba88ieRAZY30R\/089RS\r\nhR5WSieo2iIckFTILWiK\/E7VrreCUD8iacutVJqgRdzDgP4m+Zm3yRJYw2OiFe1Z\r\nwzD+Fb0gKDSB67G0i4KuZhXSTvn7QjqDWcVmgDTcTcrzzTwveeeLYe4aHaMUQGfl\r\ng+7hsGSt5on\/zqrU4DCQtUtFOn3Rsfyi3H4Fi9IA1w1knKVJ5IsIoxdBnRDvM3ZK\r\n6STr53I8CIJYB5Jj0cZuJ97pQ2YrFNbP5rgJCEnGwRuCRzlgaVeji+g27pZpJMJ4\r\nMdxAAw1AYo0IOPoNbuts5D\/5u5NzeiXxdQn5i\/sfUpYWvVJDnYPpXRT3v4amUpx+\r\nNIE5rF2QoHgc0wiw4hpqGVoin3WycfvlbnsHFJoR1YI9qS3z09Ihu\/NC6TejhgGf\r\ncJyRY5ghTvbqjCJmKPya2\/TfvgYtZmQ7toNpAL4VlLKDE55qXmqVbDo0cCuDnXcK\r\n\/gidC9VEaOxUb3Bxx0GQkxfiEhp\/S\/ndxLgyeG8otkGRat6aVjqPoAWj4Eu9w8XV\r\nysWPDJVv7hZ6rEm05a7eqQTUFg8PHw\/PdD2CWWYPHVTB+T9ihLwxUHMj4j6Uwvpy\r\nm2QyIzdsENkC52KY23SWNFE7WjdQmOS8ki1arVNIP9vcmh7nHGrRwPhmFTeTYzM1\r\n3jERti8DtvVyqnEf4c6CxfupOKLwRXvtJM9vhgFBD39oP\/bPVMee8R8Uj0QUM1ah\r\nVly3WEZK2enFqa\/+ChyZ1IOpVm3o2oCZs\/SWk\/FFsqOsdqJduI\/xbk2YG51FI6bw\r\nv2vCXx9+B+VdjDujtwyTpsy+sy2HqTv+SvYMuMFgpkGa7JDa7iuYqZg0179vEoJJ\r\nq2E04GSsjpg+IxddtjqMsdM0eCCgbY9QgnMxF1GA01Ij\/JC4H8g08jNU6RQ4KUaV\r\nmwdZvR8BhqNR6Ecx6BfzC415q+klaHf9IiPMFCxy96w\/wG6tGzS2tsczejtDoXmX\r\nr8FO+eoDWgzd5uO5f+m1G+dYN4RGUjcVAbC3oePYr3X6oXxu6Cb7tWFzu0ttr2GE\r\nRFDNy4zeN9UlUbbHGiylMdY9NsuGxC58oBgtHLsAsxlbw1oQvpXbBWZzfRwowv\/z\r\nnBdfEDm6JoSUnv1pyhBrM6sItolNaY244FKBmVW46T8U6+sOLSCRAKbKF3BuV6iH\r\nZsCtinXvN4asQ\/vUepuS59tPhSmqTSIAK5SCg6FDH\/tSOxrG9q187P190Nvc2Yyh\r\naolGQmHPK3mkc829sctNIrUJuAyYB4+WXpM\/K0x0u0\/GDJsKW26BZvi0H0FkYSBM\r\nb3ZlbGFjZSA8YWRhQHBhc3Nib2x0LmNvbT6JAk4EEwEKADgCGwMFCwkIBwMFFQoJ\r\nCAsFFgIDAQACHgECF4AWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaLwAKCRAT\r\nU7WxXZsFT46TD\/9v89FVPPT+GB1qBxU1g+f+VyUMW7DCpqfK9i7rLowCItWfoJS3\r\nF9TsYfZpLBlKvsP\/jpNKUEe\/FW82VhE4zHuh1suCrjs4nF9QMbk4+LstmCy4TzOK\r\nMI9RFlNm7bSb6tq2yJ5XTOKuL7ElXT3EmuN2Rcd1fY+uRTRh4nGETnQm4xHWt\/sQ\r\nd8KnjmdZtegzgf4udp0YLXNIdrVaFImR5pjD2OnWCH3cEoPz6SZSubpwoSPE3nhi\r\nmCMXBJ0DrRv4FmBdsyADfuA1AKdliOTu2hpAKVRuosxpDEc8iMRMH5mMk0o5ifvj\r\nQ3YtNG0KLeKitpA2BdARTu1axcZLS24ww3vDjJrUjqxhXd8K1+LJcXB+5ieOMbOf\r\nmFe1OOI4sn7aR3Lk6Y1lz3Cl\/oikq\/v8XZFTAuwFR8fiid001exx2QHpmiPUfG3X\r\npOmQedisqxJa2g6z3QmeXBhseeSLpH+B6RhFJFKkP\/JtJxANEBJDRo6FuLvVa7IV\r\nstkX3Y\/WYQrkYicl6IWMpqJ+8nwX6hqAj2GJhweBfqCGS1o+sA1rYN46OZ6xDRaM\r\ngeKvMUrHdq9giQ4XAqny\/opPPKcARDxdSpmaoSE2MSBUocfSDewL4QJn8cYsexFE\r\ng3WyJickZqGuuQ2zuUUjktOoHIeHnZuKyZjcAMt6bEfpWir4OiS9CfgfFJ0HRgRV\r\nx0wfARAAwVZm+WzCgL50QUhIGEkvPRelNHkzzgwKfX2z8guOnp0Y9sK+UZxPk6X\/\r\nAvjdPeEwvxvOrXwxEaCTOHCwGRRc74TuNV4+O4YW9HBLlb5BjAK4CbAOKMN0yGt6\r\n\/Wat1UrrW\/\/ZT2S3l9oRNbxkhgi8BYtrD+UwdtWYo5rflkIglZw2yu+iujaQZSSU\r\nzo2rUlDJT6m4Y8e6+b7XLBnOkAfmrnmkyB8770mMxTdcWz56q\/otXID9jpPtkrUf\r\nyKdtQ+b\/bqxK+ZixP\/jE1WiwL+Fr2UUQBqzP+ttWDu2F9+N7gtY5ckGjjSIFOUew\r\n1sIazkF80LTCXvX0kMDhXybCEYic20RMKsbCDeYGUOuTmNisOrkgxWTJfhnpPwV3\r\nZ8seZSvaQVzi8L3q0ZAaE2tsBr8R5oCRYx4XKn9g5bRndfa3PkD6Wb6p68lncdxB\r\n37txrqY9OthJVVeFyXBKTIIuWFEnATBLGuf5rZlOhg2i0uzW4TLq04tsjKEUFA2x\r\nHqZNra22R3\/z3An6v2ztdgM7KJtNDJQaA5e7\/SXUrSNNEQqUL3XAqSZ3D+UmSNkI\r\ngxz8pMeIHV7t\/k10W3HAStOgRk4tW6ainQWNGrMehdkhH04JIxTNSYyykYdqUTvU\r\nZ\/AH0OQCWC+gk+iHKKKkn89rDek7K1mdv\/sD8+hFKMQuAM08mHEAEQEAAf4HAwIG\r\nvhenLc6sMuTV+xomYhFDNmDMH1L9x\/8WG+NGjbYEIO0ezLgMizb7HlQVR4pPy+Tx\r\nxQDu8cZEtkxONaI9DDKTjoTD0UtKhELNM8HeJ4SljDbdU76z66BoBf1VIUocGbx8\r\nw6cjaPCALZf8Jl+3YhvJjW9NQcq9WTg1bU4Dga4C7sE1\/1fSK6DR8jKDxkf+zCt9\r\nHAWNtGv0P6IQEVB852M2O47RZkrJS17vBCsjEW9WGfa+i6tdSxS+IDshm+o6PYUG\r\nqUsfdiiRosTM10q1V6bNu2XKNOXvDzfAJPEhacbkkBpmfOhdc7okPqI17cLf0Mne\r\n1pJHXIZxUVUGisPS+yGoCPPuqISC9+EEZcBe8aCwyu4qWvTkNfwZm4SqFd0PiqQq\r\nU44Mf4diqbV3sQKQ3U+r0iZdCTQDBy+OIsmjJWPEvspC7UkaqsPze8eSdYNHB0tf\r\nqBdIidWeJ80131KWBMuweb0lHdxbiifxWMohymgj6mQf34w1Ffslak7c4ABeRTKR\r\njUqmX0bFp4KPFvyLSiArV7\/ohNn14sLq+HV0Kp19fGb8zh5E4x9LAHi0qd4+AcqI\r\ndQMG03XMF0Kih8dYxwIrcze6EmpzYSw5xms6fFangnf\/bWhKchfTb1qCT0npbPOp\r\nON6s3DE0vIdgnFOdxGGGWK0IRckOzf4c7NAMrtnSsuff3ogi25JvAAbxq\/XoCiv0\r\nGXiRJajREv4p4RXkIjZkhwOdMK+ovV8fEEHRyLTGyzx\/0Sv48ebVLVFf2iBW1t5o\r\nEwU2ElJmeMXbLRtFu8KAfr0hzIHPRjEZcQHBh3JdZOMHEwTdVQEeARNpQM51IZoP\r\nYiHRWaYE3XneotdWE07y6Npvc6eigxTy+cTHY+tafKHyNo63HGxhT+E4ZETT3sRn\r\nETkqjDeuaFQgpQmTlK8m+pvPT9CqgEPKSi2FH8bTPXmyO0i713NrBExzpHkmc8LH\r\nRSiXn\/K3Hbw8KQ+aNpMwFF4v2X16gQLQkDCO8PpKwpa9cAdw9vd+J+Hd\/NlEC6JR\r\ng8H7TPcVqtz+ucjW4v00bvoqj+RTWBDv9veUDrQBR862x9aX0TxqzaNr0z9dfpM8\r\nGpGzCLkqMOcqR7QRFX\/MxE\/Vf6wZRi7YvoNgLaikQxLAOfV9quYCcHio3e8AIsVk\r\nDCWeLzdu\/PZ4q+ubdxoWzM4BMHoo0FfBGqp0\/vKwwv5T3HbUpWdwRqqbQCsA1C1a\r\nzsIixUp4\/LkfXtJgqt8AYRMlEBOSM0QCJ1gpTO0+cjdQGgjrUtc2\/\/AhnQLhP4pw\r\n7hncQMR5lm6XGrKoNsair15N0R1hYS90NTi\/4zLQ62+7Q1SDveOKxuXgmGQsG9+p\r\n6GfHwClYuWMAF\/Nxkj+moEmJ39b2qrbO7fCU2ttewjAJZLYr7CN8C9nLTz6YC4by\r\nopW4JsEcHU5979ckpwMVaY8EqMi32NueKCcIj8rYKSKJ4vUyqgjXYmfd+jMrc5F\/\r\nDgSWqTe6xt01X\/nBWxWBlvAWwHJIqt0Toj7IizNS0jBcrmwu+4hPQHN8y+xAXxtI\r\nKzeq\/tcuRz30Oh7zA4vQOMB4ahUfNZlxVMSJAkr55Jwy9ZC4RWD46EhbmBgUSE18\r\n53y2vzihjWsVJvgAQCRrE6HKVvF0EE0PO8hUFLuVpdLhnGD\/xzmFYKxBpqj9IOk2\r\nqN+5UxfiQ+ACE5+WOlrV52ux2D6jcKPFh4R62I8l9zWvbI3rR+FUC3JU7dzIffyj\r\nSg+vmujAqvXwDwRHzdRzZ1u5Og3A3PqEYDtW4dfUmlwMTqd+iQI2BBgBCgAgAhsM\r\nFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0bmj4ACgkQE1O1sV2bBU8V9BAAwDfZ\r\na3h4BL7JeCSvPSasAS47xnlxkzZh7H3MwkywLrVXXvi39KgAgISoRtCfDpq7to1Z\r\nFKj4ZEXGk32jyqKU9ilPBn4yrrgJSfgcx+6FKv8Mu9LdobIJQGAcr+MtHpsJxshQ\r\nvFTcNhXvlopdsuXfAyPFxxqdGwF3oY09ku\/79ZRMqXoohDW4QJxhveGcsMMIptEZ\r\nbcjSlzoBnk+Jq6GMQC9M3k2l\/fS3Ifg6smng6veIOLH4QFbxk9iiQ0\/Ob0d6DWwd\r\nFOcJWyj2vm1JfAqJBA46qw5nWTjrP1DtpnOOVd1+UTUbaTWTARjybMTikBMRDmZ3\r\nDlbGO2ai63nLkfFCQUJ4T3dWqM9xwiaaWjyNNriDVskC7AqIE3\/p0Fpy8jfai606\r\nK4moTXGZQ37iQkVSk0NYMNZZEjdyGUUpAbkWEXtOVEvguvCTChz\/tVzCjIEDNl0e\r\n6+J6DCSi2lVM3y17jyFh9sTXYGF3CDkkY4gDZCL+Du5VjMV\/bw+i5JYo63qTJeeT\r\nprtG4Rea0Z9lQLm38SoSbNHkJ+vfjVmlVKzTENO\/JxfvBik+rx99qvYvX6Vd\/F2J\r\ncDPahGtIpecH60sD7g3eb5hoJPQDpUhM2NrxNZL6e5RLdU3W92XwGozzDtyKL+Xc\r\nL5tM4SQ0BxaO0hYuYx9D4JOGwHfRwZgfLIqMS+E=\r\n=9Gmn\r\n-----END PGP PRIVATE KEY BLOCK-----";
const irenePublicKey = "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\nmQENBFdFp7MBCADJIBQnJRuqNHJZTsFTK8byR7WJG7EpEHL+lS3qeOLoALYB+y8N\r\nfYbNDhGvpCWNgOatzGX0+PyjhZfHfGwgM\/yGeULmWKdfpaWIEcmgG2YaKucSvBll\r\nurDnA8mKlMZ8hXAZTbIYbr+IOl084824A0O3PoOoTYYPUk5DPtlbCP4e5JUF5OKb\r\n2VCjHxJbY+zstpOHipqmJJH5CejyZpmP4j0IYPDtUS2SeqdmFcYs0Nv7al3+Sc5s\r\nz4vbc\/Doiusyi00BWYXkI0yX3DQGz06FeFAgaQjIdChu207JF2UY+rylPTnMi1\/Y\r\nx+WKvP8Eidtb0+brOQPebl+oDq7c9SgXKWkfABEBAAG0JklyZW5lIEdyZWlmIDxp\r\ncmVuZS5ncmVpZkBwYXNzYm9sdC5jb20+iQEfBDABCgAJBQJZkvYsAh0AAAoJEFIH\r\nxWR0\/o0x0AAIAIj5Ldu\/K3YFiXb9LbEY+rS34U0vWEKlZBbXPhu+UFl\/6drUsmEL\r\n28gYjw60Hscxw9567G8dUNnda+Ei3cNeCi1zmgNHADqZJpE9XyXj7U8Ub14r9COt\r\nXtkVgUMUQh1CEs1TquCqqhe8z2\/Qa9JiYN5UWn\/NW2d+BZfVm1hDjLbjaTnHBpem\r\nTrYYyKKEAH8yaCLSxb3AsMCZJoGlf1QoqG5dKKP5SBz0e0hX0kNFCflfdoGfrag6\r\nwz\/lk20Rpy5wLidBQSq3kA\/LNpufAKFGYRYoFiPzJ3jDl13urEsLAwFqxfTsCUs5\r\nksnOjNZwog7X906jPMvexLLVRCR\/B\/0zaFiJAToEEwEKACQCGwMFCwkIBwMFFQoJ\r\nCAsFFgIDAQACHgECF4AFAlmS9hUCGQEACgkQUgfFZHT+jTEbQAf\/TotSaBBHxkkK\r\nYJ4Jmcn1S4u9wKzuiHYKtAdZIazLbrcwDdI9fCagNZbITDLiuABU2JhgapElgG3o\r\n6qIe+TSrYj5CD073ZzWsvSqdOnktaCtfXC1lPEE9A13xgO7JYrwtDuTDMSLTOQuA\r\n3C+G\/RwlouMeJ0ZaVZo326pSUmMdMjh1csogopIiJg\/qsdBakX\/tD0PkW13ljqx9\r\nd0G53TgfsBRaJvVO\/c9nzb5aAqDCyxzTRIxOMwIV7ebWyRxHBhNC7bNAKyUbSKl+\r\n8oc7EnALwfPeXwTzMfnk0E9Goz6o6ctG70ovs5K6mdh\/xuk5+FT0JF7Vr\/EhCCmY\r\nUbg9c\/ACh7QgSXJlbmUgR3JlaWYgPGlyZW5lQHBhc3Nib2x0LmNvbT6JATcEEwEK\r\nACEFAlmS9hQCGwMFCwkIBwMFFQoJCAsFFgIDAQACHgECF4AACgkQUgfFZHT+jTH8\r\nwgf9F0oTqr6ACQPdYbna8JDGAOT\/yFilNGMopoQeSdPMbOMLu0XQ+1atejothjK8\r\nx1EHuxDIYtCX+oyj4zOw1ragcoXu6MTXRY7q6qoF\/54\/Ds52qWWHnjalimgwCDvp\r\n449tci0znRmAdcll4WKfmz1zXgBPJqKFFBGOgMgjZYsab9ltWCMGNC9n0Dijacsn\r\n3WnFnFq\/akhHcQhZnFhrfe46TO9hBPi9DWWquSw6qitePykWqPodlEVTYarwhuFm\r\noToRmTrYJ8MGSe5mX7zyZnjJ9EfC2zGxZ6\/4alLSzpcx8jhxtPryhEKhcxnG\/RqI\r\n+eWLiE4\/S9QXF7n1Zd0FXP\/JRLkBDQRXRaezAQgAqnZk0ESpaUJWfF1v9x+xQ6Iv\r\nOxLKOhELF5lezoLc9LhmYhWfTu\/eKPXjEIWNMAxAKGZMN+q6jkdXixJ3qa1RwE5f\r\nH4T0PitlDijB4VJrnMXXFnitcY1TTQ5Pn1Q4SRK8YcKxEYY+a11Ihfn3XfVEJshN\r\nwe6wXnW8irh25FHfnVz22McFZZGZ5lAeZXdiyaH4ZIRhHYMr7Vi2Wm3Ea9kTtRua\r\nydXQ0AaqZGYiQ6\/PXJx8txnbs7bvaMQEFSxToKC6VNs+xwm2QBHZ7J5K0slC4r4J\r\nSn+8bEg5YyJg7zaJPIqzsubn1fiBWrkDwnZARjWD171jCHLsyLEmbanTlrAxcQAR\r\nAQABiQEfBBgBCgAJBQJXRaezAhsMAAoJEFIHxWR0\/o0xqk8H\/39J1WcH22Tc9rDl\r\nxACZHGOk0WSPgofcSwBE7n+y3b5f1tQ6x29GOh85+Cncgv9o3mk9yJb+gnhtBVrb\r\nrXZ0VnA988RDA6FcTsRu6bGPPL7hS7c7GDEyD8rUm7qWI\/n7joVV4TbKVDWepLZG\r\nsPhyyfHlSTkGFaUXu6YjpjR7pKy1OCk1vvX4HYMgWDswFiZ8ieeFYG5WXNq4TNCS\r\nxULqakeyiPpL0rG9uWwlKYQjYwBpWgAhxT7V2dfY8n3NGei9HpT3C6AnA44xB\/M6\r\ncx\/DkrKLL7g+VzmFtPuT5yfHnQQ8EIWWb2c\/R1V6a8Prg8ONtbFXFj3DWAOB5h91\r\nokxFArA=\r\n=xqxT\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n";

const keyExistsInList = (keys, keyId) => {
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].keyId === keyId) {
      return true;
    }
  }
  return false;
};

// Reset the modules before each test.
beforeEach(() => {
  window.openpgp = openpgp;
  window.Validator = Validator;
  jest.resetModules();
});

describe("AccountRecovery model", () => {
  it("should update the organization policy signing a new ORK with the user private key", async() => {
    expect.assertions(1);
    const model = new AccountRecoveryModel();

    const accountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity({
      policy: "opt-in",
      account_recovery_organization_public_key: {
        armored_key: adaPublicKey
      }
    });

    const oldAccountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity({
      policy: "disabled"
    });

    const adminPassphrase = "admin@passbolt.com";

    const resultingObject = await model.saveOrganizationSettings(
      accountRecoveryOrganizationPolicyEntity,
      oldAccountRecoveryOrganizationPolicyEntity,
      undefined,
      adminPassphrase);

    const sentOrk = (await openpgp.key.readArmored(resultingObject.armoredKey)).keys[0];
    const adminPrivateGpgKey = (await openpgp.key.readArmored(mockAdminPrivateKey)).keys[0];
    const signatures = await sentOrk.verifyAllUsers([adminPrivateGpgKey]);

    expect(keyExistsInList(signatures, adminPrivateGpgKey.keyId)).toBe(true);
  });

  it("should update the organization policy signing a new ORK with the user private key and prior ORK while revoking prior ORK", async() => {
    expect.assertions(3);
    const model = new AccountRecoveryModel();

    const accountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity({
      policy: "opt-in",
      account_recovery_organization_public_key: {
        armored_key: irenePublicKey
      }
    });

    const oldAccountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity({
      policy: "mandatory",
      account_recovery_organization_public_key: {
        armored_key: adaPublicKey
      }
    });

    const oldORKprivateKeyEntity = new PrivateGpgkeyEntity({
      armored_key: adaPrivateKey,
      passphrase: "ada@passbolt.com"
    });

    const adminPassphrase = "admin@passbolt.com";

    const resultingObject = await model.saveOrganizationSettings(
      accountRecoveryOrganizationPolicyEntity,
      oldAccountRecoveryOrganizationPolicyEntity,
      oldORKprivateKeyEntity,
      adminPassphrase);

    const sentOrk = (await openpgp.key.readArmored(resultingObject.armoredKey)).keys[0];
    const sentOldOrk = await GpgKeyInfoService.getKeyInfo({armoredKey: resultingObject.revokedKey});
    const adminPrivateGpgKey = (await openpgp.key.readArmored(mockAdminPrivateKey)).keys[0];
    const oldOrkPrivateGpgKey = (await openpgp.key.readArmored(adaPrivateKey)).keys[0];
    const signatures = await sentOrk.verifyAllUsers([adminPrivateGpgKey, adaPrivateKey]);

    expect(keyExistsInList(signatures, adminPrivateGpgKey.keyId)).toBe(true);
    expect(keyExistsInList(signatures, oldOrkPrivateGpgKey.keyId)).toBe(true);
    expect(sentOldOrk.revoked).toBe(true);
  });
});
