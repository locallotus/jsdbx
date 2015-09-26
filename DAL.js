var UTIL = require('./UTIL.js');

var DAL = {}; // data access layer object (class)

/* PRIVATE VARIABLES (not exported except for testing) */
DAL.LOADING = false;
DAL.COLLECTION = []; // documents / collection of javascript objects
DAL.FILE = 'collection.db';
DAL.INDEX_FIELDS = [];
DAL.GLOBAL_DIFF = 0; // how many records have been inserted or altered since last collection save
DAL.GLOBAL_DIFF_MAX = 100000;
/*
DAL.INSERT_DIFF = 0; // how many records have been inserted since last insert write
DAL.INSERT_DIFF_MAX = 50;
DAL.UPDATE_DIFF = 0;
DAL.UPDATE_DIFF_MAX = 50;
DAL.DELETE_DIFF = 0;
DAL.DELETE_DIFF_MAX = 50;
*/

//--- DATA ACCESS LAYER

DAL.load = function (callback) {
    if(!this.LOADING) {
        this.LOADING = true;
        UTIL.loadCollection(this.FILE, function(done, line) {
            if(done) {
                this.LOADING = false;
                callback();
            } else {
                DAL.insert(line);
            }
        });
    }
}

DAL.save = function () {
    UTIL.saveCollection(this.FILE, this.COLLECTION);
}

DAL.createIndex = function (field) {
    if(UTIL.createIndex(field, this.COLLECTION)) {
        this.INDEX_FIELDS.push(field);
        return true;
    } else {
        return false;
    }
}

DAL.removeIndex = function (field) {
    if(UTIL.destroyIndex(field)) {
        this.INDEX_FIELDS.splice(this.INDEX_FIELDS.indexOf(field), 1);
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
// TODO: Move insert implementation to UTIL object
// Then remove UTIL.addIndex() function from UTIL
DAL.insert = function (data) {
    var inserted = 0;
    if(typeof data !== 'object') {
        return 0; // invalid data
    }
    if(data.length) { // assuming an array
        var obj;
        for(var i = 0; i < data.length; i++) {
            obj = data[i];
            // check if new object contains a field to index on
            for(var i = 0; i < this.INDEX_FIELDS.length; i++) {
                // ok there's a field to index on
                if(this.INDEX_FIELDS[i] in obj) {
                    // index this record
                    UTIL.addIndex(this.INDEX_FIELDS[i], obj);
                }
            }
            // check for [[obj,obj,],]
            if(obj.length > 0) {
                this.COLLECTION.concat(UTIL.addIDProperty(obj)); // array of objects hopefully
                inserted++;
            } else if(typeof obj === 'object') {
                this.COLLECTION.push(UTIL.addIDProperty(obj));
                inserted++;
            } else {
                // invalid data encountered
                console.error(':: DAL.insert Error in record(s) to insert!');
            }
        }
    } else { // single object
        this.COLLECTION.push(UTIL.addIDProperty(data));
        inserted++;
    }
    this.GLOBAL_DIFF += inserted;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(this.FILE, this.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on INSERT_DIFF_MIN
    return inserted;
}

DAL.findOne = function (query) {
    if(!query) {
        return [];
    }
    return (UTIL.finder(this.COLLECTION, query, false, true))[0];
}

DAL.findAnyOne = function (query) {
    if(!query) {
        return [];
    }
    return (UTIL.finder(this.COLLECTION, query, false, false))[0];
}

DAL.find = function (query) {
    if(!query) {
        return this.COLLECTION;
    }
    return UTIL.finder(this.COLLECTION, query, true, true);
}

DAL.findAny = function (query) {
    if(!query) {
        return this.COLLECTION;
    }
    return UTIL.finder(this.COLLECTION, query, true, false);
}

DAL.updateOne = function (query, data) {
    if(!query || !data) {
        return 0;
    }
    var updated = UTIL.updater(this.COLLECTION, query, data, false, true);
    this.GLOBAL_DIFF += updated;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(this.FILE, this.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on UPDATE_DIFF_MIN
    return updated;
}

DAL.updateAnyOne = function (query, data) {
    if(!query || !data) {
        return 0;
    }
    var updated = UTIL.updater(this.COLLECTION, query, data, false, false);
    this.GLOBAL_DIFF += updated;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(this.FILE, this.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on UPDATE_DIFF_MIN
    return updated;
}

DAL.update = function (query, data) {
    if(!query || !data) {
        return 0;
    }
    var updated = UTIL.updater(this.COLLECTION, query, data, true, true);
    this.GLOBAL_DIFF += updated;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(this.FILE, this.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on UPDATE_DIFF_MIN
    return updated;
}

DAL.updateAny = function (query, data) {
    if(!query || !data) {
        return 0;
    }
    var updated = UTIL.updater(this.COLLECTION, query, data, true, false);
    this.GLOBAL_DIFF += updated;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(this.FILE, this.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on UPDATE_DIFF_MIN
    return updated;
}

DAL.removeOne = function (query) {
    if(!query) {
        return 0;
    }
    var deleted = UTIL.remover(this.COLLECTION, query, false, true);
    this.GLOBAL_DIFF += deleted;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(this.FILE, this.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on DELETE_DIFF_MIN
    return deleted;
}

DAL.removeAnyOne = function (query) {
    if(!query) {
        return 0;
    }
    var deleted = UTIL.remover(this.COLLECTION, query, false, false);
    this.GLOBAL_DIFF += deleted;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(this.FILE, this.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on DELETE_DIFF_MIN
    return deleted;
}

DAL.remove = function (query) {
    if(!query) {
        return 0;
    }
    var deleted = UTIL.remover(this.COLLECTION, query, true, true);
    this.GLOBAL_DIFF += deleted;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(this.FILE, this.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on DELETE_DIFF_MIN
    return deleted;
}

DAL.removeAny = function (query) {
    if(!query) {
        return 0;
    }
    var deleted = UTIL.remover(this.COLLECTION, query, true, false);
    this.GLOBAL_DIFF += deleted;
    if(this.GLOBAL_DIFF >= this.GLOBAL_DIFF_MAX) {
          UTIL.saveCollection(tthis.FILE, his.COLLECTION);
          this.GLOBAL_DIFF = 0;
    }
    // TODO: Stream individual records to separate files based on DELETE_DIFF_MIN
    return deleted;
}

/*
exports.insertTestDocuments = DAL.insertTestDocuments;
exports.findOne = DAL.findOne;
exports.find = DAL.find;
exports.count = DAL.count;
*/
module.exports = DAL;
