// safari data model
safariModel = function () {
    // declare constants
    var DB_SIGHTINGS_REF = 'sightings';

    // initialise variables
    var sightingsList = [];

    // initialise a list of all safaris from firebase
    var initialiseSafariSightings = function () {
        // return promise
        return new Promise(function (resolve, reject) {           
            // get database reference
            var sightingsRef = firebase.database().ref(DB_SIGHTINGS_REF);                   

            // add sightings to list
            sightingsRef.on('value', function (snapshot) {
                // reset array
                sightingsList.splice(0, sightingsList.length);

                // loop through result and add to array
                snapshot.forEach(function(childSnap) {
                    sightingsList.push(childSnap.val());
                });

                // sort data (based on answer from @chris-charles at http://stackoverflow.com/questions/19430561/how-to-sort-a-javascript-array-of-objects-by-date)
                sightingsList.sort(function(a, b) { 
                    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
                });

                // resolve promise
                resolve(sightingsList);
            });            
        });
    };

    // function to retrieve firebase image url
    var getDownloadUrlFromImage = function (imageFileName) {
        return new Promise(function (resolve, reject) {
            // get storage reference
            var storageRef = firebase.storage().ref();

            // get image url
            storageRef.child('images/' + imageFileName).getDownloadURL()
                .then(function(url) {
                    // return imsge url from firebase
                    resolve(url);
                })
                .catch(function(error) {
                    reject(error);
                });
        });                    
    };

    // function to retrieve images from firebase
    var getImagesFromFirebase = function(safariSightings) {
        // initialise variables
        var sightingImages = [];
        var promises = [];

        // loop through each sighting
        $.each(safariSightings, function(index, sightingResult) {
            // get firebase image url (taken from answer by @rash at http://stackoverflow.com/questions/2526061/getting-just-the-filename-from-a-path-with-javascript)
            var imageFileName = sightingResult.imageUrl.split('\\').pop();

            // push the promise
            promises.push(safariController.getDownloadUrlFromImage(imageFileName));
        });

        // return promises array
        return Promise.all(promises);
    };

    // initialises safari and safari review lists
    var initialise = function () {
        // initialise promises
        var safariSightingsPromise = initialiseSafariSightings();

        // return promise
        return Promise.all([safariSightingsPromise]);
    };
    
    // expose public methods
    return {
        initialise: initialise,
        sightingsList: sightingsList,
        getDownloadUrlFromImage: getDownloadUrlFromImage,
        getImagesFromFirebase: getImagesFromFirebase
    };
} ();