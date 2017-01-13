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
    var searchResultsControl = $("#divSearchResults");
    var modalWindow = $("#myModal");
    var modalButton;
    var viewImageButton = $(".btnViewImage");

    // function to initialise map
    var initialiseMap = function () {
        return new Promise(function (resolve, reject) {
            // set default coordinates
            var Pilanesberg = { lat: -25.2446384, lng: 27.0853536 };

            // initialise google maps on the page
            map = new google.maps.Map(document.getElementById('mapResults'), {
                center: Pilanesberg,
                zoom: 11
            });

            // wait for map to fully load
            google.maps.event.addListenerOnce(map, 'idle', function () {
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

    // function to validate the search form
    var validateSearchForm = function () {
        // initialise variables
        var numErrors = 0;
        var numEmptyFields = 0;

        // set values
        numErrors = $("#searchSightingForm > .has-error").length;
        numEmptyFields = $("#searchSightingForm input, #searchSightingForm select, #searchSightingForm textarea")
            .filter(function () { 
                return $.trim($(this).val()).length === 0 || $(this).val() === '';
        }).length;

        // validate results
        if (numErrors === 0 && numEmptyFields === 0)
            return true;
        else
            return false;
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
        if (validateSearchForm()) {
            // retrieve search results
            safariController.processSearch(animalType, period)
                .then(function (searchResults) {
                    // set search results
                    searchResultsControl.find('p').text('A total of ' + searchResults.length + ' sighting(s) were found!');
                    searchResultsControl.show(500);

                    // process offline and online views
                    if (navigator.onLine) {
                        // show search results map
                        searchResultsMapDiv.show(500);

                        // hide search results list
                        searchResultsListDiv.show(500);

                        // add cached sightings to view
                        viewGeneral.configSightingsHtml(searchResults, sightingSearchResultsDiv);

                        // initialise map
                        initialiseMap()
                            .then(function (result) {
                                // retrieve images for search results from firebase
                                return getImagesFromFirebase(searchResults)
                                    .then(function (sightingImageResults) {
                                        // loop through each sighting
                                        $.each(searchResults, function (index, sightingResult) {
                                            // add marker if map exists
                                            if (typeof map !== 'undefined') {
                                                addMarkerToMap(sightingResult, sightingImageResults[index]);
                                            }
                                        });
                                    });
                            })
                            .then(function (result) {
                                // process modal click logic
                                viewGeneral.processModalClickLogic();
                            });
                    } else {
                        // show search results map
                        searchResultsMapDiv.hide();

                        // hide search results list
                        searchResultsListDiv.show(500);

                        // add cached sightings to view
                        viewGeneral.configSightingsHtml(searchResults, sightingSearchResultsDiv);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };

    // function to hook events
    var hookEvents = function () {
        // process search button
        searchButtonControl.on('click', processSearchResults);
    };

    // function to initialise the view on the page
    var initialiseView = function () {
        // hide selection landing page
        landingSelectionDiv.hide();

        // hide information messages
        searchResultsControl.hide();

        // set active navigation link
        $('li a:contains("View Sightings")').first().parent().addClass('active');

        // show add sighting container
        latestSightingsDiv.show(500);

        // set focus to first control        
        setTimeout(function () { searchAnimalTypeControl.focus(); }, 1000);

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