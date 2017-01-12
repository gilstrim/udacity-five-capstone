// initialise variables for caching
var staticCacheName = 'sighting-static-v1';
var imageCacheName = 'sighting-image-v3';

var srcCacheFiles = ['/','/index.html','/css/style.css','/css/animate.css','/css/bootstrap.min.css','/css/bootstrap-accessibility.css','/css/bootstrap-material-design.min.css','/css/ripples.min.css','/fonts/glyphicons-halflings-regular.eot','/fonts/glyphicons-halflings-regular.svg','/fonts/glyphicons-halflings-regular.ttf','/fonts/glyphicons-halflings-regular.woff','/fonts/glyphicons-halflings-regular.woff2','/fonts/Roboto-Regular.eot','/fonts/Roboto-Regular.ttf','/fonts/Roboto-Regular.woff','/fonts/Roboto-Regular.woff2','/fonts/cabin/Cabin-Regular.ttf','/fonts/ubuntu/Ubuntu-Regular.ttf','/js/bootstrap-accessibility.min.js','/js/bootstrap.min.js','/js/controller.js','/js/firebase.js','/js/idb.js','/js/init.js','/js/jquery.min.js','/js/material.min.js','/js/model.js','/js/moment.min.js','/js/ripples.min.js','/js/sightingIdb.js','/js/validator.min.js','/js/view.js','/js/viewAddSightings.js','/js/viewAllSightings.js','/js/viewGeneral.js','/js/viewLandingPage.js','/js/viewLatestSightings.js','/img/markers/icon-black.png','/img/markers/icon-blue.png','/img/markers/icon-green.png','/img/markers/icon-pink.png','/img/markers/icon-red.png','/img/thumbnails/elephant-thumb.jpg','/img/thumbnails/hippo-thumb.jpg','/img/thumbnails/impala-thumb.jpg','/img/thumbnails/leopard-thumb.jpg','/img/thumbnails/lion-thumb.jpg','/img/background.jpg'];

/*var distCacheFiles = [
    '/', 
    '/index.html', 
    '/css/app.min.css', 
    '/font/material-design-icons/MaterialIcons-Regular.eot', 
    '/font/material-design-icons/MaterialIcons-Regular.woff2', 
    '/font/material-design-icons/MaterialIcons-Regular.woff', 
    '/font/material-design-icons/MaterialIcons-Regular.ttf', 
    '/font/roboto/Roboto-Bold.ttf', 
    '/font/roboto/Roboto-Thin.ttf', 
    '/font/roboto/Roboto-Regular.ttf', 
    '/img/background.jpg', 
    '/js/app.min.js'
];*/

var allCaches = [
    staticCacheName,
    imageCacheName
];

// install event - cache items
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll(srcCacheFiles);
        })
    );
});

// activate event - get rid of old caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('sighting-') &&
                        !allCaches.includes(cacheName);
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});


// fetch event - return cached items or go to network
self.addEventListener('fetch', function (event) {
    var requestUrl = new URL(event.request.url);   

    if (requestUrl.hostname === 'firebasestorage.googleapis.com') {
        event.respondWith(storageImageResponse(event.request));
    }
    else {        
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    return response || fetch(event.request);
                })
                .catch(function (error) {
                    console.log('Error fetching from cache: ' + error.stack);
                })
        );
    }
});

// function to process image cache - based on flickr code from jake archibald at https://github.com/jakearchibald/trained-to-thrill/blob/3291dd40923346e3cc9c83ae527004d502e0464f/www/static/js-unmin/sw/index.js#L109
function storageImageResponse(request) {
    return caches.match(request).then(function (response) {
        if (response) {
            return response;
        }
        //console.log('Wazzup!?');
        return fetch(request.clone()).then(function (response) {
            caches.open(imageCacheName).then(function (cache) {
                cache.put(request, response).then(function () {
                    console.log('yey img cache');
                }, function () {
                    console.log('nay img cache');
                });
            });

            return response.clone();
        });
    });
}

// message event - used for skip waiting so that the sw can update immediately
self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});