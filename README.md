# Senior Web Developer Nanodegree - Project 5 - Capstone Project

This is the fifth project for the Udacity Nanodegree: the capstone project. My capstone project is a safari viewer.

# About the Application

The safari viewer application centres around the Pilanesberg National Park in South Africa, a Big-5 National Park in the North West province. It allows one to capture game sightings within the park for other vistors to view and potentially follow up on. Because online connectivity within the park is inconsistent, dependent upon where in the park you are, the application provides an offline-first experience for users to both upload and view game sightings. For the purposes of this project, game sightings are limited to lions, elephants, hippos, impalas, and leopards.

The application provides three core functions:
- View the latest game sightings: this allows one to view the latest game sightings captured in the system.
- Add your own game sightings: this allows one to capture their own game sighting based on their current location. Alternatively, a user can use Google maps to specify a particular location, or to enter in a set of coordinates manually. An offline feature allows one to capture a sighting and then have it uploaded when connectivity becomes available. 
- Search for a game sighting: based on a particular animal and time period, this function allows a user to search for a particular sighting.

# Technical Dependencies

- jQuery
- Firebase (https://firebase.google.com/)
- Google Maps API (https://developers.google.com/maps/documentation/javascript/)
- Bootstrap Meterial Design (http://fezvrasta.github.io/bootstrap-material-design/)
- Twitter Bootstrap 3 (http://getbootstrap.com/)
- Twitter Bootstrap Accessibility Plugin (https://github.com/paypal/bootstrap-accessibility-plugin)
- Twitter Bootstrap Validator Plugin (https://1000hz.github.io/bootstrap-validator/)
- Images from Pixabay (https://pixabay.com/)

# Build Steps

In order to run the application, clone or download the repo:
```
npm install
```
This will download all the relevant node package dependencies. To build in a releasable state, execute:
```
grunt release
```

# Demo Page

The full application can be viewed at https://mysafariviewer.apphb.com/