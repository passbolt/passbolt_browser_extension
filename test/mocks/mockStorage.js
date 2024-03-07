/**
 * Mock storage largely inspired from jest web extension mock code.
 * @see https://github.com/clarkbw/jest-webextension-mock/blob/main/src/storage.js
 */

class MockStorage {
  constructor() {
    this.store = {};
  }

  get(id = null, cb) {
    const result = id === null ? this.store : this.resolveKey(id);
    if (cb !== undefined) {
      return cb(result);
    }
    return Promise.resolve(result);
  }

  getBytesInUse(id, cb) {
    if (cb !== undefined) {
      return cb(0);
    }
    return Promise.resolve(0);
  }

  set(payload, cb) {
    Object.keys(payload).forEach((key) => (this.store[key] = payload[key]));
    if (cb !== undefined) {
      return cb();
    }
    return Promise.resolve();
  }

  remove(id, cb) {
    const keys = typeof id === 'string' ? [id] : id;
    keys.forEach((key) => delete this.store[key]);
    if (cb !== undefined) {
      return cb();
    }
    return Promise.resolve();
  }

  clear(cb) {
    this.store = {};
    if (cb !== undefined) {
      return cb();
    }
    return Promise.resolve();
  }

  resolveKey(key) {
    if (typeof key === 'string') {
      const result = {};
      // @todo id=null is a variation introduced by passbolt to respect the original API which returns an empty object if the store is not defined.
      if (typeof this.store[key] !== "undefined") {
        result[key] = this.store[key];
      }
      return result;
    } else if (Array.isArray(key)) {
      return key.reduce((acc, curr) => {
        acc[curr] = this.store[curr];
        return acc;
      }, {});
    } else if (typeof key === 'object') {
      return Object.keys(key).reduce((acc, curr) => {
        acc[curr] = this.store[curr] || key[curr];
        return acc;
      }, {});
    }
    throw new Error('Wrong key given');
  }
}

export default MockStorage;
