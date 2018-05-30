/**
 * A wrapper for PwnedPasswords API by Troy Hunt (haveibeenpwned.com).
 *
 */
// Number of characters from the hash that API expects
const PREFIX_LENGTH = 5;
const API_URL = 'https://api.pwnedpasswords.com/range/';

async function pwnedpasswords (password) {

  if (typeof password !== 'string') {
    const err = new Error('Input password must be a string.');
    return Promise.reject(err);
  }

  const shaObj = new jsSHA('SHA-1', 'TEXT');
  shaObj.update(password);
  const hashedPassword = shaObj.getHash('HEX');
  const hashedPasswordPrefix = hashedPassword.substr(0, PREFIX_LENGTH);
  const hashedPasswordSuffix = hashedPassword.substr(PREFIX_LENGTH);
  const url = API_URL + hashedPasswordPrefix;

  const response = await fetch(url);
  if (response.status === 404) {
    return false;
  }
  if (response.status !== 200) {
    return Promise.reject(new Error(`Failed to load pwnedpasswords API: ${response.status}`));
  }
  const data = await response.text();
  return data
    .split('\n')
    .map(line => line.split(':'))
    .filter(filtered => filtered[0].toLowerCase() === hashedPasswordSuffix)
    .map(mapped => Number(mapped[1]))
    .shift() || 0;
}
