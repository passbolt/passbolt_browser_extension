/**
 * Extension jest webextension mock storage with session.
 * @see https://github.com/clarkbw/jest-webextension-mock/blob/main/src/storage.js
 */
let store = {};

function resolveKey(key) {
  if (typeof key === 'string') {
    const result = {};
    // @todo id=null is a variation introduced by passbolt to respect the original API which returns an empty object if the store is not defined.
    if (typeof store[key] !== "undefined") {
      result[key] = store[key];
    }
    return result;
  } else if (Array.isArray(key)) {
    return key.reduce((acc, curr) => {
      if (typeof store[curr] !== "undefined") {
        acc[curr] = store[curr];
      }
      return acc;
    }, {});
  } else if (typeof key === 'object') {
    return Object.keys(key).reduce((acc, curr) => {
      acc[curr] = store[curr] || key[curr];
      return acc;
    }, {});
  }
  throw new Error('Wrong key given');
}

export default {
  // @todo id=null is a variation introduced by passbolt to respect the original API which returns the store if no id is given.
  get: jest.fn((id = null, cb) => {
    const result = id === null ? store : resolveKey(id);
    if (cb !== undefined) {
      return cb(result);
    }
    return Promise.resolve(result);
  }),
  getBytesInUse: jest.fn((id, cb) => {
    if (cb !== undefined) {
      return cb(0);
    }
    return Promise.resolve(0);
  }),
  set: jest.fn((payload, cb) => {
    Object.keys(payload).forEach((key) => (store[key] = payload[key]));
    if (cb !== undefined) {
      return cb();
    }
    return Promise.resolve();
  }),
  remove: jest.fn((id, cb) => {
    const keys = typeof id === 'string' ? [id] : id;
    keys.forEach((key) => delete store[key]);
    if (cb !== undefined) {
      return cb();
    }
    return Promise.resolve();
  }),
  clear: jest.fn((cb) => {
    store = {};
    if (cb !== undefined) {
      return cb();
    }
    return Promise.resolve();
  }),
};
