if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function() {
      const result = {};

      Object.getOwnPropertyNames(this).forEach(function(key) {
        if (typeof this[key] !== "object") {
          result[key] = this[key];
          return;
        }

        if (typeof this[key].toJSON === "function") {
          result[key] = this[key].toJSON();
          return;
        }

        result[key] = JSON.parse(JSON.stringify(this[key]));
      }, this);

      return result;
    },
    configurable: true,
    writable: true
  });
}
