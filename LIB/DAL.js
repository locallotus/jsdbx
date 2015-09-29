'use strict';

var path = require('path');

module.exports = function(db, collectionName, UTIL) {
    //--- DATA ACCESS LAYER API

    var DAL = {}; // data access layer object (class), gets exported
    // TODO: Consider persistence to be static (no using new),
    // but for now we need to pass the new UTIL obj from JSDBX
    // for file operations to interleave with multiple connections
    // due to global vars that need be unique per instance
    // But moving the COLLECTION to util will require new anyway
    // Then DAL could become static?
    var PERSISTENCE = new require('./PERSISTENCE.js')(UTIL);

    // PUBLIC VARIABLES
    DAL.C_NAME = collectionName;
    DAL.FILE = path.join(db._db.path, (collectionName + '.db'));

    /* PRIVATE VARIABLES (should not be exported except for testing) */
    DAL.LOADING = false;
    DAL.SAVING = false;
    DAL.COLLECTION = []; // documents / collection of javascript objects

    DAL.load = function (callback) {
        if(!this.LOADING) {
            this.LOADING = true;
            PERSISTENCE.loadCollection(this.FILE, function(err, data) {
                if(!err && data) { // no error and data was returned
                     DAL.COLLECTION = data; // point the collection object to the array of data from file
                }
                DAL.LOADING = false;
                callback(err); // don't pass the data from the API to the user (hehe)
            });
        } else { // We're busy loading
            callback(false);
        }
    }

    DAL.save = function (callback) {
        if(!this.SAVING) {
            this.SAVING = true;
            PERSISTENCE.saveCollection(this.FILE, this.COLLECTION, function(err) {
                DAL.SAVING = false;
                callback(err);
            });
        } else { // We're busy saving
            callback(false);
        }
    }

    DAL.createIndex = function (field) {
        if(PERSISTENCE.createIndex(field, this.COLLECTION)) {
            return true;
        } else {
            return false;
        }
    }

    DAL.removeIndex = function (field) {
        if(PERSISTENCE.destroyIndex(field)) {
            return true;
        } else {
            return false;
        }
    }

    DAL.count = function () {
        return this.COLLECTION.length;
    }

    /*
      data can be an object or an array of objects (1D or 2D array)
    */
    DAL.insert = function (data) {
        if(typeof data !== 'object') {
            return 0; // invalid data
        }
        return PERSISTENCE.inserter(this.COLLECTION, data);
    }

    DAL.findOne = function (query) {
        if(!query) {
            return [];
        }
        return (PERSISTENCE.finder(this.COLLECTION, query, false, true))[0];
    }

    DAL.findAnyOne = function (query) {
        if(!query) {
            return [];
        }
        return (PERSISTENCE.finder(this.COLLECTION, query, false, false))[0];
    }

    DAL.find = function (query) {
        if(!query) {
            return this.COLLECTION;
        }
        return PERSISTENCE.finder(this.COLLECTION, query, true, true);
    }

    DAL.findAny = function (query) {
        if(!query) {
            return this.COLLECTION;
        }
        return PERSISTENCE.finder(this.COLLECTION, query, true, false);
    }

    DAL.updateOne = function (query, data) {
        if(!query || !data) {
            return 0;
        }
        return PERSISTENCE.updater(this.COLLECTION, query, data, false, true);
    }

    DAL.updateAnyOne = function (query, data) {
        if(!query || !data) {
            return 0;
        }
        return PERSISTENCE.updater(this.COLLECTION, query, data, false, false);
    }

    DAL.update = function (query, data) {
        if(!query || !data) {
            return 0;
        }
        return PERSISTENCE.updater(this.COLLECTION, query, data, true, true);
    }

    DAL.updateAny = function (query, data) {
        if(!query || !data) {
            return 0;
        }
        return PERSISTENCE.updater(this.COLLECTION, query, data, true, false);
        return updated;
    }

    DAL.removeOne = function (query) {
        if(!query) {
            return 0;
        }
        return PERSISTENCE.remover(this.COLLECTION, query, false, true);
    }

    DAL.removeAnyOne = function (query) {
        if(!query) {
            return 0;
        }
        return PERSISTENCE.remover(this.COLLECTION, query, false, false);
    }

    DAL.remove = function (query) {
        if(!query) {
            return 0;
        }
        return PERSISTENCE.remover(this.COLLECTION, query, true, true);
    }

    DAL.removeAny = function (query) {
        if(!query) {
            return 0;
        }
        return PERSISTENCE.remover(this.COLLECTION, query, true, false);
    }

    return DAL;
}
