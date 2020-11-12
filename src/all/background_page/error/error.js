if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
      const result = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        result[key] = (typeof this[key] === "object" && typeof this[key].toJSON === "function")
          ? this[key].toJSON()
          : this[key];
      }, this);

      return result
    },
    configurable: true,
    writable: true
  });
}
