// view functionality for the safari review app
viewAddSightings = function () {

    // initialise variables
    var locationMap;
    var markers = [];
    var landingSelectionDiv = $("#divLandingSelection");
    var latitudeControl = $('#txtSightingLatitude');
    var longitudeControl = $('#txtSightingLongitude');
    var locationTypeControl = $('#cboSightingLocation');
    var sightingsLocationMapDiv = $("#sightingsLocationMap");
    var animalTypeControl = $("#cboAnimalType");
    var uploadImageControl = $("#fileUploadSighting");
    var submittedByControl = $("#txtSubmittedBy");
    var sightingDescriptionControl = $("#txtSightingDescription");
    var submitSightingButton = $("#btnSubmitReview");
    var addSightingContainerDiv = $("#divAddSightingContainer");
    var addSightingForm = $("#formAddReview");
    var connectivityWarningDiv = $("#divConnectivityWarning");
    var successfulSubmitDiv = $("#divSuccessfulSubmit");
    var failedSubmitDiv = $("#divFailedSubmit");
    var invalidCoordinatesDiv = $("#divInvalidCoordinates");
    var offlineSubmitDiv = $("#divOfflineSubmit");
    var addSightingMapMessage = $("#addSightingMapMessage");
    var addSightingMapInfo = $("#addSightingMapInfo");
    var refreshButtonControl = $("#btnRefreshConnection");

    // function to initialise map
    var initialiseMap = function () {
        // set default coordinates
        var Pilanesberg = { lat: -25.2446384, lng: 27.0853536 };

        // initialise google maps on the page
        locationMap = new google.maps.Map(document.getElementById('locationMap'), {
            center: Pilanesberg,
            zoom: 11
        });
    };

    // function to initialise coordinate values
    var initialiseCoordinates = function (defaultMarkerOnMap) {
        // use HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                // set latitude and longitude coordinates on form
                setLatitudeLongitude(position.coords.latitude, position.coords.longitude);

                // initialise marker on map
                if (defaultMarkerOnMap)
                    addMarker(position.coords.latitude, position.coords.longitude);
            });
        } else {
            alert("Browser doesn't support Geolocation");
        }
    };
    
    // function to place a marker on the map
    var addMarker = function (latitude, longitude) {
        // remove existing marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        markers.length = 0;

        // initialise new marker
        var marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: locationMap
        });

        // add marker to array
        markers.push(marker);

        // set latitude and longitude coordinates on form
        setLatitudeLongitude(latitude, longitude);
    };

    // function to set the latitude and longitude
    var setLatitudeLongitude = function (latitude, longitude) {
        // set latitude and longitude values on form
        latitudeControl.val(latitude);
        longitudeControl.val(longitude);
    };

    // function to process the current location usage 
    var processCurrentLocation = function () {
        // initialise variables
        var currentLocationUsage = locationTypeControl.val();

        // process logic for each current location selection
        switch (currentLocationUsage) {
            case 'AUTO':
                // disable fields
                disableEnableFields(false);

                // initialise the current coordinates
                initialiseCoordinates(false);

                break;
            case 'MAP':
                // disable fields
                disableEnableFields(false);

                // show the map on the screen                
                sightingsLocationMapDiv.show();

                // initialise the map
                initialiseMap();

                // add click event for the map
                if (navigator.onLine && typeof (google) !== undefined) {
                    google.maps.event.addListener(locationMap, 'click', function (event) {
                        addMarker(event.latLng.lat(), event.latLng.lng());
                    });
                }

                // set the coordinates to the current location and mark them on the map
                initialiseCoordinates(true);

                break;
            case 'MANUAL':
                // enable fields
                disableEnableFields(true);

                break;
        }
    };

    // function to enable and disable fields
    var disableEnableFields = function (enable) {
        if (enable) {
            latitudeControl.removeAttr('disabled');
            longitudeControl.removeAttr('disabled');
        }
        else {
            latitudeControl.prop('disabled', 'disabled');
            longitudeControl.prop('disabled', 'disabled');
        }
    };

    // function to validate the coordinates
    var isValidCoordinates = function () {
        return new Promise(function (resolve, reject) {
            // initialise variables
            var geocoder = new google.maps.Geocoder;
            var latitude = latitudeControl.val();
            var longitude = longitudeControl.val();
            var latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

            // validate coordinates
            geocoder.geocode({ 'location': latlng }, function (results, status) {
                if (status === 'OK') {
                    if (results[1]) {
                        if (results[1].formatted_address.indexOf('Pilanesberg') === -1) {
                            resolve('INVALID_COORDINATES');
                        }
                        else {
                            resolve('VALID_COORDINATES');
                        }
                    } else {
                        resolve('INVALID_COORDINATES');
                    }
                } else {
                    resolve('INVALID_COORDINATES');
                }
            });
        });
    };

    // function to validate form submission
    var isValidSubmit = function () {
        return new Promise(function (resolve, reject) {
            // initialise validation fields
            var submitStatusToReturn = '';
            var numErrors = $("#formAddReview > .has-error").length;
            var numEmptyFields = $("#formAddReview input, #formAddReview select, #formAddReview textarea")
                .filter(function () { 
                    return $.trim($(this).val()).length === 0 || $(this).val() === ''; 
            }).length;

            // validate coordinates are within the Pilanesberg National Park
            if (navigator.onLine) {
                isValidCoordinates()
                    .then(function (result) {
                        if (result === 'INVALID_COORDINATES') {
                            resolve(result);
                        }
                        else if (numErrors !== 0 || numEmptyFields !== 0) {
                            resolve('REQUIRED_FIELDS');
                        }
                        else {
                            resolve('VALID');
                        }
                    });
            } else {
                // validate required and empty fields
                if (numErrors !== 0 || numEmptyFields !== 0) {
                    resolve('REQUIRED_FIELDS');
                } else {
                    resolve('OFFLINE');
                }
            }
        });
    };

    // function to submit a sighting
    var submitSighting = function () {
        // initialise variables
        var animalType = animalTypeControl.val();
        var imageUrl = uploadImageControl[0].files[0];
        var latitude = latitudeControl.val();
        var longitude = longitudeControl.val();
        var sightingDescription = sightingDescriptionControl.val();
        var username = submittedByControl.val();

        // verify that the form is valid before submitting
        addSightingForm.validator('validate');

        // show error messages on load
        $(".help-block").show();

        // validate form
        isValidSubmit()
            .then(function (isValidSubmission) {
                if (isValidSubmission === 'REQUIRED_FIELDS') { // required fields
                    // hide other messages
                    successfulSubmitDiv.hide();
                    invalidCoordinatesDiv.hide();
                    connectivityWarningDiv.hide();
                    offlineSubmitDiv.hide();

                    // show invalid coordinates message
                    failedSubmitDiv.show(500);
                }
                else if (isValidSubmission === 'INVALID_COORDINATES') { // coordinates not within correct range
                    // hide other messages
                    successfulSubmitDiv.hide();
                    failedSubmitDiv.hide();
                    connectivityWarningDiv.hide();
                    offlineSubmitDiv.hide();

                    // show invalid coordinates message
                    invalidCoordinatesDiv.show(500);
                }
                else if (isValidSubmission === 'OFFLINE' || isValidSubmission === 'VALID') { // valid submission
                    // hide other messages
                    invalidCoordinatesDiv.hide();
                    failedSubmitDiv.hide();
                    connectivityWarningDiv.hide();

                    // call controller to upload a sighting
                    safariController.addSighting(animalType, imageUrl, latitude, longitude, sightingDescription, moment().format('YYYY-MM-DD hh:mm:ss A'), username, false);

                    // show message for successful submission
                    if (isValidSubmission === 'OFFLINE') {
                        successfulSubmitDiv.hide();
                        offlineSubmitDiv.show(500);
                    } else {
                        offlineSubmitDiv.hide();
                        successfulSubmitDiv.show(500);
                    }
                }
            });        
    };

    // function to process offline logic
    var processOfflineLogic = function() {
        // validate if online or offline
        if (navigator.onLine) {
            // hide the connectivity message
            connectivityWarningDiv.hide();
        } else {
            // show the connectivity message
            connectivityWarningDiv.show(500);
        }
    };

    // function to refresh connection to check for GPS coordinates
    var refreshConnection = function() {
        // show warning message
        connectivityWarningDiv.hide(); 
        
        // initialise GPS coordinates if the user is online
        if (navigator.onLine) {
            // hide / show messages
            addSightingMapMessage.hide();
            addSightingMapInfo.show(500);

            // default the location type
            locationTypeControl.val('AUTO');

            // initialise coordinates
            initialiseCoordinates(false);            
        } else {
            // hide / show messages
            addSightingMapMessage.show(500);
            addSightingMapInfo.hide();

            // show warning message
            connectivityWarningDiv.show(500);        
        }
    };

    // function to hook events
    var hookEvents = function () {
        // process change of current location usage
        locationTypeControl.on('change', processCurrentLocation);

        // process addition of a new sighting
        submitSightingButton.on('click', submitSighting);

        // refresh connection
        refreshButtonControl.on('click', refreshConnection);
    };

    // function to initialise the view on the page
    var initialiseView = function () {
        // hide selection landing page
        landingSelectionDiv.hide();

        // set active navigation link
        $('li a:contains("Add Sighting")').first().parent().addClass('active');        

        // hide messages
        connectivityWarningDiv.hide();
        successfulSubmitDiv.hide();
        failedSubmitDiv.hide();
        invalidCoordinatesDiv.hide();
        offlineSubmitDiv.hide();

        // show add sighting container
        addSightingContainerDiv.show(500);

        // initialise GPS coordinates if the user is online
        if (navigator.onLine) {
            // hide / show messages
            addSightingMapMessage.hide();
            addSightingMapInfo.show();

            // default the location type
            locationTypeControl.val('AUTO');

            // initialise coordinates
            initialiseCoordinates(false);            
        } else {
            // hide / show messages
            addSightingMapMessage.show();
            addSightingMapInfo.hide();

            // show warning message
            connectivityWarningDiv.show();        
        }

        // validate form on load
        addSightingForm.validator('validate');

        // set focus to first control        
        setTimeout(function(){ animalTypeControl.focus(); }, 1000);

        // hook events
        hookEvents();
    };

    // expose public methods
    return {
        initialiseView: initialiseView,
        initialiseMap: initialiseMap,
        processOfflineLogic: processOfflineLogic
    };
} ();