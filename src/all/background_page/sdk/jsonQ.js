/**
 * jsonQ's functions - only the one we need
 * Copyright (c) 2013 - 2016 Sudhanshu Yadav.
 * MIT licenses
 */
const objType = (function() {
  const map = {
    '[object Array]': 'array',
    '[object Object]': 'object',
    '[object String]': 'string',
    '[object Number]': 'number',
    '[object Boolean]': 'boolean',
    '[object Null]': 'null',
    '[object Function]': 'function'
  };

  return function(obj) {
    const type = Object.prototype.toString.call(obj);
    return map[type];
  };
}());

const jsonQ = {
  // get value at specific path in a json
  pathValue: function(json, path) {
    let i = 0;
    const ln = path.length;

    if (json === null) {
      return null;
    }
    while (i < ln) {
      if (json[path[i]] === null) {
        json = null;
        return;
      } else {
        json = json[path[i]];
      }
      i = i + 1;
    }
    return json;
  },
  // set path value
  setPathValue: function(json, path, value) {
    let i = 0;
    let tempJson = json;
    const ln = path.length;
    if (json === null) {
      return null;
    }
    while (i < ln) {
      if (typeof tempJson[path[i]] != 'object') {
        tempJson[path[i]] = objType(path[i + 1]) == 'number' ? [] : {};
      }
      if (i == path.length - 1) {
        tempJson[path[i]] = value;
      }
      tempJson = tempJson[path[i]];
      i = i + 1;
    }
    return json;
  }
};

exports.jsonQ = jsonQ;
