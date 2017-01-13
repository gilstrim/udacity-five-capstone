// view functionality for the landing page of the safari review app
viewLandingPage = function () {

    // initialise variables
    var getStartedButton = $("#btnGetStarted");
    var aboutUsButton = $("#btnAboutUs");
    var landingDiv = $("#divLandingText");
    var selectionLandingDiv = $("#divLandingSelection");
    var viewLatestSightingsControl = $("#btnOpenViewLatestSightings");
    var aboutContainerDiv = $("#divAboutContainer"); 

    // function to process the getting started logic
    var processGettingStarted = function() {
        // hide landing page div
        landingDiv.hide();

        // show info window
        selectionLandingDiv.show(500);

        // set focus to view latest sightings button
        viewLatestSightingsControl.focus();
    };

    // function to process the about us logic
    var processAboutUs = function() {
        // hide landing page div
        landingDiv.hide();

        // add active attribute to relevant tab
        $('li a:contains("About")').first().parent().addClass('active');

        // initialise view
        aboutContainerDiv.show(500);
    };

    // function to hook events
    var hookEvents = function() {
        // getting started
        getStartedButton.on('click', processGettingStarted);
        
        // about us
        aboutUsButton.on('click', processAboutUs);
    };

    // function to initialise the view on the page
    var initialiseView = function () {
        // hook events
        hookEvents();                
    };

    // expose public methods
    return {
        initialiseView: initialiseView
    };
} ();