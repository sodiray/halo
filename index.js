let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');

let Storage = require('node-storage');

let api = express();

api.set('port', 8058);

/*
*   Setup Logging
*/
api.use((req, res, next) => {
  console.log(req.method + ' from ' + req.hostname + req.originalUrl + ' @ ' + req.ip + ' via ' + req.protocol);
  next();
});

/*
*   Setup Error Handling
*/
api.use((req, res, next) => {
  try {
    next();
  } catch(error) {
    console.log(`Error: ${error.message}`);
    res.status(400);
    res.send({ code: 4000, message: error.message });
  }
});

api.use(bodyParser.json());

/*
*   Setup Storage & Service
*/
let store = new Storage('./settings');

let Halo = require('./halo');
let halo = new Halo(store);

api.get('/api/ping', (req, res) => res.send({ code: 2000, message: "pong" }));

api.get('/api/v1/kv/:key?', (req, res) => halo.getValue(req, res));
api.put('/api/v1/kv/:key?', (req, res) => halo.setValue(req, res));


/*
*   Setup 404 Response
*/
api.use((req, res, next) => {
  console.log(`Warning: Invalid endpoint`);
  res.status(404);
  res.send({ code: 4004, message: "Invalid endpoint" });
});

/*
*   Start Service
*/
api.listen(api.get('port'), function() {
  console.log('app running on port', api.get('port'));
});
