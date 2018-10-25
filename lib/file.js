const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.getFile = (bucket, name) => {
  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket: bucket, Key: name }, (err, data) => {
      if (err) return reject(err);
      resolve(Buffer.from(data.Body).toString('utf8'));
    });
  });
};


exports.persistFile = (bucket, name, data) => {
  return new Promise((resolve, reject) => {
    s3.putObject({ Bucket: bucket, Key: name, Body: Buffer.from(JSON.stringify(data), 'utf8') }, (err, data) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
