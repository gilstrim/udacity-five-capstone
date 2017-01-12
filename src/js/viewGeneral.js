// general view functionality for the safari review app
viewGeneral = function () {

    // initialise variables
    var viewLatestSightingsButton = $("#btnOpenViewLatestSightings");
    var viewAddSightingsButton = $("#btnOpenViewAddSightings");
    var viewOpenSightingsButton = $("#btnOpenViewSightings");     
    var landingTextDiv = $("#divLandingText");
    var landingSelectionDiv = $("#divLandingSelection");
    var latestSightingsDiv = $("#divLatestSightingsContainer");
    var addSightingDiv = $("#divAddSightingContainer");
    var viewSightingDiv = $("#divViewSightingContainer");
    var aboutContainerDiv = $("#divAboutContainer"); 

    // function to retrieve thumbnail URL based on the animal type
    var getThumbnailForAnimalType = function(animalType) {
        // initialise variables
        var thumbnailUrl = '';

        // get url
        switch (animalType) {
            case 'HIPPO':
                thumbnailUrl = 'img/thumbnails/hippo-thumb.jpg';
                break;
            case 'LEOPARD':
                thumbnailUrl = 'img/thumbnails/leopard-thumb.jpg';
                break;
            case 'ELEPHANT':
                thumbnailUrl = 'img/thumbnails/elephant-thumb.jpg';
                break;
            case 'LION':
                thumbnailUrl = 'img/thumbnails/lion-thumb.jpg';
                break;
            case 'IMPALA':
                thumbnailUrl = 'img/thumbnails/impala-thumb.jpg';
                break;
        };

        // return thumbnail url
        return thumbnailUrl;
    };

    // function to retrieve map marker URL based on the animal type
    var getMapMarkerForAnimalType = function(animalType) {
        // initialise variables
        var mapMarkerlUrl = '';

        // get url
        switch (animalType) {
            case 'HIPPO':
                mapMarkerlUrl = 'img/markers/icon-black.png';
                break;
            case 'LEOPARD':
                mapMarkerlUrl = 'img/markers/icon-blue.png';
                break;
            case 'ELEPHANT':
                mapMarkerlUrl = 'img/markers/icon-green.png';
                break;
            case 'LION':
                mapMarkerlUrl = 'img/markers/icon-pink.png';
                break;
            case 'IMPALA':
                mapMarkerlUrl = 'img/markers/icon-red.png';
                break;
        };

        // return thumbnail url
        return mapMarkerlUrl;
    };    

    // function to configure the html to list all sightings
    var configSightingsHtml = function(safariSightings, divControl) {
        return new Promise(function(resolve, reject) {
            // initialise html
            var html = '';

            // clear latest sighting div
            divControl.empty();

            // form html
            $.each(safariSightings, function(index, sightingResult) {
                html += '<div class="list-group-item" tabindex="0">';
                html += '<div class="row-picture">';
                html += '<img aria-hidden="true" class="circle" src="' + getThumbnailForAnimalType(sightingResult.animalType) + '" alt="icon">';
                html += '</div>';
                html += '<div class="row-content">';
                html += '<h4 tabindex="-1" class="list-group-item-heading">' + sightingResult.animalType + '</h4>';
                html += '<p tabindex="-1" class="list-group-item-text">' + sightingResult.description + '</p><br/>';
                html += '<p tabindex="-1" class="list-group-item-text" style="font-size: 12px;">Submitted by: ' + sightingResult.submittedBy + '</p>';
                html += '<p tabindex="-1" class="list-group-item-text" style="font-size: 12px;">Latitude: ' + sightingResult.latitude + '; Longitude: ' + sightingResult.longitude + '</p>';
                html += '<p tabindex="-1" class="list-group-item-text" style="font-size: 12px;">Sighting Date/Time: ' + sightingResult.dateTime + '</p>';

                // only add button if online
                if (navigator.onLine) {
                    html += '<button data-animaltype="' + sightingResult.animalType + '" data-imagename="' + sightingResult.imageUrl + '" tabindex="0" type="button" class="btn btn-raised btn-default btnViewImage" value="View Image">VIEW.IMAGE</button>';
                }
                
                html += '<div aria-hidden="true" class="least-content"><img class="circle" src="' + getMapMarkerForAnimalType(sightingResult.animalType) + '" alt="icon"></div>';
                html += '</div>';
                html += '</div>';
                html += '<div class="list-group-separator"></div>';
            });

            // append formed html to page
            divControl.append(html);
            
            // resolve
            resolve(true);
        });
    };

    // function to process navigation
    var processNavigation = function(navigationText) {
        // initialise variables
        var currentNavigationLink = $('li.active').find('a').first().text();

        // remove active attribute
        $('li.active').removeClass('active');

        // hide previous div
        switch (currentNavigationLink) {
            case 'Latest Sightings': {
                latestSightingsDiv.hide();
                break;
            }
            case 'Add Sighting': {
                addSightingDiv.hide();
                break;
            }
            case 'View Sightings': {
                viewSightingDiv.hide();
                break;
            }
            case 'About': {
                aboutContainerDiv.hide();
                break;
            }
            case '': {
                landingTextDiv.hide();
                landingSelectionDiv.hide();
                break;
            }
        };

        // hide current div
        switch (navigationText) {
            case 'Latest Sightings': {
                // add active attribute to relevant tab
                $('li a:contains("Latest Sightings")').first().parent().addClass('active');

                // initialise view
                viewLatestSightings.initialiseView();

                break;
            }
            case 'Add Sighting': {
                // add active attribute to relevant tab
                $('li a:contains("Add Sighting")').first().parent().addClass('active');

                // initialise view
                viewAddSightings.initialiseView();
                break;
            }
            case 'View Sightings': {
                // add active attribute to relevant tab
                $('li a:contains("View Sightings")').first().parent().addClass('active');

                // initialise view
                viewAllSightings.initialiseView();
                break;
            }
            case 'About': {
                // add active attribute to relevant tab
                $('li a:contains("About")').first().parent().addClass('active');

                // initialise view
                aboutContainerDiv.show(500);
                break;
            }
        };   
    };

    // function to hook events
    var hookEvents = function() {
        // view latest sightings
        viewLatestSightingsButton.on('click', viewLatestSightings.initialiseView);
        
        // add a sighting
        viewAddSightingsButton.on('click', viewAddSightings.initialiseView);

        // search for a sighting
        viewOpenSightingsButton.on('click', viewAllSightings.initialiseView);

        // process navigation
        $('.navbar-nav a').on('click', function() {
            processNavigation($(this)[0].text);
        });
    };

    // function to initialise the view on the page
    var initialiseView = function () {
        // hook events
        hookEvents();                
    };

    // expose public methods
    return {
        initialiseView: initialiseView,
        getThumbnailForAnimalType: getThumbnailForAnimalType,
        getMapMarkerForAnimalType: getMapMarkerForAnimalType,
        configSightingsHtml: configSightingsHtml
    };
} ();