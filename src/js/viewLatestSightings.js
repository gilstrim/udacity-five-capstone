// view functionality for the safari review app
viewLatestSightings = function() {

    // declare constants
    var NUMBER_OF_SIGHTINGS = 6;

    // initialise variables
    var latestSightingsDiv = $("#divLatestSightings");
    var latestSightingsMap = $("#latestSightingsMap");
    var latestSightingsContainerDiv = $("#divLatestSightingsContainer");
    var landingSelectionDiv = $("#divLandingSelection");
    var latestSightingMapMessage = $("#latestSightingMapMessage");
    var map;        

    // function to add latest sightings
    var getLatestSightingsFromCache = function(safariSightings) {
        return new Promise(function(resolve, reject) {
            // configure html for sightings list
            viewGeneral.configSightingsHtml(safariSightings, latestSightingsDiv)                
                .then(function (result) {            
                    // resolve promise
                    resolve(true);
                })
                .catch(function (error) {
                    // reject any errors
                    reject('Error configuring latest sightings: ' + error + '; ' + error.stack);
                });
        });
    };
    
    // function to add latest sightings
    var addLatestSightings = function(safariSightings) {
        return new Promise(function(resolve, reject) {
            // select top number of sightings
            safariSightings = safariSightings.slice(0, NUMBER_OF_SIGHTINGS);

            // configure html for sightings list
            viewGeneral.configSightingsHtml(safariSightings, latestSightingsDiv)
                .then(function(result) {                    
                    // initialise google maps
                    return initialiseMap();
                })
                .then(function(result) {
                    // loop through each sighting
                    $.each(safariSightings, function(index, sightingResult) {
                        // add marker if map exists
                        if (typeof map !== 'undefined') {
                            addMarkerToMap(sightingResult);
                        }
                    });

                    // add to cache
                    return sightingsIdb.addSightingsToCache(safariSightings, null, false);
                })
                .then(function(result) {
                    // process modal click logic
                    viewGeneral.processModalClickLogic();
                })            
                .then(function (result) {
                    // resolve promise
                    resolve(true);
                })
                .catch(function (error) {
                    // reject any errors
                    reject('Error configuring latest sightings: ' + error + '; ' + error.stack);
                });
        });
    };

    // function to add a marker to a map
    var addMarkerToMap = function(sighting) {
        // define marker
        var marker = new google.maps.Marker({
            position: { lat: parseFloat(sighting.latitude), lng: parseFloat(sighting.longitude) },
            map: map,
            icon: viewGeneral.getMapMarkerForAnimalType(sighting.animalType)
        });
    };

    // function to initialise map
    var initialiseMap = function() {
        return new Promise(function(resolve, reject) {
            // validate if online or not
            if (navigator.onLine) {
                // show map
                latestSightingsMap.show(); 

                // hide offline message
                latestSightingMapMessage.hide();                    

                // set default coordinates
                var Pilanesberg = { lat: -25.2449489, lng: 27.0891302 };

                // initialise google maps on the page
                map = new google.maps.Map(document.getElementById('map'), {
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
            } else {
                // hide the map
                latestSightingsMap.hide();
            }                       
        });
    };

    // function to initialise the view
    var initialiseView = function() {
        // hide selection landing page
        landingSelectionDiv.hide();       

        // set active navigation link
        $('li a:contains("Latest Sightings")').first().parent().addClass('active');

        // retrieve sightings from cache
        sightingsIdb.getSightingsFromCache()
            .then(function (cachedResults) {
                // add cached sightings to view
                return getLatestSightingsFromCache(cachedResults);
            })
            .then(function (result) {
                // validate if online
                if (navigator.onLine) {
                    // retrieve latest sightings from firebase
                    return safariController.initialiseModel();
                }
                else {
                    // dummy return
                    return null;
                }
            })
            .then(function (firebaseSightings) {
                if (firebaseSightings !== null) {
                    // show view for the latest recorded sightings
                    latestSightingsContainerDiv.show(500);                     

                    // add sightings to view
                    return addLatestSightings(firebaseSightings[0]);
                } else {
                    // show view for the latest recorded sightings
                    latestSightingsContainerDiv.show(500);

                    // dummy return
                    return null;
                }
            })
            .then(function (result) {
                // set focus to latest sightings panel
                $("#divLatestSightings .list-group-item:first").focus();
            })
            .catch(function (error) {
                // log error to console
                console.log(error);
            });              
    };

    // expose public methods
    return {
        initialiseView: initialiseView,
        addLatestSightings: addLatestSightings,
        getLatestSightingsFromCache: getLatestSightingsFromCache
    };
}();