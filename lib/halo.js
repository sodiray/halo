const Storage = require('./storage');
const File = require('./file');

const BUCKET_NAME = process.env.HALO_BUCKET_NAME;
const FILE_NAME = process.env.HALO_FILE_NAME;

exports.getValue = async function(key) {

  let config = await File.getFile(BUCKET_NAME, FILE_NAME);

  let result = new Storage(config).get(key);

  if (result == null)
    throw new Error(`Could not find value for given key (${key})`);

  return result;

};

exports.setValue = async function(key, value) {

  let config = await File.getFile(BUCKET_NAME, FILE_NAME);

  let result;
  try {
    result = new Storage(config).put(key, value);
  } catch (err) { } finally {
    if (!result) throw new Error(`Could not update key (${key}) with value`)
  }

  try {
    await File.persistFile(BUCKET_NAME, FILE_NAME, result);
  } catch (error) {
    console.error(error);
    throw new Error('Error while saving file back to s3 after alteration')
  }

  return new Storage(result).get(key);

}

exports.deleteValue = async function(key) {

  let result;

  let config = await File.getFile(BUCKET_NAME, FILE_NAME);

  try {
    result = new Storage(config).remove(key);
  } catch (err) {
    throw new Error(`Error while deleting key (${key}) - ${err.message}`);
  } finally {
    if (!result) throw new Error(`Error while deleting key (${key})`);
  }

  try {
    await File.persistFile(BUCKET_NAME, FILE_NAME, result);
  } catch (error) {
    console.error(error);
    throw new Error('Error while saving file back to s3 after alteration')
  }

  return null;

}
