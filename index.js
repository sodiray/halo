
const Halo = require('./lib/halo');

exports.handler = async function(event, context, callback) {

  let method = event.httpMethod;
  let key = event.queryStringParameters ? event.queryStringParameters.key : null;
  let value = event.body ? JSON.parse(event.body).value : null;

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
      operation = () => { throw new Error(`ERROR: Http method (${method}) not supported. Only GET, PUT, and DELETE allowed.`); }
      break;
  }

  try {
    json = await operation(key, value);
  } catch (err) {
    return callback(null, {
      statusCode: 404,
      body: JSON.stringify({ 'message': err.message }),
      isBase64Encoded: false
    });
  }

  let response = {
    'message': 'Success',
    'code': 200
  };

  if (json) response['value'] = json;

  return callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(response),
    isBase64Encoded: false
  });

}
