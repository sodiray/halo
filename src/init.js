const fs = require('fs');
const yaml = require('js-yaml');

module.exports = function(store) {

  let value = null;
  let initFile = null;

  try {
    initFile = fs.readFileSync('./init.d', 'utf8');
  } catch (error) {
    console.log('INIT: No init file found');
    store.put('halo', {});
    return;
  }

  try {
    value = JSON.parse(initFile);
    console.log('INIT: Parsed init.d as json');
  } catch(error) { }

  if (!value) {
    try {
      value = yaml.safeLoad(initFile);
      console.log('INIT: Parsed init.d as yaml');
    } catch (error) { }
  }

  if (!value) {
    console.log("INIT: Failed to parse init.d");
    store.put('halo', {});
    return;
  }

  let key = process.env.HALO_INIT_KEY ?
    'halo.' + process.env.HALO_INIT_KEY :
    'halo';

  store.put(key, value);

  console.log("INIT: Seeded store with init.d data");

};
