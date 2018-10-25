
const Halo = require('./lib/halo');

exports.handler = async function(event, context, callback) {

  let method = event.httpMethod;
  let body = event.body;
  let key = event.queryStringParameters.key;

  let operation;
  let json;

  switch (method) {
    case 'GET':
      operation = Halo.getValue;
      break;
    case 'PUT':
      operation = Halo.setValue;
      break;
    case 'DELETE':
      operation = Halo.deleteValue;
      break;
    default:
      operation = () => { throw new Error(`ERROR: Http method (${method}) not supported. Only GET and PUT allowed.`); }
      break;
  }

  try {
    json = await operation(key, body);
    if (!json) throw new Error('Failed to produce valid result :shrug:');
  } catch (err) {
    return callback(err);
  }

  return callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(json),
    isBase64Encoded: false
  });

}
