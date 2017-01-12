// view functionality for the safari review app
safariView = function () {

    /*
    // initialise variables
    var animalTypeControl = $("#cboAnimalType");
    var sightingControl = $("#txtSightingDescription");
    var uploadImageControl = $("#fileUploadSighting");
    var submitSightingButton = $("#btnSubmitReview");
    var latestSightingsDiv = $("#divLatestSightings");
    var addSightingDiv = $("#divAddSightingContainer");
    var viewSightingsDiv = $("#divAddSightingContainer");

    var mapReference = $("#map");
    var mapSearchResults = '';
    var map = '';
    var submitSearchButton = $("#btnSubmitSearch");
    var searchAnimalTypeControl = $("#cboSearchAnimalType");
    var searchPeriodControl = $("#cboSearchPeriod");

    var openViewLatestSightingsButton = $("#btnOpenViewLatestSightings");
    var openViewAddSightingsButton = $("#btnOpenViewAddSightings");
    var openViewSightingsButton = $("#btnOpenViewSightings");

    // function to upload a sighting
    var addSighting = function () {
        // initialise variables
        var animalType = animalTypeControl.val();
        var sightingDescription = sightingControl.val();
        var imageUrl = uploadImageControl.val();

        // call controller to upload a sighting
        safariController.addSighting(animalType, sightingDescription, imageUrl)
    };

    var formatSightingHtml = function (safariSightings) {
        // initialise variables
        var html = '';

        // clear existing search results
        latestSightingsDiv.html('');

        var promises = [];

        // form html
        $.each(safariSightings, function (index, sightingResult) {
            // get firebase image url (taken from answer by @rash at http://stackoverflow.com/questions/2526061/getting-just-the-filename-from-a-path-with-javascript)
            var imageFileName = sightingResult.imageUrl.split('\\').pop();

            promises.push(safariController.getDownloadUrlFromImage(imageFileName));
        });

        return Promise.all(promises);
    }

    // function to add latest sightings
    var addLatestSightings = function (safariSightings) {
        formatSightingHtml(safariSightings)
            .then(function (result) {
                var html = '';
                var colorArray = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];

                var Pilanesberg = { lat: -25.2446384, lng: 27.0853536 };
                map = new google.maps.Map(document.getElementById('map'), {
                    center: Pilanesberg,
                    zoom: 11
                });

                // form html
                $.each(safariSightings, function (index, sightingResult) {
                    html += '<div class="list-group-item">';
                    html += '<div class="row-picture">';
                    html += '<img class="circle" src="' + result[index] + '" alt="icon">';
                    html += '</div>';
                    html += '<div class="row-content">';
                    html += '<h4 class="list-group-item-heading">' + sightingResult.animalType + '</h4>';
                    html += '<p class="list-group-item-text">' + sightingResult.description + '</p><br/>';
                    html += '<p class="list-group-item-text" style="font-size: 12px;">' + sightingResult.submittedBy + '</p>';
                    html += '<p class="list-group-item-text" style="font-size: 12px;">' + sightingResult.dateTime + '</p>';
                    html += '<div class="least-content"><img class="circle" src="http://maps.google.com/mapfiles/ms/icons/' + colorArray[index] + '.png" alt="icon"></div>';
                    //html += '<div class="least-content">' + sightingResult.submittedBy + ' at ' + sightingResult.dateTime + '</div>';
                    html += '</div>';
                    html += '</div>';
                    html += '<div class="list-group-separator"></div>';

                    var marker = new google.maps.Marker({
                        position: { lat: sightingResult.latitude, lng: sightingResult.longitude },
                        map: map,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/' + colorArray[index] + '.png'
                    });
                });

                // append formed html to page
                latestSightingsDiv.append(html);
            });
    };

    var addSightingsToMap = function (safariSightings) {
        //$.each(safariSightings, function (index, sightingResult) {
        //    var marker = new google.maps.Marker({
        //        position: { lat: sightingResult.latitude, lng: sightingResult.longitude },
        //        setMap: map,
        //        icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png'
        //    });
        //});
    };

    var initialiseMap = function () {
        

        //mapSearchResults = new google.maps.Map(document.getElementById('mapResults'), {
        //    center: Pilanesberg,
        //    zoom: 12
        //});
    };

    var removeAllMarkers = function () {
        var sightings = safariController.getAllSightings();


    };

    var processSearch = function () {
        var animalType = searchAnimalTypeControl.val();
        var period = searchPeriodControl.val();
        var sightings = safariController.processSearch(animalType, period);
        var animalLegend = [{
            animalType: 'LION',
            color: 'blue'
        },
            {
                animalType: 'ELEPHANT',
                color: 'red'
            },
            {
                animalType: 'IMPALA',
                color: 'yellow'
            },
            {
                animalType: 'LEOPARD',
                color: 'green'
            },
            {
                animalType: 'HIPPO',
                color: 'pink'
            }];

        $.each(sightings, function (index, sightingResult) {
            var color = '';

            $.each(animalLegend, function (index, legendResult) {
                if (legendResult.animalType === sightingResult.animalType)
                    color = legendResult.color;
            });

            var contentString = '<div id="content">' +
                '<div id="siteNotice">' +
                '</div>' +
                '<h1 id="firstHeading" class="firstHeading">' + sightingResult.animalType + '</h1>' +
                '<div id="bodyContent">' +
                '<p>' + sightingResult.description + '</p>' +
                '<p>Spotted by ' + sightingResult.submittedBy + ' at ' + sightingResult.dateTime + '</p>' + 
                '<br/>' +
                '<img src="img/buffalo1.jpg" style="width: 100%; height: 100%" />';
                '<br/>' +                               
                '</div>' +
                '</div>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            var marker = new google.maps.Marker({
                position: { lat: sightingResult.latitude, lng: sightingResult.longitude },
                map: mapSearchResults,
                icon: 'http://maps.google.com/mapfiles/ms/icons/' + color + '.png'
            });

            marker.addListener('click', function () {
                infowindow.open(map, marker);
            });
        });
    };

    var processOpenViewLatestSightings = function() {  
        var sightings = safariController.getAllSightings();

        safariView.addLatestSightings(sightings);

        if ($('#divAddSightingContainer').is(':hidden') && $('#divLatestSightingsContainer').is(':hidden') && $('#divViewSightingContainer').is(':hidden')) {
            $('#divLatestSightingsContainer').addClass('animated fadeIn').show(); 
        } else {
            $('#divAddSightingContainer').addClass('animated fadeOut');
            $('#divAddSightingContainer').hide();
            $('#divAddSightingContainer').removeClass('animated fadeOut');

            $('#divViewSightingContainer').addClass('animated fadeOut');
            $('#divViewSightingContainer').hide();
            $('#divViewSightingContainer').removeClass('animated fadeOut');
            
            $('#divLatestSightingsContainer').addClass('animated fadeIn').show();              
        };               
    };

    var processOpenViewAddSightings = function() { 

        if ($('#divAddSightingContainer').is(':hidden') && $('#divLatestSightingsContainer').is(':hidden') && $('#divViewSightingContainer').is(':hidden')) {
            $('#divAddSightingContainer').addClass('animated fadeIn').show();            
        } else {
            $('#divLatestSightingsContainer').addClass('animated fadeOut');
            $('#divLatestSightingsContainer').hide();
            $('#divLatestSightingsContainer').removeClass('animated fadeOut');

            $('#divViewSightingContainer').addClass('animated fadeOut');
            $('#divViewSightingContainer').hide();
            $('#divViewSightingContainer').removeClass('animated fadeOut');

            $('#divAddSightingContainer').addClass('animated fadeIn').show();             
        };              
    };

    var processOpenViewSightings = function() {

        if ($('#divAddSightingContainer').is(':hidden') && $('#divLatestSightingsContainer').is(':hidden') && $('#divViewSightingContainer').is(':hidden')) {
            $('#divViewSightingContainer').addClass('animated fadeIn').show();            
        } else {            
            $('#divAddSightingContainer').addClass('animated fadeOut');
            $('#divAddSightingContainer').hide();
            $('#divAddSightingContainer').removeClass('animated fadeOut');

            $('#divLatestSightingsContainer').addClass('animated fadeOut');
            $('#divLatestSightingsContainer').hide();
            $('#divLatestSightingsContainer').removeClass('animated fadeOut');

            $('#divViewSightingContainer').addClass('animated fadeIn').show();             
        };
    };

    // function to hook view events
    var hookEvents = function () {
        // hook event when the search button is clicked
        submitSightingButton.on('click', addSighting);

        submitSearchButton.on('click', processSearch);

        openViewLatestSightingsButton.on('click', processOpenViewLatestSightings);

        openViewAddSightingsButton.on('click', processOpenViewAddSightings);

        openViewSightingsButton.on('click', processOpenViewSightings);
    };*/

    // function to initialise the view on the page
    var initialiseView = function () {
        // hook events
        //hookEvents();        
    };

    // expose public methods
    return {
        initialiseView: initialiseView/*,
        addLatestSightings: addLatestSightings,
        addSightingsToMap: addSightingsToMap*/
    };
} ();
