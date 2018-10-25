// https://github.com/amativos/node-storage/blob/master/index.js

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function Storage(data) {
  this.store = this._load(data);
}

Storage.prototype.put = function (key, value) {
  /*
  *  Updates the key with the given value and
  *  returns the updated storage object.
  */
  if (typeof key !== 'string') {
    throw new Error('key must be a string');
  }
  key = this._internalizeKey(key);
  return this._setDeep(key.split('.'), value, false);
};

Storage.prototype.get = function (key) {
  /*
  *  Returns the value of the key
  */
  if (typeof key !== 'string') {
    throw new Error('key must be a string');
  }
  key = this._internalizeKey(key);
  return this._getDeep(key.split('.'));
};

Storage.prototype.remove = function (key) {
  /*
  *  Removes the node at the given Key
  *  from the storage object
  */
  if (typeof key !== 'string') {
    throw new Error('key must be a string');
  }
  key = this._internalizeKey(key);
  return this._setDeep(key.split('.'), undefined, true);
};



Storage.prototype._getDeep = function(path) {
  var storage = this.store;

  for (var i = 0; i < path.length; i++) {
    var p = path[i];

    if (!isObject(storage)) {
      throw new Error(path.slice(0, i).join('.') + ' is not an object');
    }

    if (!storage.hasOwnProperty(p)) {
      return null;
    }

    storage = storage[p];
  }

  return storage;
};



Storage.prototype._setDeep = function(path, value, remove) {

  var storage = this.store;

  for (var i = 0; i < path.length; i++) {
    var p = path[i];

    if (!isObject(storage)) {
      throw new Error(path.slice(0, i).join('.') + ' is not an object');
    }

    if (i === path.length - 1) {
      setOrRemove(storage, p);
      return this.store;
    }

    if (!storage.hasOwnProperty(p)) {
      storage[p] = {};
    }

    storage = storage[p];
  }

  function setOrRemove(obj, key) {
    if (remove) {
      delete obj[key];
    } else {
      obj[key] = value;
    }
  }

};

Storage.prototype._load = function(data) {

  if (isObject(data)) return data;
  if (data == '') return {};

  try {
    return JSON.parse(data);
  } catch(e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
    console.error(e);
    return {};
  }

};

Storage.prototype._internalizeKey = function(key) {
  key = key || '';
  return key == '' ? 'halo' : `halo.${key}`;
};

module.exports = Storage;
