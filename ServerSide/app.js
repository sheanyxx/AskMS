'use strict';

const express = require('express');
var admin = require('firebase-admin');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const client = require('twilio')(process.env.TWILIOA, process.env.TWILIOB);
const bodyParser = require('body-parser');
const algoliasearch = require('algoliasearch')(process.env.ALGOLIAA, process.env.ALGOLIAB);
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

var index = algoliasearch.initIndex('Questions');

var serviceAccount = require("./files/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://askms2-218010.firebaseio.com"
});
var db = admin.database();

app.post('/getExpert/math', (req, res) => {
  index.search({
    query: req.body.Body
  }, (err, contentSearch) => {
    if (contentSearch.hits.length > 0 && 'qAnswer' in contentSearch.hits[0]) {
      const twiml = new MessagingResponse();
      twiml.message("Thanks for using AskMS! We've already answered this one before: " + contentSearch.hits[0].qAnswer);
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    } else {
      // save the question to algolia
      index.addObject({
        qText: req.body.Body,
        qOrigin: req.body.From,
        qTopic: "Math"
      }, (err, content) => {

        // get Math Experts phone numbers
        var ref = db.ref("Math/Experts")
        ref.on("value", function (snapshot) {
          let numbers = Object.keys(snapshot.val())
          let amountOfNumbers = numbers.length
          let people = [numbers[Math.floor(Math.random() * amountOfNumbers)], numbers[Math.floor(Math.random() * amountOfNumbers)]]
          for (let number of new Set(people)) {
            // send each expert a message with the query
            client.messages.create({ from: '+19292039158', body: "Hi it's AskMS Math do you know the answer to this? Send back a response with question ID: OBJ" + content.objectID + ": " + req.body.Body, to: '+1' + number })
              .then(message => console.log(message.sid))
              .done();
          }
        }, function (errorObject) {
          console.log("failed to get algolia data")
        });
      });
      // send default reply
      const twiml = new MessagingResponse();
      twiml.message("Thanks for using AskMS! A Maths expert will reply as soon as possible!");
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    }
  })
});


app.post('/getExpert/MLH', (req, res) => {
  index.search({
    query: req.body.Body
  }, (err, contentSearch) => {
    if (contentSearch.hits.length > 0 && 'qAnswer' in contentSearch.hits[0]) {
      const twiml = new MessagingResponse();
      twiml.message("Thanks for using AskMS! We've already answered this one before: " + contentSearch.hits[0].qAnswer);
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    } else {
      // save the question to algolia
      index.addObject({
        qText: req.body.Body,
        qOrigin: req.body.From,
        qTopic: "MLH"
      }, (err, content) => {

        // get Math Experts phone numbers
        var ref = db.ref("Major League Hacking/Experts")
        ref.on("value", function (snapshot) {
          let numbers = Object.keys(snapshot.val())
          let amountOfNumbers = numbers.length
          let people = [numbers[Math.floor(Math.random() * amountOfNumbers)], numbers[Math.floor(Math.random() * amountOfNumbers)]]
          for (let number of new Set(people)) {
            // send each expert a message with the query
            client.messages.create({ from: '+19292039158', body: "Hi it's AskMS MLH do you know the answer to this? Send back a response with question ID: OBJ" + content.objectID + ": " + req.body.Body, to: '+1' + number })
              .then(message => console.log(message.sid))
              .done();
          }
        }, function (errorObject) {
          console.log("failed to get algolia data")
        });
      });
      // send default reply
      const twiml = new MessagingResponse();
      twiml.message("Thanks for using AskMS! An MLH expert will reply as soon as possible!");
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    }
  })
});


app.post('/giveResponse', (req, res) => {
  // save the question to algolia
  var myRe = new RegExp('OBJ[0-9]*');
  var myMatchArray = myRe.exec(req.body.Body);
  if (myMatchArray != null) {
    var objectID = myMatchArray[0].slice(3);
    index.getObject(objectID, ['qOrigin', 'qAnswer', 'qText', 'qTopic'], (err, answer) => {
      // send the requester a message with the response
      var message = req.body.Body.replace("OBJ" + objectID, "")

      index.search({
        query: answer.qText,
      }, (err, contentSearch) => {
        let filteredSearch = contentSearch.hits.filter(item => !('qAnswer' in item))
        let idList = filteredSearch.map(hit => hit.objectID)
        index.partialUpdateObjects(
          idList.map(item => {
            return ({
              objectID: item,
              qAnswer: message
            })
          }), false, (err, response) => { console.log("Algolia answer updated") })
      })

      if (answer.qTopic === "MLH"){
        client.messages.create({ from: '+13478481442', body: "Our MLH expert says: " + message, to: answer.qOrigin })
          .then(message => console.log(message.sid))
          .done();
      }else if (answer.qTopic === "Math"){
        client.messages.create({ from: '+12012980281', body: "Our Math expert says: " + message, to: answer.qOrigin })
          .then(message => console.log(message.sid))
          .done();
      }
      const twiml = new MessagingResponse();
      twiml.message("Thank you so much for that answer!");
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    })
  } else {
    const twiml = new MessagingResponse();
    twiml.message("Please include a question ID in your response");
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
});

if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
