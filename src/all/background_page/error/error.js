if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
      const result = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        result[key] = this[key];
      }, this);

      return result
    },
    configurable: true,
    writable: true
  });
}
