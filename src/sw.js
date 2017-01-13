// initialise variables for caching
var staticCacheName = 'sighting-static-v10';
var srcCacheFiles = ['/','/index.html','/manifest.json','/css/style.css','/css/animate.css','/css/bootstrap.min.css','/css/bootstrap-accessibility.css','/css/bootstrap-material-design.min.css','/css/ripples.min.css','/fonts/glyphicons-halflings-regular.eot','/fonts/glyphicons-halflings-regular.svg','/fonts/glyphicons-halflings-regular.ttf','/fonts/glyphicons-halflings-regular.woff','/fonts/glyphicons-halflings-regular.woff2','/fonts/Roboto-Regular.eot','/fonts/Roboto-Regular.ttf','/fonts/Roboto-Regular.woff','/fonts/Roboto-Regular.woff2','/fonts/cabin/Cabin-Regular.ttf','/fonts/ubuntu/Ubuntu-Regular.ttf','js/initialiseFirebase.js','/js/bootstrap-accessibility.min.js','/js/bootstrap.min.js','/js/controller.js','/js/firebase.js','/js/idb.js','/js/init.js','/js/jquery.min.js','/js/material.min.js','/js/model.js','/js/moment.min.js','/js/ripples.min.js','/js/sightingIdb.js','/js/validator.min.js','/js/viewAddSightings.js','/js/viewAllSightings.js','/js/viewGeneral.js','/js/viewLandingPage.js','/js/viewLatestSightings.js','/img/markers/icon-black.png','/img/markers/icon-blue.png','/img/markers/icon-green.png','/img/markers/icon-pink.png','/img/markers/icon-red.png','/img/thumbnails/elephant-thumb.jpg','/img/thumbnails/hippo-thumb.jpg','/img/thumbnails/impala-thumb.jpg','/img/thumbnails/leopard-thumb.jpg','/img/thumbnails/lion-thumb.jpg','/img/background.jpg','/icons/icon.png'];
var distCacheFiles = ['/','/index.html','/manifest.json','/css/app.min.css','/js/app.min.js','/icons/icon.png','/img/markers/icon-black.png','/img/markers/icon-blue.png','/img/markers/icon-green.png','/img/markers/icon-pink.png','/img/markers/icon-red.png','/img/thumbnails/elephant-thumb.jpg','/img/thumbnails/hippo-thumb.jpg','/img/thumbnails/impala-thumb.jpg','/img/thumbnails/leopard-thumb.jpg','/img/thumbnails/lion-thumb.jpg','/img/background.jpg','/fonts/glyphicons-halflings-regular.eot','/fonts/glyphicons-halflings-regular.svg','/fonts/glyphicons-halflings-regular.ttf','/fonts/glyphicons-halflings-regular.woff','/fonts/glyphicons-halflings-regular.woff2','/fonts/Roboto-Regular.eot','/fonts/Roboto-Regular.ttf','/fonts/Roboto-Regular.woff','/fonts/Roboto-Regular.woff2','/fonts/cabin/Cabin-Regular.ttf','/fonts/ubuntu/Ubuntu-Regular.ttf'];

var allCaches = [
    staticCacheName
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

    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                return response || fetch(event.request);
            })
            .catch(function (error) {
                console.log('Error fetching from cache: ' + error.stack);
            })
    );
});

// message event - used for skip waiting so that the sw can update immediately
self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});