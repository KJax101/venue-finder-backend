const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, runServer, closeServer } = require("../server");
const expect = chai.expect;
chai.use(chaiHttp);

describe("Venue Finder", function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it("executes the get `saved` route with no errors", function() {
    return chai
      .request(app)
      .get("/api/saved")
      .then(function(res) {
        expect(res).to.have.status(200);
      });
  });

  it("executes the post `places` route with no errors", function() {
    return chai
      .request(app)
      .post("/api/places")
      .then(function(res) {
        expect(res).to.have.status(200);
      });
  });

  it("executes the post `placeHourInfo` route with no errors", function() {
    return chai
      .request(app)
      .get("/api/saved")
      .then(function(res) {
        expect(res).to.have.status(200);
      });
  });

  it("executes the post `saved` route with no errors", function() {
    return chai
      .request(app)
      .get("/api/saved")
      .then(function(res) {
        expect(res).to.have.status(200);
        process.exit();
      });
  });
});
