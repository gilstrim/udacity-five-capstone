// declare variables
var onlineIcon = $("#onlineIcon");
var offlineIcon = $("#offlineIcon");

// function to register the service worker
var registerServiceWorker = function () {
    // verify if service worker is supported
    if (navigator.serviceWorker) {
        // register the service worker
        navigator.serviceWorker.register('sw.js').then(function (registration) {

            // if in waiting state, refresh immediately
            if (registration.waiting) {
                navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
                return;
            }

            // log success message
            console.log('Service worker was successfully registered');
        }).catch(function (error) {
            // log error message
            console.log('Service worker registration failed: ', error);
        });
    }
};

// function to check online and offline status
var checkOnlineOffline = function(pushContent) {
	// check if online
	if (navigator.onLine) {
		// when app comes online, push offline content to server
		if (pushContent) {
			pushOfflineContentToServer();
		}

		// process icons
		onlineIcon.show();
		offlineIcon.hide();		
	} else {
		onlineIcon.hide();
		offlineIcon.show();
	}

	// process offline logic on add sighting page
	if ($('li.active').find('a').first().text() === 'Add Sighting') {
		viewAddSightings.processOfflineLogic();
	}
};

// function to convert base 64 image to a blob (function taken from stack overflow post - answered by @jeremy-banks at http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript)
var b64toBlob = function (b64Data, contentType, sliceSize) {
	contentType = contentType || '';
	sliceSize = sliceSize || 512;

	var byteCharacters = atob(unescape(encodeURIComponent(b64Data)));
	var byteArrays = [];

	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);

		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}

		var byteArray = new Uint8Array(byteNumbers);

		byteArrays.push(byteArray);
	}

	var blob = new Blob(byteArrays, { type: contentType });
	return blob;
};

// function to push offline sightings to the server when connectivity is available
var pushOfflineContentToServer = function () {
	// retrieve sightings from cache
	sightingsIdb.getSightingsFromCache()
		.then(function (cachedResults) {
			// loop through cached results
			$.each(cachedResults, function (index, sightingResult) {
				// ensure that only offline content is obtained
				if (sightingResult.isOffline === true) {
					// initialise variables
					var animalType = sightingResult.animalType;
					var imageUrl = sightingResult.image;
					var latitude = sightingResult.latitude;
					var longitude = sightingResult.longitude;
					var sightingDescription = sightingResult.description;
					var username = sightingResult.submittedBy;
					var dateTime = sightingResult.dateTime;

					// convert base 64 image to blob
					var imageContentType = imageUrl.split(',')[0].replace('data:', '').replace(';base64', '');
					var imageBlob = b64toBlob(imageUrl.split(',')[1], imageContentType);

					// call controller to upload a sighting
					safariController.addSighting(animalType, imageBlob, latitude, longitude, sightingDescription, dateTime, username, true);
				}
			});

			// return
			return true;
		})
		.then(function (result) {
			// remove all offline items from cache
			return sightingsIdb.removeOfflineSightingsFromCache();
		})
		.then(function (result) {
			console.log('Done!');
		})
		.catch(function (error) {
			console.log(error);
		});
};

// on load functionality
$(document).ready(function () {		
	// register service worker
    registerServiceWorker();

	// initialise general app logic
	viewGeneral.initialiseView();

	// initialise landing page logic
	viewLandingPage.initialiseView();

	// create idb objects
    sightingsIdb.initPage();

	// verify if user is online or offline
	checkOnlineOffline(true);

	// retrieve all sightings from firebase and add to the cache
    if (navigator.onLine) {
		// process logic to determine if online or offline
        var connectedRef = firebase.database().ref(".info/connected");
        
        connectedRef.on("value", function(snap) {
            if (snap.val() === true) {
                checkOnlineOffline(true);
            } else {
                checkOnlineOffline(false);
            }
        });

        // retrieve latest sightings from firebase
        safariController.initialiseModel()
			.then(function (firebaseSightings) {
				// add firebase sightings to cache
				if (firebaseSightings !== null)
					return sightingsIdb.addSightingsToCache(firebaseSightings[0], null, false);
			})
			.catch(function (error) {
				console.log('Error retrieving sightings from Firebase: ' + error);
			});
	}
});