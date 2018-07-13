const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const request = require('request');
const Venue = require("./models/Venue");

app.use(logger("dev"));
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

mongoose.connect("mongodb://heroku_vk2ndsq5:n9cblcgr9j5p5r6lj5t9qqfklk@ds139124.mlab.com:39124/heroku_vk2ndsq5");
const db = mongoose.connection;

db.on("error", function (err) {
  console.log("Mongoose Error: ", err);
});

db.once("open", function () {
  console.log("Mongoose connection successful.");
});

// -------------------------------------------------

// Route to get venues from google places AP
// Note: API call has to be done in the back-end and not with helpers as google does not allow calls from the front-end. *Trust me, had to learn the hard way.
app.post("/api/places", function (req, res) {
  const keyword = req.body.keyword;
  const lat = req.body.lat;
  const lng = req.body.lng;
  // going from miles to meters as per the google maps API
  const radius = req.body.radius * 1609.344;
  console.log(keyword, lat, lng, radius);

  const googlePlacesAPI = "AIzaSyCYeih3P-UfimZCY3kIBSFwKugLXM-5VbY";

  const queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + lng + "&radius=" + radius + "&keyword=" + keyword + "&opennow=true&key=" + googlePlacesAPI; 

  request(queryURL, function (error, response, body) {
    if (error) {
      console.log(error);
    }

    res.status(200).send(body);
  });
});

app.post("/api/placeHourInfo", function (req, res) {

  const placeReference = req.body.placeReference;
  const googlePlacesAPI = "AIzaSyCYeih3P-UfimZCY3kIBSFwKugLXM-5VbY";

  const detailsURL = "https://maps.googleapis.com/maps/api/place/details/json?reference=" + placeReference + "&key=" + googlePlacesAPI;

  request(detailsURL, function (error, response, body) {
    if (error) {
      console.log(error);
    }

    res.status(200).send(body);
  });
});

// Route to add an venue to saved list
app.post("/api/saved", function (req, res) {
  const newVenue = new Venue(req.body);

  console.log(req.body);

  newVenue.save(function (err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.status(200).send(doc);
    }
  });
});

// Route to get all saved venues
app.get("/api/saved", function (req, res) {

  Venue.find({})
    .exec(function (err, doc) {

      if (err) {
        console.log(err);
      }
      else {
        res.status(200).send(doc);
      }
    });
});



// Route to delete an venues from saved list
app.delete("/api/saved/", function (req, res) {

  const reference = req.param("reference");

  Venue.find({ reference: reference }).remove().exec(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      res.status(200).send("Deleted");
    }
  });
});

/* SETUP FOR RUNNING TESTS VS RUNNING `node server.js`*/ 
let server;
function runServer() {
  const port = process.env.PORT || 3000;
  return new Promise((resolve, reject) => {
    server = app
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve(server);
      })
      .on("error", err => {
        reject(err);
      });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log("Closing server");
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// -------------------------------------------------

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };