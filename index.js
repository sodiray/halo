let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');

let Storage = require('node-storage');

let api = express();

api.set('port', 8055);

api.use((req, res, next) => {
  console.log(req.method + ' from ' + req.hostname + req.originalUrl + ' @ ' + req.ip + ' via ' + req.protocol);
  next();
});

api.use(bodyParser.json());

/*
*   Setup Storage & Service
*/
let store = new Storage('./settings');

let Halo = require('./halo');
let halo = new Halo(store);

api.get('/api/v1/kv/:key', (req, res) => halo.getValue(req, res));
api.put('/api/v1/kv/:key', (req, res) => halo.setValue(req, res));

/*
*   Start Service
*/
api.listen(api.get('port'), function() {
  console.log('app running on port', api.get('port'));
});
