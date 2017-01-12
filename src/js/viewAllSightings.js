// view functionality for the safari review app
viewAllSightings = function () {

    // initialise variables
    var latestSightingsDiv = $("#divViewSightingContainer");
    var searchButtonControl = $("#btnSubmitSearch");
    var searchAnimalTypeControl = $("#cboSearchAnimalType");
    var searchPeriodControl = $("#cboSearchPeriod");
    var map;
    var markers = [];
    var landingSelectionDiv = $("#divLandingSelection");
    var sightingSearchResultsDiv = $("#divSightingSearchResults");
    var searchSightingForm = $("#searchSightingForm");
    var searchResultsMapDiv = $("#divSearchResultsMap");
    var searchResultsListDiv = $("#divSearchResultsList");

    // function to initialise map
    var initialiseMap = function () {
        return new Promise(function(resolve, reject) {
            // set default coordinates
            var Pilanesberg = { lat: -25.2446384, lng: 27.0853536 };

            // initialise google maps on the page
            map = new google.maps.Map(document.getElementById('mapResults'), {
                center: Pilanesberg,
                zoom: 11
            });               

             // wait for map to fully load
            google.maps.event.addListenerOnce(map, 'idle', function(){
                // raise resize event to display map (answered by @philip-miglinci from http://stackoverflow.com/questions/4064275/how-to-deal-with-google-map-inside-of-a-hidden-div-updated-picture?rq=1)
                window.dispatchEvent(new Event('resize'));

                // reset center
                map.setCenter(Pilanesberg);

                // resolve once map has finished loading
                resolve(true);                     
            });
        });
    };

    // function to add a marker to a map
    var addMarkerToMap = function (sighting, imageReference) {
        // define marker
        var marker = new google.maps.Marker({
            position: { lat: parseFloat(sighting.latitude), lng: parseFloat(sighting.longitude) },
            map: map,
            icon: viewGeneral.getMapMarkerForAnimalType(sighting.animalType)
        });

        // add marker to array
        markers.push(marker);

        // configure html for info window
        var contentString = '<div id="content" style="opacity: 1.0;">' +
            '<div id="sightingInfo">' +
            '</div>' +
            '<hr /><h3 id="firstHeading" class="firstHeading">' + sighting.animalType + '</h3><hr />' +
            '<div id="bodyContent">' +
            '<p><b>Description: </b><br/>' + sighting.description + '</p>' +
            '<p><b>Submitted by: </b><br/>' + sighting.submittedBy + ' at ' + sighting.dateTime + '</p>' + 
            '<p><b>Latitude: </b>' + sighting.latitude + '; <b>Longitude: </b>' + sighting.longitude + '</p><hr />' +
            '<h3 id="imageHeading" class="firstHeading">IMAGE</h3><hr />' +
            '<img src="' + imageReference + '" style="width: 100%; height: 100%;" />';
            '<br/>'
            '</div>' +
            '</div>';

        // set info window
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        // add event for marker
        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });
    };

    // function to retrieve images from firebase
    var getImagesFromFirebase = function (safariSightings) {
        // initialise variables
        var sightingImages = [];
        var promises = [];

        // loop through each sighting
        $.each(safariSightings, function (index, sightingResult) {
            // get firebase image url (taken from answer by @rash at http://stackoverflow.com/questions/2526061/getting-just-the-filename-from-a-path-with-javascript)
            var imageFileName = sightingResult.imageUrl.split('\\').pop();

            // push the promise
            promises.push(safariController.getDownloadUrlFromImage(imageFileName));
        });

        // return promises array
        return Promise.all(promises);
    };

    // function to add latest sightings
    var addAllSightings = function (safariSightings) {
        return new Promise(function (resolve) {
            // initialise html
            var html = '';

            // clear latest sighting div
            sightingSearchResultsDiv.empty();

            // form html
            $.each(safariSightings, function (index, sightingResult) {
                html += '<div class="list-group-item">';
                html += '<div class="row-picture">';
                html += '<img class="circle" src="' + viewGeneral.getThumbnailForAnimalType(sightingResult.animalType) + '" alt="icon">';
                html += '</div>';
                html += '<div class="row-content">';
                html += '<h4 class="list-group-item-heading">' + sightingResult.animalType + '</h4>';
                html += '<p class="list-group-item-text">' + sightingResult.description + '</p><br/>';
                html += '<p class="list-group-item-text" style="font-size: 12px;">Submitted by: ' + sightingResult.submittedBy + '</p>';
                html += '<p class="list-group-item-text" style="font-size: 12px;">Latitude: ' + sightingResult.latitude + '; Longitude: ' + sightingResult.longitude + '</p>';
                html += '<p class="list-group-item-text" style="font-size: 12px;">Sighting Date/Time: ' + sightingResult.dateTime + '</p>';                
                html += '</div>';
                html += '</div>';
                html += '<div class="list-group-separator"></div>';
            });

            // append formed html to page
            sightingSearchResultsDiv.append(html);

            // resolve promise
            resolve(true);
        });        
    };

    // function to process the search results based on the user's search criteria
    var processSearchResults = function () {
        // initialise variables        
        var animalType = searchAnimalTypeControl.val();
        var period = searchPeriodControl.val();

        // verify that the form is valid before submitting
        searchSightingForm.validator('validate');

        // show error messages on load
        $(".help-block").show();
        
        // validate form input
        if ($("#searchSightingForm > .has-error").length === 0 &&
            $("#searchSightingForm input, #searchSightingForm select, #searchSightingForm textarea").filter(function () { return $.trim($(this).val()).length == 0 || $(this).val() === '' }).length === 0) {

                // retrieve search results
                safariController.processSearch(animalType, period)
                    .then(function (searchResults) {
                        // process offline and online views
                        if (navigator.onLine) {
                            // show search results map
                            searchResultsMapDiv.show(500);

                            // hide search results list
                            searchResultsListDiv.hide();

                            // initialise map
                            initialiseMap()
                                .then(function (result) {
                                    // retrieve images for search results from firebase
                                    getImagesFromFirebase(searchResults)
                                        .then(function(sightingImageResults) {
                                            // loop through each sighting
                                            $.each(searchResults, function (index, sightingResult) {
                                                // add marker if map exists
                                                if (typeof map !== 'undefined') {
                                                    addMarkerToMap(sightingResult, sightingImageResults[index]);
                                                }
                                            });
                                        });
                                });                        

                        } else {
                            // show search results map
                            searchResultsMapDiv.hide();

                            // hide search results list
                            searchResultsListDiv.show(500);

                            // add cached sightings to view
                            addAllSightings(searchResults);
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
        };
    };

    // function to hook events
    var hookEvents = function () {
        searchButtonControl.on('click', processSearchResults);
    };

    // function to initialise the view on the page
    var initialiseView = function () {
        // hide selection landing page
        landingSelectionDiv.hide();

        // show add sighting container
        latestSightingsDiv.show(500);  

        // validate form on load
        searchSightingForm.validator('validate');

        // hook events
        hookEvents();
    };

    // expose public methods
    return {
        initialiseView: initialiseView,
        initialiseMap: initialiseMap
    };
} ();