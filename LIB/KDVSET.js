'use strict';
/*
  Key Duplicate Value Store
  A key/value store implementation where values are stored in an array
  and the values of duplicate keys are added to the value array of the existing key.

  Note: Python has built-in hash-table types, dict and set.
        Keys in dicts must be immutable.
        Sets are as dictionaries without values.

  Usage:
    var KDVSET = require('./KDVSET.js');
    var mykdvset = new KDVSET();
    mykdvset.add(key, value);

  API:
    SET.add(key,val)
    SET.get(key)
    SET.update(oldKey,newKey,val)
    SET.remove(key)
    SET.rename(oldKey,newKey)
    SET.contains(key)
    SET.clear()
    SET.size()
    SET.count()
*/

module.exports = function () {
    this.SET = {}; // the key/value store
    this.COUNT = 0; // number of keys/properties

    this.add = function (key, val) {
        if(this.SET[key]) { // key exists
            this.SET[key].push(val);
        } else { // new key
            this.SET[key] = [val];
            this.COUNT++;
        }
        return true;
    }

    this.get = function (key) {
        return this.SET[key];
    }

    // TODO: Put update for removal in own function
    // Proceed with caution...
    this.update = function (oldKey, newKey, val, remove) {
        if(this.contains(val[oldKey])) { // check that the old key exists
            if(this.contains(val[newKey])) { // the new key exists
                // Now we need to check if the key contains a pointer to the object
                // get the array of values from the key
                var p = this.get(val[newKey]);
                // check if object reference is in the array
                // loop backwards so we don't loop in the same direction as we're splicing
                // Otherwise we miss half the references as splice() modifies the array in place
                for(var i = p.length; i > 0; i--) {
                    // check if reference equals reference at index
                    if(val === p[i]) {
                        // ok there exists a key with the same object reference
                        if(remove) { // we aim to remove this key
                            // remove reference with splice
                            p.splice(i, 1);
                            // if this index contains no more values, remove it
                            if(p.length === 0) {
                                //console.log(':: KDVSET.update Removing empty key:', oldKey);
                                this.remove(val[oldKey]);
                            }
                            return true;
                        }
                        return false; // bail out
                    }
                }
                // append value/object to array
                p.push(val);
            } else { // the new key does not exist
                // Now we need to remove the matching object reference for the new key from the old key
                // get the array of values from the old key
                var p = this.get(val[oldKey]);
                // check if object reference is in the array
                // loop backwards so we don't loop in the same direction as we're splicing
                // Otherwise we miss half the references as splice() modifies the array in place
                /*for(var i = p.length; i > 0; i--) {
                    // check if reference at index equals reference to object
                    if(p[i] === val) {
                        console.log('Removing value from index', oldKey, p.length, i);
                        // remove reference with splice
                        p.splice(i, 1);
                        break; // break because we do this for each found document
                    }
                }*/
                var i = p.length;
                console.log(i);
                while(i--) {
                    if(p[i] === val) {
                        console.log('Removing value from index', oldKey, p.length, i);
                        // remove reference with splice
                        p.splice(i, 1);
                        break; // break because we do this for each found document (val) and there should only be one match possible
                    }
                }
                // if this key contains no more values, remove it
                if(p.length === 0) {
                    //console.log(':: KDVSET.update Removing empty key:', val[oldKey], p);
                    this.remove(val[oldKey]);
                }
                if(!remove) {
                    // insert the new key and value => object reference
                    this.add(val[newKey], val);
                }
            }
            return true;
        } else { // oldKey isn't even here, insert newKey
            if(!remove) { // we're not here to delete this missing key
                // insert the new key and value => object reference
                this.add(val[newKey], val);
                return true;
            }
            //console.log(':: KDVSET.update Old key not found!');
            return false;
        }
    }

    this.remove = function (key) {
        if(this.SET[key]) {
            delete this.SET[key];
            this.COUNT--;
            return true;
        }
        return false;
    }

    this.rename = function (oldKey, newKey) {
        if(this.SET[oldKey] && !this.SET[newKey]) {
            // copy old value to new key
            this.SET[newKey] = this[oldKey];
            // delete old key/value
            delete this.SET[oldKey];
            return true;
        }
        return false;
    }

    this.contains = function (key) {
        if(this.SET[key]) {
            return true;
        }
        return false;
    }

    this.clear = function () {
        this.SET = {};
        this.COUNT = 0;
    }

    this.size = function () {
        return Object.keys(this.SET).length;
    }

    this.count = function () {
        return this.COUNT;
    }
}
