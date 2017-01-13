// controller functionality for the safari review app
safariController = function () {

    // declare constants
    var DB_SIGHTINGS_REF = 'sightings';

    // function to generate a guid (code taken from post at http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript - answers and contributions by @gilly3, @coolaj86, @broofa, @giridhar)
    var generateGuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    // function to upload image to firebase storage
    var uploadFirebaseImage = function(imageUrl, isImageBlob) {
        // get a reference to the storage service
        var storageRef = firebase.storage().ref();
        var imageGuid = generateGuid();
        var imageExtension = '';
        var imagesRef = '';

        // retrieve image extension
        if (isImageBlob) {

            switch (imageUrl.type) {
                case 'image/jpeg': {
                    imageExtension = 'jpg';
                    break;
                }
                case 'image/png': {
                    imageExtension = 'png';
                    break;
                }
                case 'image/gif': {
                    imageExtension = 'gif';
                    break;
                }
                case 'image/x-ms-bmp': {
                    imageExtension = 'bmp';
                    break;
                }
            }
            
	        imagesRef = storageRef.child('images/' + imageGuid + '.' + imageExtension);
        } else {
            imageExtension = imageUrl.name.split('.').pop(); // answer from @robert-mullaney at http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
	        imagesRef = storageRef.child('images/' + imageGuid + '.' + imageExtension);
        }

        // add image to storage and return guid
		return imagesRef.put(imageUrl)
            .then(function (result) {
                return imageGuid + '.' + imageExtension;
            });
    };

    // function to retrieve the cuisine types
    var addSighting = function (animalType, imageUrl, latitude, longitude, sightingDescription, dateTime, username, isImageBlob) {
                
        // check if a sighting should be uploaded to firebase or to idb
        if (navigator.onLine) {
            // get a reference to the database service
            var database = firebase.database().ref(DB_SIGHTINGS_REF);
            var newEntryRef = database.push();

            // upload image to firebase storage
            uploadFirebaseImage(imageUrl, isImageBlob)
                .then(function (imageGuidResult) {
                    // add new entry to database
                    newEntryRef.set({
                        animalType: animalType,
                        description: sightingDescription,
                        imageUrl: imageGuidResult,
                        dateTime: dateTime,
                        latitude: latitude,
                        longitude: longitude,
                        submittedBy: username
                    });
                });
        } else {
            // initialise variables
            var sightings = [];

            // create sighting object
            var sighting = {
                animalType: animalType,
                dateTime: dateTime,
                description: sightingDescription,
                latitude: latitude,
                longitude: longitude,
                submittedBy: username
            };

            // add sighting to sightings array
            sightings.push(sighting);

            // download image
            var reader = new FileReader();
            reader.readAsDataURL(imageUrl);
            
            reader.addEventListener('load', function (e) {
                // add sightings to idb
                sightingsIdb.addSightingsToCache(sightings, e.target.result, true);                
            }, false);            
        }                        
    };

    // function to retrieve all sightings
    var getAllSightings = function() {
        // simply return the model
        return safariModel.sightingsList;
    };

    // function to retrieve image url from firebase
    var getDownloadUrlFromImage = function(fileName) {
        // call model
        return safariModel.getDownloadUrlFromImage(fileName);
    };

    // function to filter out search results
    var filterSearchResults = function(safariSightings, animalType, period) {
        // initialise variables
        var safariSearchResults = [];

        // filter out search results
        $.each(safariSightings, function (index, sightingResult) {
            switch (period) {                
                case '24HRS':
                    if ((sightingResult.animalType === animalType || animalType === 'ALL') && moment().subtract(1, 'days').isBefore(moment(sightingResult.dateTime))) {
                        safariSearchResults.push(sightingResult);
                    }
                    break;
                case '48HRS':
                    if ((sightingResult.animalType === animalType || animalType === 'ALL') && moment().subtract(2, 'days').isBefore(moment(sightingResult.dateTime))) {
                        safariSearchResults.push(sightingResult);
                    }
                    break; 
                case '5DAYS':
                    if ((sightingResult.animalType === animalType || animalType === 'ALL') && moment().subtract(5, 'days').isBefore(moment(sightingResult.dateTime))) {
                        safariSearchResults.push(sightingResult);
                    }
                    break; 
                case 'WEEK':
                    if ((sightingResult.animalType === animalType || animalType === 'ALL') && moment().subtract(7, 'days').isBefore(moment(sightingResult.dateTime))) {
                        safariSearchResults.push(sightingResult);
                    }
                    break; 
                case 'MONTH':
                    if ((sightingResult.animalType === animalType || animalType === 'ALL') && moment().subtract(30, 'days').isBefore(moment(sightingResult.dateTime))) {
                        safariSearchResults.push(sightingResult);
                    }
                    break;  
            }
        });

        // return search results
        return safariSearchResults;
    };

    // function to process the search for one or more anumal types for a given period
    var processSearch = function(animalType, period) {
        return new Promise(function (resolve, reject) {
            
            // initialise variables
            var safariSearchResults = [];
            var safariSightings;

            // retrieve sightings list
            if (navigator.onLine) { 
                // retrieve latest result set
                safariController.initialiseModel()
                    .then(function (firebaseSightings) {
                        // ensure a valid result set is returned
                        if (firebaseSightings !== null) {
                            safariSightings = firebaseSightings[0];

                            // return result
                            resolve(filterSearchResults(safariSightings, animalType, period));
                        }
                        else {
                            // return empty array
                            resolve(safariSightings);
                        }
                    });
            } else {
                // retrieve results from idb
                sightingsIdb.getSightingsFromCache()
                    .then(function (cachedResults) {
                        // return result
                        resolve(filterSearchResults(cachedResults, animalType, period));
                    });
            }
        }); 
    };

    // function to retrieve images from firebase
    var getImagesFromFirebase = function(safariSightings) {
        // return images from firebase
        return safariModel.getImagesFromFirebase(safariSightings);
    };

    // function to initialise the model
    var initialiseModel = function() {
        // return images from firebase
        return safariModel.initialise();
    };  

    // expose public methods
    return {
        addSighting: addSighting,
        getAllSightings: getAllSightings,
        getDownloadUrlFromImage: getDownloadUrlFromImage,
        processSearch: processSearch,
        getImagesFromFirebase: getImagesFromFirebase,
        initialiseModel: initialiseModel
    };
} ();