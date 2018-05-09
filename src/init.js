const fs = require('fs');
const yaml = require('js-yaml');

function initDataFromFile(store, file) {

  let value = null;
  let initFileName = `./init.d/${file}`;
  let initFile = null;

  try {
    initFile = fs.readFileSync(initFileName, 'utf8');
  } catch (error) {
    console.log(`INIT: No file found for ${initFileName}`);
    return;
  }

  try {
    value = JSON.parse(initFile);
    console.log(`INIT: Parsed ${initFileName} as json`);
  } catch(error) { }

  if (!value) {
    try {
      value = yaml.safeLoad(initFile);
      console.log(`INIT: Parsed ${initFileName} as yaml`);
    } catch (error) { }
  }

  if (!value) {
    console.log(`INIT: Failed to parse ${initFileName}`);
    return;
  }

  let key = process.env.HALO_INIT_KEY ?
    'halo.' + process.env.HALO_INIT_KEY :
    'halo';

  store.put(key, value);

  console.log(`INIT: Seeded store with data from ${initFileName}`);
}

function initDataFromDir(store) {

  store.put('halo', {});

  let initFiles = [];

  try {
    initFiles = fs.readdirSync('./init.d');
  } catch (error) {
    console.log('INIT: No init.d dir found');
    return;
  }

  initFiles.forEach(file => {
    initDataFromFile(store, file);
  });


}

module.exports = initDataFromDir;
