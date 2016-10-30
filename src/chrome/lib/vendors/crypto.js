
exports.randomBytes = function(size) {
  var buf = new Uint8Array(size);
  window.crypto.getRandomValues(buf);
  return buf;
};
