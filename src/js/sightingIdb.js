// idb functionality
sightingsIdb = function () {

    // declare constants    
    var IDB_SIGHTING_OBJECT_STORE = 'sightings';
    var IDB_NAME = 'sightingsDatabase';
    var IDB_VERSION_NUMBER = 1;

    // declare variables
    var dbPromise = null;
    var cachedSightings = [];

    // function to initialise the page
    var initPage = function () {
        // create idb objects
        dbPromise = openDatabases();
    };

    // function to create idb object
    var openDatabases = function () {
        // open db
        return idb.open(IDB_NAME, 1, function (upgradeDb) {
            upgradeDb.createObjectStore(IDB_SIGHTING_OBJECT_STORE, { keyPath: ['dateTime'] });
        });
    };

    // function to get sightings from idb
    var getSightingsFromCache = function () {
        return dbPromise.then(function(db) {
            return db.transaction(IDB_SIGHTING_OBJECT_STORE)
                .objectStore(IDB_SIGHTING_OBJECT_STORE).getAll();
        }).then(function (allObjs) {
            cachedSightings = allObjs;
            return allObjs;
        });
};

// function to remove offline contents from cache (once uploaded)
var removeOfflineSightingsFromCache = function () {
    return dbPromise.then(function (db) {
        // validate if db is valid            
        if (!db) return;

        // initialise transaction
        var tx = db.transaction(IDB_SIGHTING_OBJECT_STORE, 'readwrite');

        // retrieve cache results in descending order
        tx.objectStore(IDB_SIGHTING_OBJECT_STORE).openCursor(null, 'prev')
            .then(function cursorIterate(cursor) {
                if (!cursor) return;

                // remove all entries which are offline
                if (cursor.value.isOffline === true) {
                    cursor.delete();
                }

                return cursor.continue().then(cursorIterate);
            });

        // return cached results
        return tx.complete
            .then(function (result) {
                return cachedSightings;
            });
    });
};

// function to add sightings to idb
var addSightingsToCache = function (sightings, image, isOffline) {
    return dbPromise.then(function (db) {
        // validate if db is valid
        if (!db) return;

        // initialise transaction
        var tx = db.transaction(IDB_SIGHTING_OBJECT_STORE, 'readwrite');
        var keyValStore = tx.objectStore(IDB_SIGHTING_OBJECT_STORE);

        // add sightings
        for (var counter = 0; counter < sightings.length; counter++) {
            keyValStore.put({
                animalType: sightings[counter].animalType,
                dateTime: sightings[counter].dateTime,
                description: sightings[counter].description,
                latitude: sightings[counter].latitude,
                longitude: sightings[counter].longitude,
                submittedBy: sightings[counter].submittedBy,
                image: image,
                isOffline: isOffline
            });
        }

        // return complete
        return tx.complete;
    });
};

// expose public methods
return {
    initPage: initPage,
    getSightingsFromCache: getSightingsFromCache,
    addSightingsToCache: addSightingsToCache,
    removeOfflineSightingsFromCache: removeOfflineSightingsFromCache
};
}();